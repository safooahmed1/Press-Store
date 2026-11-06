import { HomepageError } from '../services/homepage-input.js'
const columns = 'hero_slide_id, image_path, title, subtitle, button_text, button_link, is_active, display_order, version'
async function lock(tx) {
  const [state] = await tx.query('SELECT state_id FROM homepage_states WHERE state_id = 1 FOR UPDATE')
  if (!state) throw new Error('Homepage coordination unavailable')
}
async function activeCount(tx, exclude = '0') {
  const [row] = await tx.query('SELECT COUNT(*) AS count FROM hero_slides WHERE is_active = TRUE AND hero_slide_id <> ?', [exclude])
  return Number(row.count)
}
export function createHomepageRepository(database) {
  return Object.freeze({
    async projection() {
      return database.transaction(async (tx) => ({
        slides: await tx.query(`SELECT ${columns} FROM hero_slides WHERE is_active = TRUE ORDER BY display_order, hero_slide_id LIMIT 4`),
        banners: await tx.query('SELECT placement, text, is_active, version FROM promotion_banners'),
      }))
    },
    async slides(filters) {
      return database.transaction(async (tx) => {
        const [row] = await tx.query('SELECT COUNT(*) AS total FROM hero_slides')
        const slides = await tx.query(`SELECT ${columns} FROM hero_slides ORDER BY display_order, hero_slide_id LIMIT ? OFFSET ?`,
          [filters.pageSize, (filters.page - 1) * filters.pageSize])
        return { slides, total: Number(row.total) }
      })
    },
    async slide(id) {
      const [row] = await database.query(`SELECT ${columns} FROM hero_slides WHERE hero_slide_id = ?`, [id])
      if (!row) throw new HomepageError('HERO_NOT_FOUND')
      return row
    },
    async writeSlide(id, input, imagePath) {
      return database.transaction(async (tx) => {
        await lock(tx)
        let current
        if (id) {
          [current] = await tx.query(`SELECT ${columns} FROM hero_slides WHERE hero_slide_id = ? FOR UPDATE`, [id])
          if (!current) throw new HomepageError('HERO_NOT_FOUND')
          if (current.version !== input.version) throw new HomepageError('EDIT_CONFLICT')
        }
        const active = await activeCount(tx, id ?? '0') + Number(input.isActive)
        if (active < 1 || active > 3) throw new HomepageError('HERO_ACTIVE_LIMIT')
        const values = [input.title, input.subtitle, input.buttonText, input.buttonLink, input.isActive, input.displayOrder,
          imagePath ?? current?.image_path]
        let resourceId = id
        if (id) await tx.query(`UPDATE hero_slides SET title = ?, subtitle = ?, button_text = ?, button_link = ?, is_active = ?,
          display_order = ?, image_path = ?, version = version + 1, updated_at = UTC_TIMESTAMP(6) WHERE hero_slide_id = ?`, [...values, id])
        else {
          await tx.query(`INSERT INTO hero_slides (title, subtitle, button_text, button_link, is_active, display_order, image_path,
            version, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 1, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6))`, values)
          const [row] = await tx.query('SELECT CAST(LAST_INSERT_ID() AS CHAR) AS id')
          resourceId = row.id
        }
        return { resourceId, version: id ? input.version + 1 : 1,
          obsoletePaths: imagePath && current ? [current.image_path] : [] }
      })
    },
    async deleteSlide(id, expectedVersion) {
      return database.transaction(async (tx) => {
        await lock(tx)
        const [current] = await tx.query(`SELECT ${columns} FROM hero_slides WHERE hero_slide_id = ? FOR UPDATE`, [id])
        if (!current) throw new HomepageError('HERO_NOT_FOUND')
        if (current.version !== expectedVersion) throw new HomepageError('EDIT_CONFLICT')
        if (await activeCount(tx, id) < 1) throw new HomepageError('HERO_ACTIVE_LIMIT')
        await tx.query('DELETE FROM hero_slides WHERE hero_slide_id = ?', [id])
        return { obsoletePaths: [current.image_path] }
      })
    },
    async banners() { return database.query('SELECT placement, text, is_active, version FROM promotion_banners ORDER BY placement') },
    async writeBanner(slot, input) {
      try {
        return await database.transaction(async (tx) => {
          if (input.version === 0) await tx.query(`INSERT INTO promotion_banners (placement, text, is_active, version, created_at, updated_at)
            VALUES (?, ?, ?, 1, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6))`, [slot, input.text, input.isActive])
          else {
            const result = await tx.query(`UPDATE promotion_banners SET text = ?, is_active = ?, version = version + 1,
              updated_at = UTC_TIMESTAMP(6) WHERE placement = ? AND version = ?`, [input.text, input.isActive, slot, input.version])
            if (result.affectedRows !== 1) throw new HomepageError('EDIT_CONFLICT')
          }
          return { resourceId: slot, version: input.version + 1 }
        })
      } catch (error) {
        if (input.version === 0 && error.code === 'DB_CONSTRAINT_FAILED') throw new HomepageError('EDIT_CONFLICT')
        throw error
      }
    },
  })
}
