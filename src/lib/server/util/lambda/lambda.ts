import { InvocationType, InvokeCommand } from '@aws-sdk/client-lambda';
import { Region, getRegionFromArn } from '..';
import { getLambdaClient } from '.';

export type InvokeLambda<TInput> = {
	functionName: string;
	invocationType: InvocationType;
	payload: TInput;
	region?: Region;
};
/**
 * Calls a lambda function and applies generic types on input and output of function call
 * @param params containing functionName, invocationType and data
 * @returns type lambda function result
 */
export const invokeLambda = async <TInput extends object, TOutput>(
	params: InvokeLambda<TInput>
): Promise<TOutput> => {
	const { region, functionName, invocationType, payload } = params;
	// If no region is set try to extract the region from the arn
	const lambdaRegion = region ?? getRegionFromArn(functionName);
	const { Payload } = await getLambdaClient({ region: lambdaRegion }).send(
		new InvokeCommand({
			FunctionName: functionName,
			InvocationType: invocationType,
			Payload: Buffer.from(JSON.stringify(payload)),
		})
	);
	// Lets not return undefined here
	if (Payload && Payload.length > 0) return JSON.parse(Buffer.from(Payload).toString()) as TOutput;
	return {} as TOutput;
};

export const bulkInvokeLambda = async <Payload extends object, Iterator, Result>(
	ids: Iterator[],
	functionName: string,
	payload: (id: Iterator, i: number) => Payload
) => {
	const settledPromises = await Promise.allSettled(
		ids.map(async (id, i) => {
			return invokeLambda<Payload, void>({
				functionName,
				invocationType: InvocationType.RequestResponse,
				payload: payload(id, i),
			});
		})
	);

	return {
		errors: settledPromises
			.filter((p) => p.status === 'rejected')
			.map((p) => (p as PromiseRejectedResult).reason),

		results: settledPromises
			.filter((p): p is PromiseFulfilledResult<void> => p.status === 'fulfilled')
			.map((p) => p.value) as Result[],
	};
};
