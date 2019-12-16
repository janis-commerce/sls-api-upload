'use strict';

const S3 = require('@janiscommerce/s3');
const { API } = require('@janiscommerce/api');
const SlsApiFileDownloadError = require('./sls-api-file-download-error');

class SlsApiFileDelete extends API {

	async validate() {
		if(!this.model)
			throw new SlsApiFileDownloadError(SlsApiFileDownloadError.messages.MODEL_NOT_DEFINED);

		if(typeof this.model !== 'function')
			throw new SlsApiFileDownloadError(SlsApiFileDownloadError.messages.MODEL_IS_NOT_MODEL_CLASS);

		if(!this.entityIdField)
			throw new SlsApiFileDownloadError(SlsApiFileDownloadError.messages.ENTITY_ID_FIELD_NOT_DEFINED);

		if(typeof this.entityIdField !== 'string')
			throw new SlsApiFileDownloadError(SlsApiFileDownloadError.messages.ENTITY_ID_FIELD_NOT_STRING);

		if(!this.bucket)
			throw new SlsApiFileDownloadError(SlsApiFileDownloadError.messages.BUCKET_NOT_DEFINED);

		if(typeof this.bucket !== 'string')
			throw new SlsApiFileDownloadError(SlsApiFileDownloadError.messages.BUCKET_NOT_STRING);

		const [entityId, fileId] = this.pathParameters;

		this.modelInstance = this.session.getSessionInstance(this.model);

		const [record] = await this.modelInstance.get({ filters: { [this.entityIdField]: entityId, id: fileId } });

		if(!record) {
			this.setCode(404);

			throw new SlsApiFileDownloadError(SlsApiFileDownloadError.messages.FILE_RECORD_NOT_FOUND);
		}

		this.currentRecord = record;
	}


	async process() {
		const url = await S3.getSignedUrl('getObject', { Bucket: this.bucket, Key: this.currentRecord.path });

		this.setBody(url);
	}

}


module.exports = SlsApiFileDelete;
