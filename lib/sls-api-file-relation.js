'use strict';

const { struct } = require('superstruct');
const { API } = require('@janiscommerce/api');
const S3 = require('@janiscommerce/s3');
const SlsApiFileRelationError = require('./sls-api-file-relation-error');

class SlsApiFileRelation extends API {

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


	/**
	 * Struct validation with required and custom fields
	 */
	structValidate() {
		const CustomStruct = struct({
			fileName: 'string',
			fileSource: 'string',
			...this.customFieldsStruct
		});

		return CustomStruct(this.data);
	}


	validate() {
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

		if(this.customFieldsStruct && (typeof this.customFieldsStruct !== 'object' || Array.isArray(this.customFieldsStruct)))
			throw new SlsApiFileRelationError(SlsApiFileRelationError.messages.CUSTOM_FIELDS_STRUCT_NOT_OBJECT);

		this.structValidate();
	}


	async process() {
		const [entityId] = this.pathParameters;

		const { fileName: name, fileSource: path, ...additionalData } = this.data;

		const modelInstance = this.session.getSessionInstance(this.model);

		const { ContentLength, ContentType } = await S3.headObject({ Bucket: this.bucket, Key: path });

		const id = await modelInstance.insert({
			[this.entityIdField]: entityId,
			name,
			path,
			mimeType: ContentType,
			type: this.constructor.getSimplifiedType(ContentType),
			size: ContentLength,
			...additionalData
		});

		this
			.setCode(201)
			.setBody({ id });
	}

}


module.exports = SlsApiFileRelation;
