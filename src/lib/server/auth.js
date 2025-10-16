import { env as privateEnv } from '$env/dynamic/private';

/**
 * Check if the current user is an admin
 */
export async function isAdmin(session) {
	if (!session || !session.user) {
		return false;
	}

    // Prefer Cloudflare runtime env when available, fallback to dynamic private env
    const adminEmail =
        (globalThis?.__cloudflare_env__ && globalThis.__cloudflare_env__.ADMIN_EMAIL) ||
        privateEnv.ADMIN_EMAIL;

    return session.user.email === adminEmail;
}

/**
 * Middleware to protect admin routes
 */
export async function requireAdmin(locals) {
	const session = await locals.getSession();

	if (!session) {
		throw new Error('Unauthorized');
	}

	if (!(await isAdmin(session))) {
		throw new Error('Forbidden: Admin access required');
	}

	return session;
}
