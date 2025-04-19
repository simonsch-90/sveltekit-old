import GoogleProvider from '@auth/core/providers/google';
import type { Account, TokenSet } from '@auth/core/types';
import { DynamoDBAdapter } from '@auth/dynamodb-adapter';
import { SvelteKitAuth } from '@auth/sveltekit';
import { DynamoDBClient, GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { Table } from 'sst/node/table';
import { GOOGLE_ID, GOOGLE_SECRET } from '$env/static/private';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocument.from(client);

export const handle = SvelteKitAuth({
	providers: [
		GoogleProvider({
			clientId: GOOGLE_ID,
			clientSecret: GOOGLE_SECRET,
			authorization: {
				params: {
					prompt: 'consent',
					access_type: 'offline',
					response_type: 'code',
				},
			},
		}),
	],
	adapter: DynamoDBAdapter(docClient, {
		tableName: 'users',
		partitionKey: 'pk',
		sortKey: 'sk',
		indexName: 'GSI1',
		indexPartitionKey: 'GSI1PK',
		indexSortKey: 'GSI1SK',
	}),
	pages: {
		signIn: '/auth/login',
		signOut: '/auth/login',
	},
	callbacks: {
		async session(event) {
			const { session, user } = event;
			const data = await client.send(
				new GetItemCommand({
					TableName: Table.users.tableName,
					Key: marshall({
						pk: `USER#${user.id}`,
						sk: `ACCOUNT#google#104193870817058480484`,
					}),
				})
			);

			if (data.Item) {
				const userAccount = unmarshall(data.Item) as unknown as Account;
				const isAccessTokenExpired = userAccount.expires_at! * 1000 < Date.now();
				if (
					process.env.GOOGLE_ID &&
					process.env.GOOGLE_SECRET &&
					userAccount.refresh_token &&
					userAccount.expires_at &&
					isAccessTokenExpired
				) {
					// If the access token has expired, try to refresh it
					try {
						// https://accounts.google.com/.well-known/openid-configuration we need the `token_endpoint`.
						const response = await fetch('https://oauth2.googleapis.com/token', {
							headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
							body: new URLSearchParams({
								client_id: process.env.GOOGLE_ID,
								client_secret: process.env.GOOGLE_SECRET,
								grant_type: 'refresh_token',
								refresh_token: userAccount.refresh_token,
							}),
							method: 'POST',
						});
						const tokens: TokenSet = await response.json();
						if (!response.ok || !tokens.expires_in) throw tokens;
						await client.send(
							new PutItemCommand({
								TableName: Table.users.tableName,
								Item: marshall({
									pk: `USER#${user.id}`,
									sk: `ACCOUNT#google#104193870817058480484`,
									...userAccount,
									access_token: tokens.access_token,
									expires_at: Math.floor(Date.now() / 1000 + tokens.expires_in),
									refresh_token: tokens.refresh_token ?? userAccount.refresh_token,
								}),
							})
						);
					} catch (error) {
						console.error('Error refreshing access token: ', error);
						// The error property will be used client-side to handle the refresh token error
						session.error = 'RefreshAccessTokenError';
					}
				}
			}
			return session;
		},
	},
});

declare module '@auth/core/types' {
	interface Session {
		error?: 'RefreshAccessTokenError';
	}
}

declare module '@auth/core/jwt' {
	interface JWT {
		access_token: string;
		expires_at: number;
		refresh_token: string;
		error?: 'RefreshAccessTokenError';
	}
}
