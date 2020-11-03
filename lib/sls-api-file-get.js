'use strict';

const S3 = require('@janiscommerce/s3');
const { ApiGet } = require('@janiscommerce/api-get');
const SlsApiFileGetError = require('./sls-api-file-get-error');

module.exports = class SlsApiFileGet extends ApiGet {

	async validate() {

		await super.validate();

		this.validateBucket();

		if(this.postValidateHook) {
			try {
				await this.postValidateHook();
			} catch(error) {
				throw new SlsApiFileGetError(error);
			}
		}
	}

	validateBucket() {

		if(!this.bucket)
			throw new SlsApiFileGetError(SlsApiFileGetError.messages.BUCKET_NOT_DEFINED);

		if(typeof this.bucket !== 'string')
			throw new SlsApiFileGetError(SlsApiFileGetError.messages.BUCKET_NOT_STRING);
	}

	async format(record) {

		const { path, ...currentRecord } = record;

		const url = await this.formatUrl(path, record.name);

		const recordFormatted = this.formatRecord ? await this.formatRecord(currentRecord) : currentRecord;

		return { ...recordFormatted, url };
	}

	async formatUrl(path, name) {

		try {

			const url = await S3.getSignedUrl('getObject', {
				Bucket: this.bucket,
				Key: path,
				ResponseContentDisposition: `attachment; filename="${name}"`
			});

			return url;

		} catch(error) {

			if(error.statusCode !== 404)
				throw new SlsApiFileGetError(error);

			return null;
		}
	}
};
