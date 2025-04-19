import { AssumeRoleCommand, GetCallerIdentityCommand, STSClient } from '@aws-sdk/client-sts';
import { getSTSClient, throwError } from '..';
import { browser } from '$app/environment';

/**
 * Returns current account id.
 * @param stsClient optional securityTokenService client
 * @returns account id
 */
export const getCurrentAccountId = async (stsClient = getSTSClient()) => {
	const response = await stsClient.send(new GetCallerIdentityCommand({}));
	return response.Account;
};

const assume = async (profileName: string) => {
	if (browser) {
		const { fromIni } = await import('@aws-sdk/credential-providers');
		const { loadSharedConfigFiles } = await import('./loader/loadSharedConfigFiles');

		const profileData = await loadSharedConfigFiles();
		const profile = profileData.configFile[profileName];
		/** Check if we need to assume role or directly use profile */
		if (!profile.role_arn)
			return fromIni({
				profile: profileName,
			});

		/** Assume role based on source_profile and role_arn in config file */
		const sts = getSTSClient({
			credentials: fromIni({
				profile: profile.source_profile,
			}),
		});
		const result = await sts.send(
			new AssumeRoleCommand({
				RoleSessionName: profileName,
				RoleArn: profile.role_arn,
			})
		);

		if (!result.Credentials)
			return throwError(assume, `Unable to assume credentials - empty credential object!`);

		return {
			accessKeyId: String(result.Credentials.AccessKeyId),
			secretAccessKey: String(result.Credentials.SecretAccessKey),
			sessionToken: result.Credentials.SessionToken,
		};
	}
};
/** Get credentials */
export const getCredentials = async (profileName: string) => {
	const credentials = await assume(profileName);
	const sts2 = new STSClient({
		credentials,
	});
	const identity = await sts2.send(new GetCallerIdentityCommand({}));
	if (!identity.Account) return throwError(getCredentials, `Unable to extract AWS account id!`);
	return { credentials, accountId: identity.Account };
};
