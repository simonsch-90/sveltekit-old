//** Replaces \n in text with two spaces */
export const replaceNewLines = (string: string) => string.replace(/\n/g, ' ');

/* Without apostrophe and hyphen */
const punctuationRegex = /[!"#$%&'()*+,/:;<=>?@[\]^_{|}~]/g;

//** TODO: use spaCy to detect words instead of regex */
export const getDocumentWords = (text: string): string[] =>
	replaceNewLines(text.trim().replace(punctuationRegex, '').normalize('NFKC'))
		.split(' ')
		.filter((word) => word.length > 0);

export const uniqBy = <T>(
	data: T[],
	identifier: keyof T | ((item: T) => any),
	onRemove?: (item: T, index: number) => void
) => {
	const cb = typeof identifier === 'function' ? identifier : (o: T) => o[identifier];

	return Array.from(
		data
			.reduce((map, item, i) => {
				const key = item === null || item === undefined ? item : cb(item);

				if (!map.has(key)) {
					map.set(key, item);
				} else {
					onRemove?.(item, i);
				}

				return map;
			}, new Map())
			.values()
	);
};

export const getUniqueCaseInsensitive = <T>(
	data: T[],
	key: keyof T,
	onRemove?: (item: T, index: number) => void
) => {
	return uniqBy(
		data,
		(i) => {
			const identifier = i[key];
			if (typeof identifier === 'string') return identifier.toLowerCase();
			return identifier;
		},
		onRemove
	);
};

export const capitalizeFirstLetter = <T extends string>(string: T) => {
	return (string.charAt(0).toUpperCase() + string.slice(1)) as Capitalize<T>;
};

export const lowercaseFirstLetter = (string: string) => {
	return string.charAt(0).toLocaleLowerCase() + string.slice(1);
};

/**
 * Concats url and path and takes care of endings.
 * @param url a url like https://www.rellify.com
 * @param path path like /login
 * @returns concatted url
 */
export const concatUrl = (url: string, path: string) => new URL(path, url).href;
