'use strict';

const { ApiGet } = require('@janiscommerce/api-get');
const SlsApiFileGetError = require('./sls-api-file-get-error');

const { findSignedFile, getSignedFiles, formatUrlForOwnBucket } = require('./helper/format-url');

module.exports = class SlsApiFileGet extends ApiGet {

	async validate() {

		await super.validate();

		if(this.postValidateHook) {
			try {
				await this.postValidateHook();
			} catch(error) {
				throw new Error(error);
			}
		}
	}

	async format(record) {

		const { path, ...currentRecord } = record;

		const url = await this.formatUrl(path, record.name);

		const recordFormatted = this.formatFileData ? await this.formatFileData(currentRecord) : currentRecord;

		return { ...recordFormatted, url };
	}

	async formatUrl(path, name) {

		if(this.bucket)
			return formatUrlForOwnBucket(path, name, this.bucket, SlsApiFileGetError);

		const signedFiles = await getSignedFiles(this.session.clientCode, [path]);
		return findSignedFile(signedFiles, path);
	}
};
