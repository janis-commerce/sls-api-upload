'use strict';

const { Invoker } = require('@janiscommerce/lambda');
const S3 = require('@janiscommerce/s3');

const getSignedFiles = async (clientCode, paths) => {

	if(!paths.length)
		return {};

	const { payload, statusCode } = await Invoker.serviceSafeClientCall('storage', 'GetSignedFiles', clientCode, { paths });

	return (statusCode === 200 && payload) || {};
};

const findSignedFile = (signedFiles, path) => {

	if(!path)
		return null;

	return signedFiles[path] || null;
};

const formatUrlForOwnBucket = async (path, name, bucket, ErrorClass) => {

	if(!path)
		return;

	try {

		const url = await S3.getSignedUrl({
			Bucket: bucket,
			Key: path,
			ResponseContentDisposition: `attachment; filename="${name}"`
		});

		return url;

	} catch(error) {

		if(error.statusCode !== 404)
			throw new ErrorClass(error);

		return null;
	}
};

module.exports = {
	getSignedFiles,
	findSignedFile,
	formatUrlForOwnBucket
};
