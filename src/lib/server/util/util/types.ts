import type {
	APIGatewayProxyEvent,
	AppSyncIdentityCognito,
	AppSyncResolverEvent,
	Context,
} from 'aws-lambda';

export enum NodeEnvs {
	dev = 'dev',
	qa = 'qa',
	prod = 'prod',
}

export enum Language {
	de = 'de',
	en = 'en',
}

export type VolumeElement = {
	amount: number;
	month: number;
	year: number;
	day: number;
	date?: string | null;
};

export enum Region {
	us = 'us-east-1',
	eu = 'eu-central-1',
}

export type AWSClientCollection<TClient> = {
	[accountId: string]: { [region: string]: TClient };
};

export const isAppSyncIdentityCognito = (value: any): value is AppSyncIdentityCognito => {
	const casted = value as AppSyncIdentityCognito;
	return !!casted.claims;
};

// extends AppSyncResolverEvent with custom identity claims
export interface LambdaEvent<TArguments>
	extends Omit<AppSyncResolverEvent<TArguments>, 'identity'> {
	identity?: {
		claims: {
			'https://rellify:userId': string;
			'https://rellify:orgId': string;
			'https://rellify:auth0role': string;
			'https://rellify:roles': string[];
			org_id: string;
		};
	};
}
/**
 * Default Lambda Appsync event defining properties like claims contained in the request
 * i.e. Graphql request though appsync
 * TInputArgs can be used to extends the input arguments
 * TOutput defines the return type of the lambda function
 */
export type LambdaAppSyncHandler<TInputArgs, TOutput> = (
	event: LambdaEvent<TInputArgs> & {
		/** If called with an api key there is the APPSYNC_API_KEY set */
		authorizationToken?: string;
	},
	context: Context
) => Promise<TOutput>;

export type LambdaHandler<TInputArgs, TOutput> = (
	event: TInputArgs,
	context: Context
) => Promise<TOutput>;

export type LambdaHttpHandler<TOutput> = (event: APIGatewayProxyEvent) => Promise<TOutput>;

export type LambdaHandlerAppsync<TInputArgs, TOutput> = (
	event: LambdaEvent<TInputArgs>,
	context: Context
) => Promise<TOutput>;

export type StepFunctionLambdaHandler<TInputArgs, TOutput> = (
	event: {
		Payload: TInputArgs;
	},
	context: Context
) => Promise<TOutput>;

/**
 * LambdaInvokeHandler is the base type for standard lambda invocations
 * i.e. lambda calling another lambda
 * TInputArgs can be used to extends the input arguments
 * TOutput defines the return type of the lambda function
 */
export type LambdaInvokeHandler<TInputArgs, TOutput> = (
	event: TInputArgs,
	context: Context
) => Promise<TOutput>;

// Picks the type of one property
export type PickOne<T, K extends keyof T> = T[K];

export type RequiredAndNotNull<T> = {
	[P in keyof T]-?: Exclude<T[P], null | undefined>;
};

export type RequiredAndNotNullSome<T, K extends keyof T> = RequiredAndNotNull<Pick<T, K>> &
	Omit<T, K>;

// OmitRecursively
type Id<T> = Record<string, unknown> & { [P in keyof T]: T[P] }; // Cosmetic use only makes the tooltips expand the type can be removed
type OmitDistributive<T, K extends PropertyKey> = T extends any
	? T extends object
		? Id<OmitRecursively<T, K>>
		: T
	: never;
type OmitRecursively<T, K extends PropertyKey> = Omit<
	{ [P in keyof T]: OmitDistributive<T[P], K> },
	K
>;

export type DeepPartial<T> = T extends object
	? {
			[P in keyof T]?: DeepPartial<T[P]>;
		}
	: T;

export type MLNeuraverseExploreHandlerInput = {
	neuraverseId: string;
	searchTerm: string;
	/** user-selected topic (only single value possible) */
	topicId: string;
	/** Default 25 */
	nPhrases?: number;
};

export type NullableKeys<T> = {
	[K in keyof T]: null extends T[K] ? K : never;
}[keyof T];

export type NonNullableProps<T> = {
	[K in keyof T]: Exclude<T[K], null>;
};

export type ValidatedProps<T, K extends NullableKeys<T>> = Omit<T, K> &
	Partial<NonNullableProps<Pick<T, K>>>;

export type PartialNullable<T> = {
	[P in keyof T]?: T[P] | null;
};
