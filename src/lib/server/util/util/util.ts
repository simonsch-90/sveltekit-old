import dayjs from 'dayjs';
import { log, throwError } from '..';
import {
	type LambdaEvent,
	Language,
	type NullableKeys,
	Region,
	type ValidatedProps,
} from './types';
import { browser } from '$app/environment';

export const getEnv = () => {
	if (browser) throwError(getEnv, `Function not callable from client`);
	return process.env;
};

export const flattenDeep = (arr1: any[]): any[] =>
	arr1.reduce(
		(acc, val) => (Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val)),
		[]
	);

/**
 * TTl helper function
 * @returns timeToLive for one year
 */
export const timeToLive = (seconds?: number): number => {
	if (seconds) return Math.floor(dayjs().add(seconds, 'seconds').unix());
	return Math.floor(dayjs().add(1, 'year').unix());
};

export const getTimeZoneFromLanguage = (language?: Language | null) => {
	switch (language) {
		case Language.de:
			return 'Europe/Berlin';
		case Language.en:
			return 'America/New_York';
		default:
			return 'America/New_York';
	}
};
export const isStringWithContent = (s?: string | null) => {
	return s && s.trim() !== '';
};

/** Return the median value of an array */
export const getMedian = (arr: number[]): number | undefined => {
	if (!arr.length) return undefined;
	const sorted = [...arr].sort((a, b) => a - b);
	const middle = Math.floor(sorted.length / 2);

	return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
};

/** Calculate the standard deviation of an array. By default use sample instead of population. */
export const getStandardDeviation = (arr: number[], usePopulation = false) => {
	if (arr.length === 0) return 0;
	const mean = arr.reduce((acc, val) => acc + val, 0) / arr.length;
	const sqDiff = arr.map((n) => Math.pow(n - mean, 2));
	const avgSqDiff =
		sqDiff.reduce((acc, val) => acc + val, 0) / (arr.length - (usePopulation ? 0 : 1));
	return Math.sqrt(avgSqDiff);
};

export const chunk = <T>(arr: Array<T>, size: number) =>
	Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
		arr.slice(i * size, i * size + size)
	);

/** Replaces the last occurrence of a string in another string */
export const replaceLastOccurrence = (str: string, replace: string, add: string) => {
	const lastIndex = str.lastIndexOf(replace);
	return str.substring(0, lastIndex) + add + str.substring(lastIndex + 1);
};

/** Ensures the file name is unique by counting up until a unique name is found */
export const getUniqueFileName = (targetName: string, existingNames: string[], i = 1): string => {
	if (!existingNames.includes(targetName)) return targetName;
	const fileName = replaceLastOccurrence(targetName, '.', `(${i}).`);
	log(getUniqueFileName, fileName, i);
	if (!existingNames.includes(fileName)) return fileName;
	return getUniqueFileName(targetName, existingNames, i + 1);
};

enum Auth0Role {
	Admin = 'Admin',
	Member = 'Member',
}

type Claims = {
	userId: string;
	organizationId: string;
	auth0role: Auth0Role;
};
/**
 * Returns claims set in (auth0) JWT token.
 */
export const getClaims = <T = Record<string, unknown>>({ identity }: LambdaEvent<T>) => {
	if (!identity?.claims) return {};
	const { claims } = identity;
	return {
		userId: claims['https://rellify:userId'],
		organizationId: claims['https://rellify:orgId'],
		auth0role: claims['https://rellify:auth0role'],
	};
};

/**
 * Ensures all claims exist. If one is missing the function throws an error.
 */
export const getValidatedClaims = (event: LambdaEvent<Record<string, unknown>>) => {
	if (!event.identity) throwError(getValidatedClaims, `No identity object in event!`);

	const claims = getClaims(event);

	const missingClaim = Object.entries(claims).find(([_claim, value]) => !value);
	if (missingClaim) throwError(getValidatedClaims, `Missing claim for ${missingClaim[0]}!`);

	if (claims.auth0role !== Auth0Role.Admin && claims.auth0role !== Auth0Role.Member)
		throwError(getValidatedClaims, `Invalid role ${claims.auth0role}!`);
	return claims as Claims;
};

/**
 * Ensures props are not null. If one is null or undefined the function throws an error.
 * @param obj containing properties
 * @param props a list of properties which should not be allowed to be null
 * @returns new obj version with proper type
 */
export const getValidatedProps = <T, K extends NullableKeys<T>>(
	obj: T,
	props: K[]
): ValidatedProps<T, K> => {
	const nullProps = props.filter((prop) => obj[prop] === null);
	if (nullProps.length > 0) {
		throwError(getValidatedProps, `Null value found for properties: ${nullProps.join(', ')}!`);
	}
	const validatedProps = props.reduce((acc, prop) => {
		if (obj[prop] !== null) {
			acc[prop] = obj[prop];
		}
		return acc;
	}, {} as T);

	return validatedProps as ValidatedProps<T, K>;
};

/**
 * Ensures the specified env variables exist and are defined (no empty string)
 */
export const getValidatedEnv = <T extends string>(variableNames: T[]) => {
	const notDefinedNames: string[] = [];
	if (browser) throwError(getValidatedEnv, `Function not callable from client`);
	const variables = variableNames.reduce(
		(acc, name) => {
			if (!getEnv()[name]) notDefinedNames.push(name);
			return { ...acc, [name]: getEnv().env[name]! };
		},
		{} as { [key in T]: string }
	);

	if (notDefinedNames.length > 0)
		throwError(
			getValidatedEnv,
			`Missing the following env variables: ${notDefinedNames.join(' | ')}!`
		);
	return variables;
};

