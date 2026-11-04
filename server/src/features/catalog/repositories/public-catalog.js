// SQL DECIMAL arithmetic preserves the exact CAT-DEC-003 half-up final-unit rule.
const finalPriceSql = 'FLOOR((p.price_minor * (10000 - p.discount_percent * 100) + 5000) / 10000)'

function conditions(filters) {
  const clauses = ['p.deleted_at IS NULL']
  const values = []
  for (const [key, column] of [['categoryId', 'category_id'], ['brandId', 'brand_id']]) {
    if (filters[key] !== undefined) { clauses.push(`p.${column} = ?`); values.push(filters[key]) }
  }
  for (const [key, comparison] of [['minPriceMinor', '>='], ['maxPriceMinor', '<=']]) {
    if (filters[key] !== undefined) { clauses.push(`${finalPriceSql} ${comparison} ?`); values.push(filters[key]) }
  }
  if (filters.color !== undefined || filters.size !== undefined) {
    const variant = ['v.product_id = p.product_id', 'v.is_available = TRUE']
    for (const key of ['color', 'size']) {
      if (filters[key] !== undefined) { variant.push(`v.${key} = ?`); values.push(filters[key]) }
    }
    clauses.push(`EXISTS (SELECT 1 FROM product_variants v WHERE ${variant.join(' AND ')})`)
  }
  return { sql: clauses.join(' AND '), values }
}

const summaryColumns = `p.product_id AS productId, p.name, p.price_minor AS priceMinor,
  p.discount_percent AS discountPercent, i.image_path AS mainImagePath`

async function variants(tx, rows) {
  if (!rows.length) return []
  return tx.query(`SELECT variant_id AS variantId, product_id AS productId, color, size
    FROM product_variants WHERE is_available = TRUE AND product_id IN (${rows.map(() => '?').join(',')})
    ORDER BY variant_id`, rows.map(({ productId }) => productId))
}

export function createPublicCatalogRepository(database) {
  return Object.freeze({
    async list(filters) {
      const where = conditions(filters)
      return database.transaction(async (tx) => {
        const [count] = await tx.query(`SELECT COUNT(*) AS total FROM products p WHERE ${where.sql}`, where.values)
        const rows = await tx.query(`SELECT ${summaryColumns} FROM products p
          LEFT JOIN product_images i ON i.product_id = p.product_id AND i.slot = 0
          WHERE ${where.sql} ORDER BY p.product_id LIMIT ? OFFSET ?`,
        [...where.values, filters.pageSize, (filters.page - 1) * filters.pageSize])
        return { rows, variants: await variants(tx, rows), total: count.total }
      })
    },
    async detail(productId) {
      return database.transaction(async (tx) => {
        const [row] = await tx.query(`SELECT ${summaryColumns}, p.description,
          p.category_id AS categoryId, c.name AS categoryName, p.brand_id AS brandId, b.name AS brandName
          FROM products p JOIN categories c ON c.category_id = p.category_id
          JOIN brands b ON b.brand_id = p.brand_id
          LEFT JOIN product_images i ON i.product_id = p.product_id AND i.slot = 0
          WHERE p.product_id = ? AND p.deleted_at IS NULL`, [productId])
        if (!row) return null
        const images = await tx.query(`SELECT image_path AS imagePath, slot FROM product_images
          WHERE product_id = ? ORDER BY slot`, [productId])
        return { row, images, variants: await variants(tx, [row]) }
      })
    },
    async classifications(kind, filters) {
      // Closed identifiers; caller input never becomes an identifier.
      if (!['category', 'brand'].includes(kind)) throw new TypeError('Invalid classification kind')
      const table = kind === 'category' ? 'categories' : 'brands'
      const key = kind === 'category' ? 'category_id' : 'brand_id'
      return database.transaction(async (tx) => {
        const [count] = await tx.query(`SELECT COUNT(*) AS total FROM ${table}`)
        const rows = await tx.query(`SELECT ${key} AS id, name${kind === 'category' ? ', image_path AS imagePath' : ''}
          FROM ${table} ORDER BY ${key} LIMIT ? OFFSET ?`, [filters.pageSize, (filters.page - 1) * filters.pageSize])
        return { rows, total: count.total }
      })
    },
  })
}
