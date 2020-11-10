'use strict';

const { ApiGet } = require('@janiscommerce/api-get');
const SlsApiFileGetError = require('./sls-api-file-get-error');

const formatUrlDefault = require('./helper/format-url');

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

		const recordFormatted = this.formatFileData ? await this.formatFileData(currentRecord) : currentRecord;

		return { ...recordFormatted, url };
	}

	formatUrl(path, name) {
		return formatUrlDefault(path, name, this.bucket, SlsApiFileGetError);
	}
};
