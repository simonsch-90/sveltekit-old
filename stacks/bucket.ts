import * as cdk from 'aws-cdk-lib';
import { Bucket, StackContext } from 'sst/constructs';

const applicationBucket = ({ stack }: StackContext) => {
	const bucket = new Bucket(stack, 'filebucket', {
		cdk: {
			bucket: {
				autoDeleteObjects: true,
				removalPolicy: cdk.RemovalPolicy.DESTROY,
			},
		},
	});

	return bucket;
};

export { applicationBucket };
