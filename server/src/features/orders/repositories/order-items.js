export async function readOrderItems(database, orderId) {
  const rows = await database.query(`
    SELECT position, product_id AS productId, variant_id AS variantId, product_name AS productName,
      color, size, quantity, base_unit_price_minor AS baseUnitPriceMinor,
      final_unit_price_minor AS finalUnitPriceMinor, discount_percent AS discountPercent,
      line_subtotal_minor AS lineSubtotalMinor, line_total_minor AS lineTotalMinor,
      line_discount_minor AS lineDiscountMinor
    FROM order_items WHERE order_id = ? ORDER BY position`, [orderId])
  return rows.map((row) => ({ ...row, baseUnitPriceMinor: Number(row.baseUnitPriceMinor),
    finalUnitPriceMinor: Number(row.finalUnitPriceMinor), discountPercent: Number(row.discountPercent),
    lineSubtotalMinor: Number(row.lineSubtotalMinor), lineTotalMinor: Number(row.lineTotalMinor),
    lineDiscountMinor: Number(row.lineDiscountMinor) }))
}
