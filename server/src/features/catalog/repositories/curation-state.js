import { CatalogError } from '../services/catalog-input.js'
export async function lockCuration(tx) {
  const [row] = await tx.query('SELECT curation_version FROM catalog_curation_states WHERE state_id = 1 FOR UPDATE')
  if (!row) throw new Error('Catalog coordination unavailable')
  return row.curation_version
}
export async function advanceCuration(tx) {
  const result = await tx.query(`UPDATE catalog_curation_states SET curation_version = curation_version + 1
    WHERE state_id = 1 AND curation_version < 4294967295`)
  if (result.affectedRows !== 1) throw new CatalogError('EDIT_CONFLICT')
}
