import { browser } from '$app/environment';

export const navigateBack = () => {
	if (browser) window.history.back();
};
