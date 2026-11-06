import { HomepageError, heroInput, bannerInput, placement, identity, version } from './homepage-input.js'

export function createHomepageService({ repository, catalog, storage }) {
  function slide(row, publicView = false) {
    const data = heroInput({ title: row.title, subtitle: row.subtitle, buttonText: row.button_text,
      buttonLink: row.button_link, isActive: Boolean(row.is_active), displayOrder: row.display_order })
    const { isActive, ...safe } = data
    return { slideId: row.hero_slide_id, imageUrl: storage.urlFor(row.image_path), ...safe,
      ...(publicView ? {} : { isActive, version: row.version }) }
  }
  async function cleanup(paths) {
    let pending = false
    for (const path of paths) { try { await storage.delete(path) } catch { pending = true } }
    return pending
  }
  return Object.freeze({
    async publicHomepage() {
      try {
        const [home, products] = await Promise.all([repository.projection(), catalog.read()])
        if (home.slides.length < 1 || home.slides.length > 3) throw new Error('Hero configuration unavailable')
        const banner = (slot) => {
          const row = home.banners.find((entry) => entry.placement === slot)
          return row?.is_active ? { text: bannerInput({ text: row.text, isActive: true, version: row.version }).text } : null
        }
        return { heroSlides: home.slides.map((row) => slide(row, true)), bestSellers: products.bestSellers,
          banner1: banner('banner_1'), categories: products.categories, banner2: banner('banner_2'), newArrivals: products.newArrivals }
      } catch { throw new HomepageError('HOMEPAGE_UNAVAILABLE') }
    },
    async listSlides(filters) {
      const result = await repository.slides(filters)
      if (!Number.isSafeInteger(result.total)) throw new Error('Invalid homepage count')
      return { items: result.slides.map((row) => slide(row)), total: result.total }
    },
    async slide(id) { identity(id); return slide(await repository.slide(id)) },
    async banners() {
      return (await repository.banners()).map((row) => ({ placement: row.placement, text: row.text, isActive: Boolean(row.is_active), version: row.version }))
    },
    async selections() {
      const result = await catalog.read()
      return { version: result.version, bestSellerProductIds: result.bestSellerProductIds, newArrivalProductIds: result.newArrivalProductIds }
    },
    async writeSlide(id, input, uploads) {
      if (id) identity(id)
      const validated = heroInput(input, Boolean(id))
      if (uploads.length > 1 || !id && uploads.length !== 1) throw new HomepageError('IMAGE_LIMIT_EXCEEDED')
      const operation = (path) => repository.writeSlide(id, validated, path)
      const result = uploads.length ? await storage.withCompensation(uploads[0], (image) => operation(image.path)) : await operation()
      const { obsoletePaths, ...safe } = result
      return { ...safe, cleanupPending: await cleanup(obsoletePaths) }
    },
    async deleteSlide(id, expectedVersion) {
      identity(id); version(expectedVersion)
      const result = await repository.deleteSlide(id, expectedVersion)
      return { cleanupPending: await cleanup(result.obsoletePaths) }
    },
    async writeBanner(slot, input) { return repository.writeBanner(placement(slot), bannerInput(input)) },
    async replaceSelection(kind, input) { return catalog.replace(kind, input) },
  })
}
