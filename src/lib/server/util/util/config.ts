import { NodeEnvs } from './types';

/** AWS Account IDs */
export enum BackendAccountId {
	'prod' = '383148681147',
	'qa' = '513531455087',
	'dev' = '420910338369',
}
/** AWS Account IDs */
export enum MlAccountId {
	'prod' = '911070144888',
	'dev' = '824878634217',
}

export type AccountId = BackendAccountId | MlAccountId;

/** Top level domains for different stages */
export enum RellifyDomains {
	dev = 'rellify.dev',
	qa = 'rellify.xyz',
	prod = 'rellify.com',
}

/** Domains the rellify app is hosted on */
export const rellifyAppDomains = {
	dev: ['app.rellify.dev'],
	qa: ['app.rellify.xyz'],
	prod: ['app.rellify.com'],
};
/** Get domain like rellify.com based on accountId. Used in lambda@edge */
export const getDomainByAccountId = (accountId: BackendAccountId) => {
	switch (accountId) {
		case BackendAccountId.prod:
			return RellifyDomains.prod;
		case BackendAccountId.qa:
			return RellifyDomains.qa;
		case BackendAccountId.dev:
			return RellifyDomains.dev;
	}
};
/** Get domain like rellify.com based on NODE_ENV */
export const getDomainByNodeEnv = (nodeEnv: NodeEnvs) => {
	switch (nodeEnv) {
		case NodeEnvs.prod:
			return RellifyDomains.prod;
		case NodeEnvs.qa:
			return RellifyDomains.qa;
		case NodeEnvs.dev:
			return RellifyDomains.dev;
	}
};

/** Subdomains for rellify.com/dev/xyz */
export enum BackendSubDomains {
	/** latency routing record used to determine best API region */
	'latencyRouting' = 'latency-routing',
	/** global API that is resolved to region via latency routing */
	'globalApi' = 'global-api',
	/** Global endpoint for content delivery network (i.e. images)  */
	'cdn' = 'cdn',
	/** WebSocketApi for realtime collaboration  */
	'ws' = 'ws',
}

/**
 * returns i.e. latency-routing.rellify.com
 * Used in Lambda@Edge functions
 */
export const getSubDomainsByAccountId = (accountId: BackendAccountId) => {
	const domain = getDomainByAccountId(accountId);
	return {
		latencyRouting: `${BackendSubDomains.latencyRouting}.${domain}`,
		globalApi: `${BackendSubDomains.globalApi}.${domain}`,
		cdn: `${BackendSubDomains.cdn}.${domain}`,
		ws: `${BackendSubDomains.ws}.${domain}`,
	};
};

/**
 * returns i.e. latency-routing.rellify.com
 */
export const getSubDomainsByNodeEnv = (env: NodeEnvs) => {
	return {
		latencyRouting: `${BackendSubDomains.latencyRouting}.${RellifyDomains[env]}`,
		globalApi: `${BackendSubDomains.globalApi}.${RellifyDomains[env]}`,
		cdn: `${BackendSubDomains.cdn}.${RellifyDomains[env]}`,
		ws: `${BackendSubDomains.ws}.${RellifyDomains[env]}`,
	};
};

/**
 * Depending in which environment, allowed origins are differently configured
 * @returns an array of allowed origin urls
 */
export const getAllowedOrigins = () => {
	switch (process.env.NODE_ENV) {
		case NodeEnvs.dev:
		case NodeEnvs.qa:
		case NodeEnvs.prod:
			return [`https://app.${getDomainByNodeEnv(process.env.NODE_ENV)}`, 'http://localhost:3000'];
		default:
			return ['http://localhost:3000'];
	}
};
