import { logError, throwError } from '../xray';

/**
 * Extract origin out of url.
 * @param url a url
 * @returns origin of url
 */
export const extractOrigin = (url: string) => new URL(url).origin;

/**
 * Extract pathname out of url.
 * @param url a url
 * @returns pathname of url
 */
export const extractPath = (url: string) => new URL(url).pathname;

/**
 * Returns the domains (incl. hostnames) from a list of urls
 * i.e. https://blog.example.com/e => blog.example.com
 * */
export const getDomainsFromUrls = (urls: string[]) => urls.map((url) => new URL(url).hostname);

/**
 * Check url and when it is not a valid url, will raise an error.
 * @param url a url
 */
export const checkUrl = (url: string) => {
	try {
		new URL(url);
	} catch (e) {
		throwError(checkUrl, `Url [${url}] is invalid: ${e}!`);
	}
};

export const isValidUrl = (url: string) => {
	try {
		new URL(url);
		return true;
	} catch (error) {
		logError(isValidUrl, `Invalid url: ${url}`);
		return false;
	}
};

/**
 * @param {string} maybeUrl Can be a path, like /search, or a full URL
 * @param {string} maybeHostname Can be a hostname, like www.google.com or full URL, like https://www.google.com
 */
export const ensureAbsoluteUrl = (maybeUrl: string, maybeHostname: string) => {
	if (!maybeUrl?.trim?.().length || !maybeHostname?.trim?.().length) {
		return maybeUrl;
	}
	return new URL(
		maybeUrl,
		(maybeHostname.startsWith('http') ? '' : 'https://').concat(maybeHostname)
	).toString();
};
