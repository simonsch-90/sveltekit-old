import type { SSTConfig } from 'sst';
import { applicationApi } from './stacks/api';
import { applicationBucket } from './stacks/bucket';
import { userTable } from './stacks/dynamodb';
import { applicationSite } from './stacks/site';

export default {
	config() {
		return {
			name: 'coding',
			region: 'us-east-1',
		};
	},
	stacks(app) {
		app.stack(userTable).stack(applicationBucket).stack(applicationApi).stack(applicationSite);
		if (app.stage !== 'prod') {
			app.setDefaultRemovalPolicy('destroy');
		}
	},
} satisfies SSTConfig;
