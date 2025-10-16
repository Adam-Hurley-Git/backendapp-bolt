/**
 * Generate a UUID v4 using Web Crypto API (Cloudflare Workers compatible)
 * @returns {string} UUID v4 string
 */
function generateUUID() {
	// Use crypto.randomUUID() if available (modern browsers and Workers)
	if (typeof crypto !== 'undefined' && crypto.randomUUID) {
		return crypto.randomUUID();
	}

	// Fallback implementation using crypto.getRandomValues()
	const bytes = new Uint8Array(16);
	crypto.getRandomValues(bytes);

	// Set version (4) and variant bits
	bytes[6] = (bytes[6] & 0x0f) | 0x40;
	bytes[8] = (bytes[8] & 0x3f) | 0x80;

	// Convert to hex string with dashes
	const hex = Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');

	return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20)}`;
}

/**
 * Generate a unique license key
 * Format: XXXX-XXXX-XXXX-XXXX
 */
export function generateLicenseKey() {
	const uuid = generateUUID().replace(/-/g, '').toUpperCase();

	// Format as XXXX-XXXX-XXXX-XXXX
	return `${uuid.substring(0, 4)}-${uuid.substring(4, 8)}-${uuid.substring(8, 12)}-${uuid.substring(12, 16)}`;
}

/**
 * Validate license key format
 * @param {string} licenseKey
 * @returns {boolean}
 */
export function validateLicenseKeyFormat(licenseKey) {
	const pattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
	return pattern.test(licenseKey);
}
