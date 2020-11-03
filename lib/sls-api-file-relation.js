'use strict';

const { API } = require('@janiscommerce/api');
const S3 = require('@janiscommerce/s3');
const SlsApiFileRelationError = require('./sls-api-file-relation-error');

module.exports = class SlsApiFileRelation extends API {

	get entityId() {

		const [entityId] = this.pathParameters;

		return entityId;
	}

	/**
	 * Method for take a simplified type for save type field
	 * @param {string} mimeType
	 * @returns {string}
	 */
	static getSimplifiedType(mimeType) {
		switch(true) {
			case /image/.test(mimeType):
				return 'image';

			case /video/.test(mimeType):
				return 'video';

			case /audio/.test(mimeType):
				return 'audio';

			case /msword|wordprocessingml\.document/.test(mimeType):
				return 'doc';

			case /ms-excel|spreadsheet|csv/.test(mimeType):
				return 'sheet';

			default:
				return 'other';
		}
	}


	/**
	 * Custom fields Struct validation
	 */
	get customFieldsStruct() {
		return undefined;
	}


	get struct() {
		return {
			fileName: 'string',
			fileSource: 'string',
			...this.customFieldsStruct
		};
	}


	async validate() {

		if(!this.model)
			throw new SlsApiFileRelationError(SlsApiFileRelationError.messages.MODEL_NOT_DEFINED);

		if(typeof this.model !== 'function')
			throw new SlsApiFileRelationError(SlsApiFileRelationError.messages.MODEL_IS_NOT_MODEL_CLASS);

		if(!this.entityIdField)
			throw new SlsApiFileRelationError(SlsApiFileRelationError.messages.ENTITY_ID_FIELD_NOT_DEFINED);

		if(typeof this.entityIdField !== 'string')
			throw new SlsApiFileRelationError(SlsApiFileRelationError.messages.ENTITY_ID_FIELD_NOT_STRING);

		if(!this.bucket)
			throw new SlsApiFileRelationError(SlsApiFileRelationError.messages.BUCKET_NOT_DEFINED);

		if(typeof this.bucket !== 'string')
			throw new SlsApiFileRelationError(SlsApiFileRelationError.messages.BUCKET_NOT_STRING);

		if(this.postValidateHook) {
			try {
				await this.postValidateHook();
			} catch(error) {
				throw new SlsApiFileRelationError(error);
			}
		}
	}

	async process() {

		const modelInstance = this.session.getSessionInstance(this.model);

		try {

			const dataFormatted = await this.formatFileData();

			const id = await modelInstance.insert(dataFormatted);

			if(this.postSaveHook)
				await this.postSaveHook(id, dataFormatted);

			this.setCode(201).setBody({ id });

		} catch(error) {
			throw new SlsApiFileRelationError(error);
		}
	}

	async formatFileData() {

		const { fileName: name, fileSource: path, ...additionalData } = this.data;

		const { ContentLength, ContentType } = await S3.headObject({ Bucket: this.bucket, Key: path });

		const additionalDataFormatted = this.format ? await this.format(additionalData) : additionalData;

		return {
			[this.entityIdField]: this.entityId,
			name,
			path,
			mimeType: ContentType,
			type: this.constructor.getSimplifiedType(ContentType),
			size: ContentLength,
			...additionalDataFormatted
		};
	}
};
