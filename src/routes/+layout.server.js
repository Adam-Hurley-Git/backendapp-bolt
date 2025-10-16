/**
 * Root layout server load function
 * This runs on every request and provides the session to all pages
 */
export async function load({ locals }) {
	const session = await locals.getSession();

	return {
		session
	};
}