/* eslint-disable */
export const groupBy = <T, K extends keyof any>(list: T[], getKey: (item: T) => K) =>
	list.reduce(
		(previous, currentItem) => {
			const group = getKey(currentItem);
			if (!previous[group]) previous[group] = [];
			previous[group].push(currentItem);
			return previous;
		},
		{} as Record<K, T[]>
	);
/* eslint-enable */

export const unique = (arr: string[]) => {
	const a = [];
	for (let i = 0, l = arr.length; i < l; i++)
		if (a.indexOf(arr[i]) === -1 && arr[i] !== '') a.push(arr[i]);
	return a;
};

/**
 * Waits for the given time and the continues.
 *
 * @param {number} seconds delay in seconds
 * @returns
 */
export const sleep = async (seconds: number) =>
	new Promise((resolve) => setTimeout(resolve, seconds * 1000));
/**
 * Wait for x milliseconds
 * @param ms The number of milliseconds to wait
 * @returns A promise that resolves after the given number of milliseconds
 */
export const timeoutMilliseconds = (ms: number): Promise<void> => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};

/** Remove the version(s) from an id and return all ids as an array */
export const getEntityIdsWithoutVersion = (id: string) =>
	id.split('#').map((idWithVersion) => idWithVersion.split('_')[0]);

/** Return an id without any version */
export const getIdWithoutVersion = (id: string) => getEntityIdsWithoutVersion(id).join('#');

/** validates that the given string is a valid UUID including NIL UUID */
export const isValidUUID = (str: string) => {
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	return uuidRegex.test(str);
};

/**
 * Validates that an id is a combination of uuids separated by #'s
 * Optionally check depth of id and ensure it contains a parentId
 */
export const validateId = (id: string, requiredLength?: number, parentId?: string) => {
	if (parentId && !id.startsWith(parentId))
		throwError(validateId, `Id must start with it's parentId (${parentId})!`);
	const parts = getIdWithoutVersion(id).split('#');
	if (!parts.every((part) => isValidUUID(part))) throwError(validateId, `Invalid id ${id}!`);
	if (requiredLength && parts.length !== requiredLength)
		throwError(validateId, `Invalid id ${id} required length ${requiredLength}!`);
};

/** validates that all items in an array have a valid id */
export const validateInputIds = (
	input: { id: string }[],
	requiredLength?: number,
	parentId?: string
) => {
	input.forEach((item) => validateId(item.id, requiredLength, parentId));
};

/**
 * Asynchronously resolves an array of promise results and returns only those that were successfully resolved
 * Throws an error if any promise was rejected
 * @template T - The type of the promise result
 * @param {PromiseSettledResult<T>[]} promises - An array of promise settled results to resolve
 * @returns {Promise<T[]>} - A promise that resolves to an array of successfully fulfilled promises' results of type T
 * @throws {Error} - If any promise in the provided array is rejected, an error is thrown with a message that includes a stringified version of the failed results array
 */
export const getSuccessfullySettledPromises = async <T>(promises: Promise<T>[]): Promise<T[]> => {
	const result = await Promise.allSettled(promises);
	const failedResults = result
		.filter((r): r is PromiseRejectedResult => r.status === 'rejected')
		.map((r) => r.reason);
	if (failedResults.length > 0) {
		throwError(
			getSuccessfullySettledPromises,
			`One or more items failed: ${JSON.stringify(failedResults)}!`
		);
	}
	return result
		.filter((r) => r.status === 'fulfilled')
		.map((res) => (<PromiseFulfilledResult<T>>res).value);
};

/**
 * Regular expression to find line breaks in a string.
 * Matches different types of line breaks: \r and \n
 * Uses global (g) and multiline (m) flags to match throughout the entire text.
 */
export const lineBreaksRegex = /(\r\n|\n|\r)/gm;

export const getRegionFromLanguage = (language: Language) => {
	switch (language) {
		case Language.en:
			return 'us';
		case Language.de:
			return 'de';
		default:
			throwError(getSuccessfullySettledPromises, `Unsupported region!`);
	}
};

/**
 * This function takes an ARN (Amazon Resource Name) as a parameter and returns the region part of the ARN.
 * i.e. arn:aws:lambda:us-east-1:640910323469:function:LambdaName => us-east-1
 */
export const getRegionFromArn = (arn: string): Region | undefined => {
	const parts = arn.split(':');
	return parts.length > 3 ? (parts[3] as Region) : undefined;
};

/**
 * Merges an array of objects into a single array with unique objects based on the specified key.
 * If objects have the same key value, they are merged together with the properties of the later object overriding the earlier ones.
 * @param data - An array of objects to be merged.
 * @param key - The key on which the merge is based.
 * @returns An array of merged objects.
 */
export const mergeObjects = <T extends Record<string, any>, R extends Record<string, any>>(
	data: T[],
	key: keyof T
): R[] => {
	const mergedData = data.reduce(
		(acc, val) => {
			if (acc[val[key]]) {
				acc[val[key]] = { ...acc[val[key]], ...val };
			} else {
				acc[val[key]] = val as any;
			}
			return acc;
		},
		{} as Record<string, R>
	);
	return Object.values(mergedData);
};
