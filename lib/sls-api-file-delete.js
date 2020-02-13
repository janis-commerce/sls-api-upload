'use strict';

const S3 = require('@janiscommerce/s3');
const { API } = require('@janiscommerce/api');
const SlsApiFileDeleteError = require('./sls-api-file-delete-error');

class SlsApiFileDelete extends API {

	async validate() {
		if(!this.model)
			throw new SlsApiFileDeleteError(SlsApiFileDeleteError.messages.MODEL_NOT_DEFINED);

		if(typeof this.model !== 'function')
			throw new SlsApiFileDeleteError(SlsApiFileDeleteError.messages.MODEL_IS_NOT_MODEL_CLASS);

		if(!this.entityIdField)
			throw new SlsApiFileDeleteError(SlsApiFileDeleteError.messages.ENTITY_ID_FIELD_NOT_DEFINED);

		if(typeof this.entityIdField !== 'string')
			throw new SlsApiFileDeleteError(SlsApiFileDeleteError.messages.ENTITY_ID_FIELD_NOT_STRING);

		if(!this.bucket)
			throw new SlsApiFileDeleteError(SlsApiFileDeleteError.messages.BUCKET_NOT_DEFINED);

		if(typeof this.bucket !== 'string')
			throw new SlsApiFileDeleteError(SlsApiFileDeleteError.messages.BUCKET_NOT_STRING);
	}


	async process() {
		const [entityId, fileId] = this.pathParameters;

		this.modelInstance = this.session.getSessionInstance(this.model);

		const filtersParams = { filters: { [this.entityIdField]: entityId, id: fileId } };

		const [record] = await this.modelInstance.get(filtersParams);

		if(!record) {
			this.setCode(404);
			throw new SlsApiFileDeleteError(SlsApiFileDeleteError.messages.FILE_RECORD_NOT_FOUND);
		}

		await this.modelInstance.remove({ id: fileId });

		try {
			await S3.deleteObject({ Bucket: this.bucket, Key: record.path });
		} catch(error) {
			if(error.statusCode !== 404)
				throw new SlsApiFileDeleteError(error);
		}
	}

}


module.exports = SlsApiFileDelete;
