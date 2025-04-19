import { getCredentials, getDocumentDbClient, getDynamoDbClient } from '..';
import { log, throwError } from '../xray';
import { browser } from '$app/environment';

export const getArgs = () => {
	if (browser) return {};
	process.env.AWS_SDK_LOAD_CONFIG = '1';
	return process.argv
		.slice(2)
		.map((arg) => arg.split('='))
		.reduce(
			(acc, [value, key]) => {
				acc[value.replace('--', '')] = key?.trim();
				return acc;
			},
			{} as { [key: string]: any }
		);
};

export const getSourceProfileFromArgs = (profile?: string, sourceProfile?: string) => {
	if (sourceProfile) {
		return sourceProfile;
	} else if (profile) {
		return profile;
	}
	return 'default';
};
export const getTargetProfileFromArgs = (profile?: string, targetProfile?: string) => {
	if (targetProfile) {
		return targetProfile;
	} else if (profile) {
		return profile;
	}
	return 'default';
};

export const getDocumentClients = async () => {
	const args = getArgs();

	if (!args.sourceProfile) throwError(getDocumentClients, `sourceProfile not provided!`);
	if (!args.targetProfile) throwError(getDocumentClients, `targetProfile not provided!`);

	log(getDocumentClients, `Using the following AWS profile as SOURCE: ${args.sourceProfile}`);
	log(getDocumentClients, `Using the following AWS profile as TARGET: ${args.targetProfile}`);

	const sourceCredentials = await getCredentials(args.sourceProfile);
	const targetCredentials = await getCredentials(args.targetProfile);

	log(
		getDocumentClients,
		`sourceCredentials - Using the following AWS account:`,
		sourceCredentials.accountId
	);
	log(
		getDocumentClients,
		`targetCredentials - Using the following AWS account:`,
		targetCredentials.accountId
	);

	return {
		sourceDocumentClient: getDocumentDbClient(sourceCredentials),
		targetDocumentClient: getDocumentDbClient(targetCredentials),
	};
};
export const getDynamodbClients = async () => {
	const args = getArgs();

	if (!args.sourceProfile) throwError(getDocumentClients, `sourceProfile not provided!`);
	if (!args.targetProfile) throwError(getDocumentClients, `targetProfile not provided!`);

	log(getDynamodbClients, `Using the following AWS profile as SOURCE: ${args.sourceProfile}`);
	log(getDynamodbClients, `Using the following AWS profile as TARGET: ${args.targetProfile}`);

	const sourceCredentials = await getCredentials(args.sourceProfile);
	const targetCredentials = await getCredentials(args.targetProfile);

	return {
		sourceDynamoDbClient: getDynamoDbClient(sourceCredentials),
		targetDynamoDbClient: getDynamoDbClient(targetCredentials),
	};
};
