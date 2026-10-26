import express from 'express'

const JSON_LIMIT = '64kb'
const FORM_LIMIT = '16kb'

/** Small global API limits; multipart uploads remain owned by the storage boundary. */
export function apiBodyParsers() {
  return [
    express.json({ limit: JSON_LIMIT, strict: true }),
    express.urlencoded({ extended: false, limit: FORM_LIMIT, parameterLimit: 100 }),
  ]
}
