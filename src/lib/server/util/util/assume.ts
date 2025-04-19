import { AssumeRoleCommand, STSClient } from '@aws-sdk/client-sts';
import { throwError } from '../xray';
import type { Region } from './types';

/** Assume role to perform aws actions like cross account access */
export const assume = async (
	roleArn: string,
	sessionName: string,
	duration = 60 * 60, // 1 hour default
	region?: Region
) => {
	const sts = new STSClient({
		region: region || process.env.AWS_REGION || 'us-east-1',
	});

	try {
		// Returns a set of temporary security credentials that you can use to
		// access Amazon Web Services resources that you might not normally
		// have access to.
		const command = new AssumeRoleCommand({
			// The Amazon Resource Name (ARN) of the role to assume.
			RoleArn: roleArn,
			// An identifier for the assumed role session.
			RoleSessionName: sessionName,
			// The duration, in seconds, of the role session. The value specified
			// can range from 900 seconds (15 minutes) up to the maximum session
			// duration set for the role.
			DurationSeconds: duration,
		});
		const response = await sts.send(command);
		if (!response.Credentials)
			return throwError(assume, `Unable to assume credentials - empty credential object!`);
		return {
			accessKeyId: String(response.Credentials.AccessKeyId),
			secretAccessKey: String(response.Credentials.SecretAccessKey),
			sessionToken: response.Credentials.SessionToken,
			expiration: response.Credentials.Expiration,
		};
	} catch (error) {
		throwError(assume, `Unable to assume credentials - ${JSON.stringify(error)}!`);
	}
};
