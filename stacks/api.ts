import { Api, StackContext } from 'sst/constructs';

const applicationApi = ({ stack }: StackContext) =>
	new Api(stack, 'api', {
		routes: {},
	});

export { applicationApi };
