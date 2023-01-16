'use strict';

const { ApiGet } = require('@janiscommerce/api-get');

const { findSignedFile, getSignedFiles } = require('./helper/format-url');

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

		const url = await this.formatUrl(path);

		const recordFormatted = this.formatFileData ? await this.formatFileData(currentRecord) : currentRecord;

		return { ...recordFormatted, url };
	}

	async formatUrl(path) {
		const signedFiles = await getSignedFiles(this.session.clientCode, [path]);
		return findSignedFile(signedFiles, path);
	}
};
