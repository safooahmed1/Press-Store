import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { after, before, describe, it } from 'node:test'
import sharp from 'sharp'
import { startServer } from '../../../app/start-server.js'
import { createDatabase } from '../../../platform/db/database.js'
import { DatabaseError } from '../../../platform/db/database-error.js'
import { loadMigrations } from '../../../platform/db/migration-files.js'
import { runMigrations } from '../../../platform/db/migrate.js'
import { startDisposableMysql } from '../../../platform/db/testing/disposable-mysql.js'
import { localDatabaseTestsEnabled } from '../../../config/database-config.js'
import { createSessionService } from '../../../platform/auth/sessions.js'
import { createSessionRepository } from '../../../platform/auth/session-repository.js'
import { createLogger } from '../../../platform/observability/logger.js'
import { createImageStorage } from '../../../platform/storage/image-storage.js'
import { startTestApp } from '../../../../../tests/helpers/http-server.js'
import { createCatalogRepository } from '../../catalog/repositories/catalog.js'
import { createAdminCatalogRepository } from '../../catalog/repositories/admin-catalog.js'
import { createAdminCatalogService } from '../../catalog/services/admin-catalog.js'
import { productInput } from '../../catalog/services/catalog-input.js'
import { createHomepageRouters } from './homepage-routes.js'
const hero = (extra = {}) => ({ title: 'New drop', subtitle: 'Everyday layers', buttonText: 'Shop', buttonLink: '/products', isActive: true, displayOrder: 1, ...extra })

