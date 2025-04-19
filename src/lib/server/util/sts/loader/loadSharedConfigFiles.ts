import { readFile } from 'node:fs/promises';
import { homedir } from 'os';
import { join, sep } from 'path';
// ToDo: Change to "fs/promises" when supporting nodejs>=14
/**
 * @public
 */
export declare enum IniSectionType {
	PROFILE = 'profile',
	SSO_SESSION = 'sso-session',
	SERVICES = 'services',
}
/**
 * @public
 */
export type IniSection = Record<string, string | undefined>;
/**
 * @public
 *
 * @deprecated Please use {@link IniSection}
 */
export interface Profile extends IniSection {}
/**
 * @public
 */
export type ParsedIniData = Record<string, IniSection>;
/**
 * @public
 */
export interface SharedConfigFiles {
	credentialsFile: ParsedIniData;
	configFile: ParsedIniData;
}

const filePromisesHash: Record<string, Promise<string>> = {};

interface SlurpFileOptions {
	ignoreCache?: boolean;
}

export const slurpFile = (path: string, options?: SlurpFileOptions) => {
	if (!filePromisesHash[path] || options?.ignoreCache) {
		filePromisesHash[path] = readFile(path, 'utf8');
	}
	return filePromisesHash[path];
};

// eslint-disable-next-line no-useless-escape
const prefixKeyRegex = /^([\w-]+)\s(["'])?([\w-@\+\.%:/]+)\2$/;
const profileNameBlockList = ['__proto__', 'profile __proto__'];

export const parseIni = (iniData: string): ParsedIniData => {
	const map: ParsedIniData = {};

	let currentSection: string | undefined;
	let currentSubSection: string | undefined;

	for (const iniLine of iniData.split(/\r?\n/)) {
		const trimmedLine = iniLine.split(/(^|\s)[;#]/)[0].trim(); // remove comments and trim
		const isSection: boolean =
			trimmedLine[0] === '[' && trimmedLine[trimmedLine.length - 1] === ']';
		if (isSection) {
			// New section found. Reset currentSection and currentSubSection.
			currentSection = undefined;
			currentSubSection = undefined;

			const sectionName = trimmedLine.substring(1, trimmedLine.length - 1);
			const matches = prefixKeyRegex.exec(sectionName);
			if (matches) {
				const [, prefix, , name] = matches;
				// Add prefix, if the section name starts with `profile`, `sso-session` or `services`.
				if (Object.values(IniSectionType).includes(prefix as IniSectionType)) {
					currentSection = [prefix, name].join(CONFIG_PREFIX_SEPARATOR);
				}
			} else {
				// If the section name does not match the regex, use the section name as is.
				currentSection = sectionName;
			}

			if (profileNameBlockList.includes(sectionName)) {
				throw new Error(`Found invalid profile name "${sectionName}"`);
			}
		} else if (currentSection) {
			const indexOfEqualsSign = trimmedLine.indexOf('=');
			if (![0, -1].includes(indexOfEqualsSign)) {
				const [name, value]: [string, string] = [
					trimmedLine.substring(0, indexOfEqualsSign).trim(),
					trimmedLine.substring(indexOfEqualsSign + 1).trim(),
				];
				if (value === '') {
					currentSubSection = name;
				} else {
					if (currentSubSection && iniLine.trimStart() === iniLine) {
						// Reset currentSubSection if there is no whitespace
						currentSubSection = undefined;
					}
					map[currentSection] = map[currentSection] || {};
					const key = currentSubSection
						? [currentSubSection, name].join(CONFIG_PREFIX_SEPARATOR)
						: name;
					map[currentSection][key] = value;
				}
			}
		}
	}

	return map;
};
const homeDirCache: Record<string, string> = {};

const getHomeDirCacheKey = (): string => {
	// geteuid is only available on POSIX platforms (i.e. not Windows or Android).
	if (process && process.geteuid) {
		return `${process.geteuid()}`;
	}
	return 'DEFAULT';
};

/**
 * Get the HOME directory for the current runtime.
 *
 * @internal
 */
export const getHomeDir = (): string => {
	const { HOME, USERPROFILE, HOMEPATH, HOMEDRIVE = `C:${sep}` } = process.env;

	if (HOME) return HOME;
	if (USERPROFILE) return USERPROFILE;
	if (HOMEPATH) return `${HOMEDRIVE}${HOMEPATH}`;

	const homeDirCacheKey = getHomeDirCacheKey();
	if (!homeDirCache[homeDirCacheKey]) homeDirCache[homeDirCacheKey] = homedir();

	return homeDirCache[homeDirCacheKey];
};

export const ENV_CREDENTIALS_PATH = 'AWS_SHARED_CREDENTIALS_FILE';

export const getCredentialsFilepath = () =>
	process.env[ENV_CREDENTIALS_PATH] || join(getHomeDir(), '.aws', 'credentials');

export const ENV_CONFIG_PATH = 'AWS_CONFIG_FILE';

export const getConfigFilepath = () =>
	process.env[ENV_CONFIG_PATH] || join(getHomeDir(), '.aws', 'config');

/**
 * Returns the config data from parsed ini data.
 * * Returns data for `default`
 * * Returns profile name without prefix.
 * * Returns non-profiles as is.
 */
export const getConfigData = (data: ParsedIniData): ParsedIniData =>
	Object.entries(data)
		.filter(([key]) => {
			const indexOfSeparator = key.indexOf(CONFIG_PREFIX_SEPARATOR);
			if (indexOfSeparator === -1) {
				// filter out keys which do not contain CONFIG_PREFIX_SEPARATOR.
				return false;
			}
			// Check if prefix is a valid IniSectionType.
			return Object.values(IniSectionType).includes(
				key.substring(0, indexOfSeparator) as IniSectionType
			);
		})
		// remove profile prefix, if present.
		.reduce(
			(acc, [key, value]) => {
				const indexOfSeparator = key.indexOf(CONFIG_PREFIX_SEPARATOR);
				const updatedKey =
					key.substring(0, indexOfSeparator) === IniSectionType.PROFILE
						? key.substring(indexOfSeparator + 1)
						: key;
				acc[updatedKey] = value;
				return acc;
			},
			{
				// Populate default profile, if present.
				...(data.default && { default: data.default }),
			} as ParsedIniData
		);

export interface SharedConfigInit {
	/**
	 * The path at which to locate the ini credentials file. Defaults to the
	 * value of the `AWS_SHARED_CREDENTIALS_FILE` environment variable (if
	 * defined) or `~/.aws/credentials` otherwise.
	 */
	filepath?: string;

	/**
	 * The path at which to locate the ini config file. Defaults to the value of
	 * the `AWS_CONFIG_FILE` environment variable (if defined) or
	 * `~/.aws/config` otherwise.
	 */
	configFilepath?: string;

	/**
	 * Configuration files are normally cached after the first time they are loaded. When this
	 * property is set, the provider will always reload any configuration files loaded before.
	 */
	ignoreCache?: boolean;
}

const swallowError = () => ({});

export const CONFIG_PREFIX_SEPARATOR = '.';

export const loadSharedConfigFiles = async (
	init: SharedConfigInit = {}
): Promise<SharedConfigFiles> => {
	const { filepath = getCredentialsFilepath(), configFilepath = getConfigFilepath() } = init;

	const parsedFiles = await Promise.all([
		slurpFile(configFilepath, {
			ignoreCache: init.ignoreCache,
		})
			.then(parseIni)
			.then(getConfigData)
			.catch(swallowError),
		slurpFile(filepath, {
			ignoreCache: init.ignoreCache,
		})
			.then(parseIni)
			.catch(swallowError),
	]);

	return {
		configFile: parsedFiles[0],
		credentialsFile: parsedFiles[1],
	};
};
