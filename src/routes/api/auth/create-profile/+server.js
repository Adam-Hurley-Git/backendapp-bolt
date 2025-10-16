import { json } from '@sveltejs/kit';

export async function POST({ request, locals }) {
	try {
		const { userId, email, fullName, avatarUrl } = await request.json();

		if (!userId || !email) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		const supabase = locals.supabase;

		if (!supabase) {
			return json({ error: 'Supabase client not available' }, { status: 500 });
		}

		// Check if profile already exists
		const { data: existingProfile } = await supabase
			.from('profiles')
			.select('id')
			.eq('id', userId)
			.maybeSingle();

		if (existingProfile) {
			return json({ data: existingProfile, message: 'Profile already exists' });
		}

		// Create new profile
		const { data, error } = await supabase
			.from('profiles')
			.insert({
				id: userId,
				email,
				name: fullName || email.split('@')[0],
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			})
			.select()
			.single();

		if (error) {
			console.error('Profile creation error:', error);
			return json({ error: error.message }, { status: 500 });
		}

		return json({ data, message: 'Profile created successfully' });
	} catch (error) {
		console.error('Unexpected error creating profile:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}
