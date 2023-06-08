'use strict';

const S3 = require('@janiscommerce/s3');

module.exports = async (path, name, bucket, ErrorClass) => {

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
