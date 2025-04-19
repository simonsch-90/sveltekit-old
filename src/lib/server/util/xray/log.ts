/* eslint-disable import/export */
/* eslint-disable @typescript-eslint/no-redeclare */
const extractPrefix = (fn: Function) => {
	let prefix = 'anonymousFunction';
	if (fn.name === 'lambdaHandler' && process.env.AWS_LAMBDA_FUNCTION_NAME) {
		prefix = `${process.env.AWS_LAMBDA_FUNCTION_NAME}/lambdaHandler`;
	} else if (fn.name.length > 0) {
		prefix = fn.name;
	}
	return `[${prefix}]`;
};

const baseLog = ({
	cb,
	stringify,
	prefix,
	messageOrObject = undefined,
	object = undefined,
}: {
	cb: Function;
	stringify: boolean;
	prefix: string;
	messageOrObject?: any | undefined;
	object?: any | undefined;
}) => {
	let content = messageOrObject;
	let secondContent = object;

	if (typeof messageOrObject === 'object' && stringify) {
		content = stringify ? JSON.stringify(messageOrObject, null, 2) : messageOrObject;
	}
	if (object && typeof object !== 'string' && stringify) {
		secondContent = JSON.stringify(object, null, 2);
	}

	if (typeof content === 'string') {
		return cb(`${prefix} ${content}`, secondContent === undefined ? '' : secondContent);
	}

	return cb(`${prefix}`, content, secondContent === undefined ? '' : secondContent);
};

export const log = (fn: Function, messageOrObject?: any, object?: any) => {
	const prefix = extractPrefix(fn);
	return baseLog({
		cb: console.log,
		stringify: true,
		prefix,
		messageOrObject,
		object,
	});
};

export const logError = (fn: Function, messageOrObject?: any, object?: any) => {
	const prefix = extractPrefix(fn);
	return baseLog({
		cb: console.error,
		stringify: false,
		prefix: `${prefix} Error:`,
		messageOrObject,
		object,
	});
};

export const logWarn = (fn: Function, messageOrObject?: any, object?: any) => {
	const prefix = extractPrefix(fn);
	return baseLog({
		cb: console.warn,
		stringify: true,
		prefix: `${prefix} Warning:`,
		messageOrObject,
		object,
	});
};

export const throwError = (
	fn: Function,
	message?: string,
	ErrorClass: new (m: string) => Error = Error
) => {
	const prefix = extractPrefix(fn);
	throw new ErrorClass(`${prefix} Error: ${message}`);
};
