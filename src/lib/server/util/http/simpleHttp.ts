import { URL } from 'node:url';
import { performance } from 'perf_hooks';
import zlib from 'zlib';
import { logError } from '..';
import { HTTPError } from './types';
import type { Options, RequestParams } from './types';
// eslint-disable-next-line import/order
import http from 'http';
// eslint-disable-next-line import/order
import https from 'https';

const request = <T>(
	urlString: string,
	method: string,
	requestParams: RequestParams = {},
	options: Options = {}
): Promise<T> => {
	// Create an instance of the http.Agent with KeepAlive enabled
	const url = new URL(urlString);
	const lib = url.protocol === 'https:' ? https : http;
	const params: http.RequestOptions = {
		method,
		host: url.host,
		port: url.protocol === 'https:' ? 443 : 80,
		path: `${url.pathname}${url.search}`,
		headers: requestParams.headers,
		timeout: requestParams.timeout,
	};
	return new Promise((resolve, reject) => {
		let dataString = '';

		const requestLengthStart = performance.now();
		const requestStart = new Date().toISOString();

		const req = lib.request(params, async (response: http.IncomingMessage) => {
			const { statusCode } = response;
			let output;
			// For head request return the response (i.e. to act on the status code)
			if (method === 'HEAD') resolve(response as T);
			// For all other requests parse the body
			if (response.headers['content-encoding'] == 'gzip') {
				const gzip = zlib.createGunzip();
				response.pipe(gzip);
				output = gzip;
			} else if (response.headers['content-encoding'] == 'deflate') {
				output = zlib.createInflate();
				response.pipe(output);
			} else {
				output = response;
			}

			output.setEncoding('utf8');

			output.on('data', (chunk) => {
				dataString += chunk;
			});
			output.on('end', async () => {
				if (statusCode && (statusCode < 200 || statusCode >= 300)) {
					if (options.logging) {
						logError(request, 'OnEnd with Error on statusCode', {
							url: urlString,
							statusCode: response.statusCode,
							requestDuration: performance.now() - requestLengthStart,
							requestStart: requestStart,
						});
					}
					try {
						const error = new HTTPError(
							`[simpleHttp/request] HTTP ERROR Status Code: ${response.statusCode} Data: ${dataString} Url: ${urlString}`,
							JSON.parse(dataString),
							response
						);
						reject(error);
					} catch (e) {
						reject(
							new Error(
								`[simpleHttp/request] ERROR Status Code: ${response.statusCode} Data: ${dataString} Url: ${urlString}`
							)
						);
					}
				}

				if (options.logging) {
					logError(request, 'OnEnd with Error on statusCode', {
						url: urlString,
						statusCode: response.statusCode,
						requestDuration: performance.now() - requestLengthStart,
						requestStart,
					});
				}
				if (dataString === '') {
					resolve(null as T);
				} else {
					try {
						if (
							response.headers?.['content-type'] &&
							(response.headers['content-type'].includes('application/json') ||
								response.headers['content-type'].includes('application/problem+json'))
						) {
							resolve(JSON.parse(dataString));
						} else {
							resolve(dataString as T);
						}
					} catch (error) {
						reject(
							new Error(
								`[simpleHttp/request] Error failed to parse body ${dataString} ${JSON.stringify(
									{ url: urlString, postData: requestParams.postData },
									null,
									4
								)}`
							)
						);
					}
				}
			});
		});
		req.on('error', async (error) => {
			if (options.logging) {
				logError(request, 'OnError', {
					url: urlString,
					requestDuration: performance.now() - requestLengthStart,
					requestStart: requestStart,
					error: error.message,
					statusCode: undefined,
				});
			}
			return reject(error.message);
		});
		req.on('timeout', () => {
			logError(request, 'timeout', {
				url: urlString,
				requestDuration: performance.now() - requestLengthStart,
				requestStart: requestStart,
			});
			req.destroy();
			return reject('timeout');
		});
		if (requestParams.postData) {
			req.write(requestParams.postData);
		}
		req.end();
	});
};

export const get = <T>(urlString: string, params: RequestParams = {}, options?: Options) =>
	request<T>(urlString, 'GET', { headers: params.headers }, options);

export const del = <T>(urlString: string, params: RequestParams = {}, options?: Options) => {
	const postData = JSON.stringify(params.postData);

	const headers = params.headers ? { ...params.headers } : {};
	if (postData) {
		headers['Content-Length'] = postData.length;
	}
	return request<T>(
		urlString,
		'DELETE',
		{
			...params,
			headers,
			postData,
		},
		options
	);
};

/**
 * Make a HEAD request (i.e. get status code of page)
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/HEAD
 */
export const head = (urlString: string, params: RequestParams = {}, options?: Options) =>
	request<http.IncomingMessage>(urlString, 'HEAD', params, options);

export const post = <T>(urlString: string, params: RequestParams, options?: Options) => {
	const postData = JSON.stringify(params.postData);
	return request<T>(urlString, 'POST', { ...params, postData }, options);
};

export const put = <T>(urlString: string, params: RequestParams, options?: Options) => {
	const postData = JSON.stringify(params.postData);
	return request<T>(urlString, 'PUT', { ...params, postData }, options);
};
export const patch = <T>(urlString: string, params: RequestParams, options?: Options) => {
	const postData = JSON.stringify(params.postData);
	return request<T>(urlString, 'PATCH', { ...params, postData }, options);
};

type GetRequest = {
	type: 'GET';
	urlString: string;
	params: {
		headers?: http.OutgoingHttpHeaders;
	};
	options?: Options;
};

type HeadRequest = {
	type: 'HEAD';
	urlString: string;
	params: {
		headers?: http.OutgoingHttpHeaders;
	};
	options?: Options;
};

type RequestWithBody = {
	type: 'POST' | 'PUT' | 'PATCH' | 'GET';
	urlString: string;
	params: RequestParams;
	options?: Options;
};

export type HTTPRequest = RequestWithBody | GetRequest | HeadRequest;

export const httpRequest = <T>({ params, type, urlString, options }: HTTPRequest) => {
	return request<T>(urlString, type, params, options);
};
