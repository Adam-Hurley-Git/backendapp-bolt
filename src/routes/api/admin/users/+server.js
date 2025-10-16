import { json } from '@sveltejs/kit';
import { db } from '$lib/server/supabase';
import { requireAdmin } from '$lib/server/auth';

/**
 * GET /api/admin/users
 * Get all users (admin only)
 */
export async function GET({ locals, url }) {
	try {
		// Check admin authentication
		await requireAdmin(locals);

		const limit = parseInt(url.searchParams.get('limit') || '50');
		const offset = parseInt(url.searchParams.get('offset') || '0');

		const users = await db.getAllUsers(limit, offset);

		return json({
			success: true,
			users,
			pagination: {
				limit,
				offset
			}
		});
	} catch (error) {
		if (error.message === 'Unauthorized') {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}
		if (error.message.includes('Forbidden')) {
			return json({ error: 'Forbidden: Admin access required' }, { status: 403 });
		}
		console.error('Admin users list error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}
