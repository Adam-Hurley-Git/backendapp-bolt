import crypto from 'crypto'

export function generateLicenseKey() {
  // Generate a secure license key in format: XXXX-XXXX-XXXX-XXXX
  const segments = []

  for (let i = 0; i < 4; i++) {
    const segment = crypto.randomBytes(2).toString('hex').toUpperCase()
    segments.push(segment)
  }

  return segments.join('-')
}

export function validateLicenseKey(licenseKey) {
  // Basic validation - check format
  const pattern = /^[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/
  return pattern.test(licenseKey)
}

export function generateApiKey() {
  // Generate a longer API key for server-to-server communication
  return 'sk_' + crypto.randomBytes(32).toString('hex')
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
  return { salt, hash }
}

export function verifyPassword(password, salt, hash) {
  const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
  return hash === verifyHash
}

export function generateSecureToken(length = 32) {
  return crypto.randomBytes(length).toString('hex')
}