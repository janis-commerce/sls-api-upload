'use strict';

const S3 = require('@janiscommerce/s3');
const { ApiGet } = require('@janiscommerce/api-get');
const SlsApiFileGetError = require('./sls-api-file-get-error');

class SlsApiFileGet extends ApiGet {

	validateBucket() {
		if(!this.bucket)
			throw new SlsApiFileGetError(SlsApiFileGetError.messages.BUCKET_NOT_DEFINED);

		if(typeof this.bucket !== 'string')
			throw new SlsApiFileGetError(SlsApiFileGetError.messages.BUCKET_NOT_STRING);
	}

	async format(record) {
		this.validateBucket();

		const { path, ...currentRecord } = record;

		let url = null;

		try {
			url = await S3.getSignedUrl('getObject', { Bucket: this.bucket, Key: record.path });
		} catch(error) {
			if(error.statusCode !== 404)
				throw error;
		}

		return { ...currentRecord, url };
	}

}


module.exports = SlsApiFileGet;
