import { type IBackOffOptions, backOff } from 'exponential-backoff';
import { RateLimiter } from 'limiter-es6-compat';

type ExecutionInput<TOutput> = {
	/** The caller function name for logging */
	functionName: string;
	/** Function which processes data on execution */
	func: () => Promise<TOutput>;
};

type RateLimitInput<TOutput> = ExecutionInput<TOutput> & {
	/** Limiters containing detailed configuration for rate limiting */
	limiters?: RateLimiter[];
};

type BackOffInput<TOutput> = ExecutionInput<TOutput> & {
	/** Object containing detailed configuration for application of exponential backOff */
	requestBackOff: RequestBackOff;
};

type RateLimitAndBackOffInput<TOutput> = RateLimitInput<TOutput> & BackOffInput<TOutput>;

export type RequestBackOff = Pick<IBackOffOptions, 'jitter' | 'startingDelay' | 'numOfAttempts'> & {
	errorCondition?: (error: any) => boolean | Promise<boolean>;
};

/**
 * This function decides wether to retry or not to retry an function execution during exponential backOff
 * @param functionName of the parent caller function
 * @param requestBackOff options containing conditions to decide if retry or not
 * @returns backoff options
 */
export const backOffOptions = (
	functionName: string,
	requestBackOff: RequestBackOff
): Partial<IBackOffOptions> => ({
	...requestBackOff,
	retry: async (e, attemptNumber) => {
		console.log('error name:', e.name);
		if (!requestBackOff.errorCondition || (await requestBackOff.errorCondition(e))) {
			console.log(
				`[${functionName}] Attempt ${attemptNumber} failed. ${
					requestBackOff.numOfAttempts - attemptNumber
				} left.`
			);
			/** In this case we entered a retryable error */
			return true;
		}
		/** No backoff error and no error condition met, means we entered a non retryable error */
		console.log(`[${functionName}] Not retryable error occurred: `, e);
		return false;
	},
});

/**
 * A function execution under rate limited conditions
 * @param input containing, function to be called, data and ratelimit configurations
 * @returns result of function execution
 */
export const rateLimitExecution = async <TOutput>(input: RateLimitInput<TOutput>) => {
	const { functionName, func, limiters } = input;
	if (limiters) {
		const remainingLimits = await Promise.all(limiters.map((limiter) => limiter?.removeTokens(1)));
		if (remainingLimits.some((limit) => limit && limit <= 1))
			console.log(`[${functionName}] throttling requests`, remainingLimits);
	}
	return func();
};

/**
 * A function execution under application of exponential backOff algorithm
 * @param input containing, function to be called, data and backOff configurations
 * @returns result of function execution
 */
export const backOffExecution = async <TOutput>(input: BackOffInput<TOutput>) => {
	const { functionName, func, requestBackOff } = input;
	return backOff(func, backOffOptions(functionName, requestBackOff));
};

/**
 * A function execution under application of exponential backOff algorithm and rate limited conditions
 * @param input containing, function to be called, data, backOff configurations and rate limit configurations
 * @returns result of function execution
 */
export const rateLimitAndBackOffExecution = async <TOutput>(
	input: RateLimitAndBackOffInput<TOutput>
) => {
	const { functionName, requestBackOff } = input;
	const request = rateLimitExecution(input);
	if (!requestBackOff) return request;
	return backOff(async () => request, backOffOptions(functionName, requestBackOff));
};
