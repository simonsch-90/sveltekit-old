import * as http from 'http';

export type RequestParams = {
	postData?: object | string;
	headers?: http.OutgoingHttpHeaders;
	/** timeout for request in milliseconds */
	timeout?: number;
};
export type Options = {
	logging?: boolean;
};
/** Error with parsed data object of the response body */
export class HTTPError extends Error {
	public readonly data;

	public readonly response;

	constructor(message: string, data: any, response: http.IncomingMessage) {
		super(message);
		this.data = data;
		this.response = response;
	}
}
