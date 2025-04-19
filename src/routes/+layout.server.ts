import { redirect } from '@sveltejs/kit';

export const load = async (event) => {
	const session = await event.locals.getSession();
	const authOrigin = event.url.pathname;
	if (!session && event.url.pathname !== '/app/auth/login')
		throw redirect(307, `/app/auth/login?authOrigin=${authOrigin}`);
	return {
		session,
	};
};
