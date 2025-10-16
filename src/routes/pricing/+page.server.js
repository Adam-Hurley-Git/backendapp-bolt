export async function load({ locals }) {
	const session = await locals.getSession();

	return {
		user: session?.user || null
	};
}