describe('homepage isolated MySQL content, curation and security', {
  skip: !localDatabaseTestsEnabled() && 'Requires newly created disposable MySQL fixtures only',
}, () => {
  let fixture, database, server, root, origin, png, adminCookie, customerCookie, token, firstId, categoryId, brandId
  const ids = [], logs = []
  const logger = createLogger({ environment: 'test', sink: (line) => logs.push(JSON.parse(line)) })
  const product = (extra = {}) => ({ name: 'Jacket', description: 'Cotton', categoryId, brandId, priceMinor: 101, discountPercent: 50,
    variants: [{ color: 'Black', size: 'M' }], bestSeller: false, newArrival: false, ...extra })
  async function start() {
    server = await startServer({ config: { nodeEnv: 'test', port: 0 }, databaseConfig: fixture.config,
      databaseFactory: () => database, storageConfig: { root }, logger })
    origin = `http://127.0.0.1:${server.address().port}`
  }
  async function stop() { if (server) { server.closeAllConnections(); if (server.listening) await new Promise((resolve) => server.close(resolve)); server = null } }
  before(async () => {
    fixture = await startDisposableMysql()
    database = createDatabase(fixture.config)
    root = await mkdtemp(path.join(tmpdir(), 'press-home001-images-'))
    const migrations = await loadMigrations()
    await runMigrations({ config: fixture.config, migrations: migrations.filter(({ name }) => name < 'cat_005_add_curation_revision.sql') })
    await runMigrations({ config: fixture.config, migrations })
    await runMigrations({ config: fixture.config, migrations })
    const now = new Date()
    await database.query('INSERT INTO admins (admin_id, phone, password_hash, created_at, updated_at) VALUES (1, ?, ?, ?, ?)', ['+201012345678','synthetic hash',now,now])
    await database.query('INSERT INTO customers (first_name,last_name,phone,password_hash,created_at,updated_at) VALUES (?,?,?,?,?,?)', ['Test','Customer','+201112345678','synthetic hash',now,now])
    const [customer] = await database.query('SELECT customer_id FROM customers')
    const sessions = createSessionService({ repository: createSessionRepository(database) })
    token = (await sessions.create({ actorType: 'admin', actorId: '1' })).token
    adminCookie = `press-admin=${token}`
    customerCookie = `press-customer=${(await sessions.create({ actorType: 'customer', actorId: customer.customer_id })).token}`
    const repository = createCatalogRepository(database)
    categoryId = (await repository.createClassification('category','Clothing',`${randomUUID()}.png`)).id
    brandId = (await repository.createClassification('brand','Press')).id
    for (let i = 0; i < 10; i++) {
      const { bestSeller, newArrival, ...core } = product({ name: `Product ${i}`, variants: [{ color: 'Black', size: 'M', isAvailable: i !== 9 }] })
      assert.equal(bestSeller || newArrival, false)
      ids.push((await repository.createProduct(productInput(core), [`${randomUUID()}.png`])).productId)
    }
    png = await sharp({ create: { width: 3, height: 3, channels: 3, background: '#ff0000' } }).png().toBuffer()
    await start()
  })
  after(async () => { try { await stop() } finally { try { await database?.close() } finally { try { await fixture?.stop() } finally { if (root) await rm(root,{recursive:true,force:true}) } } } })
  function form(input, uploads) {
    const body = new FormData(); body.append('data', JSON.stringify(input))
    uploads.forEach((bytes) => body.append('images',new Blob([bytes],{type:'image/png'}),'hero.png')); return body
  }
  async function request(route, method = 'GET', input, uploads, options = {}) {
    const response = await fetch(`${origin}/api/v1${route}`, { method, headers: {
      ...(options.cookie === null ? {} : { Cookie: options.cookie ?? adminCookie }),
      ...(method === 'GET' ? {} : { Origin: options.origin ?? origin }),
      ...(!uploads && input !== undefined ? { 'Content-Type': 'application/json' } : {}), ...options.headers,
    }, body: uploads ? form(input, uploads) : input === undefined ? undefined : JSON.stringify(input) })
    assert.equal(response.headers.get('set-cookie'), null)
    return { status: response.status, body: await response.json(), response }
  }
  async function ok(route, method, input, uploads) {
    const result = await request(route,method,input,uploads)
    assert.ok([200,201].includes(result.status), JSON.stringify(result.body)); return result.body.data
  }
  const publicHome = () => ok('/homepage')
  const selection = () => ok('/admin/homepage/curation')
  const slide = () => ok(`/admin/homepage/hero-slides/${firstId}`)
  it('reports unconfigured homepage and blocks bad scope/origin/CTA before image writes', async () => {
    assert.equal((await request('/homepage','GET',undefined,undefined,{cookie:null})).body.error.code,'HOMEPAGE_UNAVAILABLE')
    assert.equal((await request('/admin/homepage','GET',undefined,undefined,{cookie:null})).status,401)
    assert.equal((await request('/admin/homepage','GET',undefined,undefined,{cookie:customerCookie})).status,403)
    assert.equal((await request('/admin/homepage','GET',undefined,undefined,{cookie:`${adminCookie}; ${customerCookie}`})).status,200)
    assert.equal((await request('/admin/homepage/hero-slides','POST',hero(),[png],{origin:'https://evil.test'})).status,403)
    assert.equal((await request('/admin/homepage/hero-slides','POST',hero({buttonLink:'//evil.test'}),[png])).status,422)
    assert.equal((await request('/admin/homepage/hero-slides','POST',hero({isActive:false}),[png])).body.error.code,'HERO_ACTIVE_LIMIT')
    assert.equal((await request('/admin/homepage/hero-slides','POST',hero(),[Buffer.from('fake image')])).status,422)
    assert.deepEqual(await readdir(root),[])
  })
  it('creates the initial active hero, orders a safe public projection and protects its last active slide', async () => {
    const created = await ok('/admin/homepage/hero-slides','POST',hero({buttonLink:`/products?categoryId=${categoryId}`}),[png])
    firstId = created.resourceId
    assert.equal(created.version,1)
    const home = await publicHome()
    assert.deepEqual(Object.keys(home),['heroSlides','bestSellers','banner1','categories','banner2','newArrivals'])
    assert.equal(home.heroSlides.length,1); assert.equal(home.banner1,null); assert.equal(home.banner2,null)
    assert.equal(home.categories[0].categoryId,categoryId)
    assert.doesNotMatch(JSON.stringify(home),/image_path|password|version|isActive|obsoletePaths/)
    assert.equal((await request(`/admin/homepage/hero-slides/${firstId}`,'DELETE',{version:1})).body.error.code,'HERO_ACTIVE_LIMIT')
    assert.equal((await request(`/admin/homepage/hero-slides/${firstId}`,'PUT',hero({version:1,isActive:false}))).body.error.code,'HERO_ACTIVE_LIMIT')
    assert.equal((await ok('/admin/homepage/hero-slides?pageSize=1')).items.length,1)
  })
  it('allows at most three active slides under concurrent creation and preserves version conflicts', async () => {
    const second = await ok('/admin/homepage/hero-slides','POST',hero({displayOrder:0}),[png])
    const files = (await readdir(root)).length
    const results = await Promise.all([request('/admin/homepage/hero-slides','POST',hero(),[png]),request('/admin/homepage/hero-slides','POST',hero(),[png])])
    assert.deepEqual(results.map(({status})=>status).sort(),[201,409])
    assert.equal((await readdir(root)).length,files+1)
    assert.equal((await publicHome()).heroSlides[0].slideId,second.resourceId)
    const third = results.find(({status})=>status===201).body.data
    const edits = await Promise.all([request(`/admin/homepage/hero-slides/${firstId}`,'PUT',hero({version:1,title:'One'})),request(`/admin/homepage/hero-slides/${firstId}`,'PUT',hero({version:1,title:'Two'}))])
    assert.deepEqual(edits.map(({status})=>status).sort(),[200,409])
    await ok(`/admin/homepage/hero-slides/${second.resourceId}`,'DELETE',{version:1})
    await ok(`/admin/homepage/hero-slides/${third.resourceId}`,'PUT',hero({version:1,isActive:false}))
    await ok(`/admin/homepage/hero-slides/${third.resourceId}`,'DELETE',{version:2})
    assert.equal((await publicHome()).heroSlides.length,1)
  })
  it('rolls back image updates on a later DB failure and cleans only obsolete committed files', async (t) => {
    const current = await slide(); const files = (await readdir(root)).sort()
    const broken = { query:(...args)=>database.query(...args), transaction:(work)=>database.transaction((tx)=>work({query:async(sql,values)=>{
      const result=await tx.query(sql,values); if(sql.startsWith('UPDATE hero_slides')) throw new DatabaseError('DB_QUERY_FAILED'); return result
    }})) }
    const routers = createHomepageRouters({database:broken,config:{nodeEnv:'test'},storageConfig:{root}})
    const app = await startTestApp(t,{manifests:[{id:'homepage-admin',path:'/admin/homepage',router:routers.admin}]})
    const failed = await fetch(`${app.origin}/api/v1/admin/homepage/hero-slides/${firstId}`,{method:'PUT',headers:{Cookie:adminCookie,Origin:app.origin},body:form(hero({version:current.version}),[png])})
    assert.equal(failed.status,500); assert.equal((await failed.json()).error.code,'INTERNAL_ERROR')
    assert.deepEqual((await readdir(root)).sort(),files); assert.deepEqual(await slide(),current)
    await ok(`/admin/homepage/hero-slides/${firstId}`,'PUT',hero({version:current.version}),[png])
    const updated=await slide(); assert.notEqual(updated.imageUrl,current.imageUrl)
    assert.equal((await readdir(root)).includes(current.imageUrl.split('/').at(-1)),false)
    assert.ok((await readFile(path.join(root,updated.imageUrl.split('/').at(-1)))).length)
    const committed=(await readdir(root)).sort()
    assert.equal((await request(`/admin/homepage/hero-slides/${firstId}`,'PUT',hero({version:current.version}),[png])).status,409)
    assert.equal((await request('/admin/homepage/hero-slides','POST',hero(),[png,png])).status,422)
    assert.deepEqual((await readdir(root)).sort(),committed)
  })
  it('versions both fixed banner slots and returns null when either is inactive', async () => {
    await ok('/admin/homepage/banners/banner_1','PUT',{text:'Pickup in store',isActive:true,version:0})
    await ok('/admin/homepage/banners/banner_2','PUT',{text:'New collection',isActive:true,version:0})
    assert.deepEqual((await publicHome()).banner1,{text:'Pickup in store'})
    for(const slot of ['banner_1','banner_2']) await ok(`/admin/homepage/banners/${slot}`,'PUT',{text:'Hidden',isActive:false,version:1})
    const home=await publicHome(); assert.equal(home.banner1,null); assert.equal(home.banner2,null)
    assert.equal((await request('/admin/homepage/banners/banner_3','PUT',{text:'Bad',isActive:true,version:0})).status,422)
    assert.equal((await request('/admin/homepage/banners/banner_1','PUT',{text:'Stale',isActive:true,version:1})).status,409)
    const results=await Promise.all([request('/admin/homepage/banners/banner_2','PUT',{text:'A',isActive:false,version:2}),request('/admin/homepage/banners/banner_2','PUT',{text:'B',isActive:false,version:2})])
    assert.deepEqual(results.map(({status})=>status).sort(),[200,409])
  })
  it('replaces complete CAT lists atomically, rejects ninth/missing/duplicate IDs and detects competing writers', async () => {
    let state=await selection()
    await ok('/admin/homepage/curation/best-sellers','PUT',{version:state.version,productIds:ids.slice(0,8)})
    assert.equal((await publicHome()).bestSellers.length,8)
    state=await selection()
    assert.equal((await request('/admin/homepage/curation/best-sellers','PUT',{version:state.version,productIds:ids.slice(0,9)})).body.error.code,'CURATED_LIMIT')
    assert.equal((await request('/admin/homepage/curation/best-sellers','PUT',{version:state.version,productIds:['999999']})).status,404)
    assert.equal((await request('/admin/homepage/curation/best-sellers','PUT',{version:state.version,productIds:[ids[0],ids[0]]})).status,422)
    assert.deepEqual(await selection(),state)
    const results=await Promise.all([request('/admin/homepage/curation/best-sellers','PUT',{version:state.version,productIds:[ids[0]]}),request('/admin/homepage/curation/best-sellers','PUT',{version:state.version,productIds:[ids[1]]})])
    assert.deepEqual(results.map(({status})=>status).sort(),[200,409])
    assert.equal((await selection()).bestSellerProductIds.length,1)
  })
  it('coordinates legacy CAT flag/create/update/delete writes with list revision and hides unavailable choices', async () => {
    const service=createAdminCatalogService({repository:createAdminCatalogRepository(database),storage:createImageStorage({root})})
    const upload={buffer:png,originalName:'product.png',contentType:'image/png'}
    const initial=await selection()
    const [row]=await database.query('SELECT version FROM products WHERE product_id = ?',[ids[8]])
    await service.setFlags(ids[8],{version:row.version,bestSeller:true,newArrival:true})
    assert.equal((await request('/admin/homepage/curation/best-sellers','PUT',{version:initial.version,productIds:[]})).status,409)
    let revision=(await selection()).version
    const created=await service.writeProduct(null,product({bestSeller:true}),[upload])
    assert.equal((await selection()).version,revision+1);revision++
    const updated=await service.writeProduct(created.productId,product({version:created.version,bestSeller:false}),[])
    assert.equal((await selection()).version,revision+1);revision++
    const flagged=await service.setFlags(created.productId,{version:updated.version,bestSeller:true,newArrival:false})
    assert.equal((await selection()).version,revision+1);revision++
    await service.deleteProduct(created.productId,flagged.version)
    assert.equal((await selection()).version,revision+1)
    const state=await selection()
    await ok('/admin/homepage/curation/best-sellers','PUT',{version:state.version,productIds:[ids[0],ids[9]]})
    assert.equal((await selection()).bestSellerProductIds.length,2)
    assert.equal((await publicHome()).bestSellers.length,1)
    const [unavailable]=await database.query('SELECT version FROM products WHERE product_id = ?',[ids[9]])
    await service.deleteProduct(ids[9],unavailable.version)
    assert.deepEqual((await selection()).bestSellerProductIds,[ids[0]])
  })
  it('rolls back all list flags/revision on injected mid-update failure', async (t) => {
    const state=await selection()
    const broken={query:(...args)=>database.query(...args),transaction:(work)=>database.transaction((tx)=>work({query:async(sql,values)=>{
      const result=await tx.query(sql,values);if(sql.startsWith('UPDATE products SET is_best_seller'))throw new DatabaseError('DB_QUERY_FAILED');return result
    }}))}
    const routers=createHomepageRouters({database:broken,config:{nodeEnv:'test'},storageConfig:{root}})
    const app=await startTestApp(t,{manifests:[{id:'homepage-admin',path:'/admin/homepage',router:routers.admin}]})
    const response=await fetch(`${app.origin}/api/v1/admin/homepage/curation/best-sellers`,{method:'PUT',headers:{Cookie:adminCookie,Origin:app.origin,'Content-Type':'application/json'},body:JSON.stringify({version:state.version,productIds:[ids[3]]})})
    assert.equal(response.status,500);assert.equal((await response.json()).error.code,'INTERNAL_ERROR');assert.deepEqual(await selection(),state)
  })
  it('persists content/curation across actual server/pool recreation without re-provisioning', async () => {
    const before=await publicHome();const selected=await selection()
    await stop();await database.close();database=createDatabase(fixture.config);await start()
    assert.deepEqual(await publicHome(),before);assert.deepEqual(await selection(),selected)
    assert.doesNotMatch(JSON.stringify(logs),new RegExp(`${token}|password_hash|image_path|synthetic hash`))
  })
  it('uses production Origin independent of Host and fails closed on expired sessions', async (t) => {
    const banner=(await ok('/admin/homepage/banners')).items.find((row)=>row.placement==='banner_1')
    const routers=createHomepageRouters({database,config:{nodeEnv:'production'},appOrigin:'https://store.test',storageConfig:{root}})
    const app=await startTestApp(t,{manifests:[{id:'homepage-admin',path:'/admin/homepage',router:routers.admin}]})
    async function put(originHeader) { return fetch(`${app.origin}/api/v1/admin/homepage/banners/banner_1`,{method:'PUT',headers:{Cookie:`__Host-press-admin=${token}`,Origin:originHeader,'X-Forwarded-Host':'evil.test','Content-Type':'application/json'},body:JSON.stringify({text:'Configured origin',isActive:false,version:banner.version})}) }
    assert.equal((await put(app.origin)).status,403);assert.equal((await put('https://store.test')).status,200)
    await database.query("UPDATE sessions SET created_at = ?, last_seen_at = ?, expires_at = ? WHERE actor_type = 'admin'",[new Date('2019-01-01'),new Date('2019-01-01'),new Date('2020-01-01')])
    assert.equal((await request('/admin/homepage')).status,401)
    assert.equal((await request('/homepage','GET',undefined,undefined,{cookie:null})).status,200)
  })
})
