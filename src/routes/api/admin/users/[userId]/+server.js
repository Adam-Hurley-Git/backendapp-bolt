import { json } from '@sveltejs/kit';
import { db } from '$lib/server/supabase';
import { requireAdmin } from '$lib/server/auth';

/**
 * GET /api/admin/users/[userId]
 * Get detailed user information (admin only)
 */
export async function GET({ params, locals }) {
	try {
		// Check admin authentication
		const session = await requireAdmin(locals);

		const { userId } = params;

		if (!userId) {
			return json({ error: 'User ID is required' }, { status: 400 });
		}

		const user = await db.getUserWithSubscription(userId);

		if (!user) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		return json({
			success: true,
			user
		});
	} catch (error) {
		if (error.message === 'Unauthorized') {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}
		if (error.message.includes('Forbidden')) {
			return json({ error: 'Forbidden: Admin access required' }, { status: 403 });
		}
		console.error('Admin user detail error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}

/**
 * PATCH /api/admin/users/[userId]
 * Update user information (admin only)
 */
export async function PATCH({ params, request, locals }) {
	try {
		// Check admin authentication
		const session = await requireAdmin(locals);

		const { userId } = params;
		const updates = await request.json();

		if (!userId) {
			return json({ error: 'User ID is required' }, { status: 400 });
		}

		// Update profile
		const updatedProfile = await db.updateProfile(userId, updates);

		// Log admin action
		await db.logAdminAction(
			session.user.id,
			'user_update',
			userId,
			'Admin updated user profile',
			{ updates }
		);

		return json({
			success: true,
			profile: updatedProfile
		});
	} catch (error) {
		if (error.message === 'Unauthorized') {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}
		if (error.message.includes('Forbidden')) {
			return json({ error: 'Forbidden: Admin access required' }, { status: 403 });
		}
		console.error('Admin user update error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}
