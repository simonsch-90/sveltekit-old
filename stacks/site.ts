import { StackContext, SvelteKitSite, use } from 'sst/constructs';
import { applicationApi } from './api';
import { applicationBucket } from './bucket';
import { userTable } from './dynamodb';

const applicationSite = ({ stack }: StackContext) => {
	const api = use(applicationApi);
	const bucket = use(applicationBucket);
	const userDbTable = use(userTable);

	const site = new SvelteKitSite(stack, 'site', {
		bind: [api, bucket, userDbTable],
		environment: {
			VITE_APP_API_URL: api.url,
		},
	});
	stack.addOutputs({
		url: site.url,
	});
	return site;
};

export { applicationSite };
