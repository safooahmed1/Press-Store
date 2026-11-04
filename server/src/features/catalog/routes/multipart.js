import Busboy from 'busboy'
import { HttpError } from '../../../platform/http/responses.js'

const maximumBytes = 4 * 5 * 1024 * 1024 + 128 * 1024
const invalid = () => new HttpError(422, 'VALIDATION_FAILED', 'Invalid multipart catalog input')

/** Called only after authentication/origin checks. Bounded buffers; no file paths accepted. */
export async function catalogBody(req, res, next) {
  if (req.is('application/json')) { req.catalogInput = req.body; req.catalogUploads = []; return next() }
  if (!req.is('multipart/form-data')) return next(new HttpError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Use JSON or multipart form data'))
  try {
    const result = await new Promise((resolve, reject) => {
      let parser
      let settled = false
      let input
      let fields = 0
      let bytes = 0
      const uploads = []
      function finish(error) {
        if (settled) return
        settled = true
        req.off('aborted', aborted)
        req.off('data', count)
        if (error) {
          req.unpipe(parser)
          parser?.destroy()
          req.resume()
          reject(error)
        } else resolve({ input, uploads })
      }
      function aborted() { finish(invalid()) }
      function count(chunk) {
        bytes += chunk.length
        if (bytes > maximumBytes) finish(new HttpError(413, 'PAYLOAD_TOO_LARGE', 'Catalog upload is too large'))
      }
      try { parser = Busboy({ headers: req.headers, preservePath: true, limits: {
        files: 4, fileSize: 5 * 1024 * 1024 + 1, fields: 1, fieldSize: 64 * 1024, parts: 6,
      } }) } catch { reject(invalid()); return }
      parser.on('error', () => finish(invalid()))
      parser.on('field', (name, value, info) => {
        fields++
        if (name !== 'data' || info.valueTruncated || info.nameTruncated) return finish(invalid())
        try { input = JSON.parse(value) } catch { finish(invalid()) }
      })
      parser.on('file', (name, stream, info) => {
        const chunks = []
        if (name !== 'images' || !info.filename || info.filename.length > 255 || /[\\/]/.test(info.filename)) { stream.resume(); finish(invalid()); return }
        const index = uploads.length
        uploads.push(null)
        stream.on('limit', () => finish(new HttpError(413, 'PAYLOAD_TOO_LARGE', 'Catalog image is too large')))
        stream.on('error', () => finish(invalid()))
        stream.on('data', (chunk) => { if (!settled) chunks.push(chunk) })
        stream.on('end', () => { uploads[index] = { buffer: Buffer.concat(chunks), originalName: info.filename, contentType: info.mimeType } })
      })
      for (const event of ['filesLimit', 'fieldsLimit', 'partsLimit']) parser.on(event, () => finish(invalid()))
      parser.on('close', () => finish(fields === 1 && uploads.every(Boolean) ? null : invalid()))
      req.on('aborted', aborted)
      req.on('data', count)
      req.pipe(parser)
    })
    req.catalogInput = result.input
    req.catalogUploads = result.uploads
    next()
  } catch (error) { next(error) }
}
