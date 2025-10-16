import { ADMIN_EMAIL } from '$env/static/private';

/**
 * Check if the current user is an admin
 */
export async function isAdmin(session) {
	if (!session || !session.user) {
		return false;
	}

	return session.user.email === ADMIN_EMAIL;
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
