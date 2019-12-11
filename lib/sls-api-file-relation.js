'use strict';

const { struct } = require('superstruct');
const { API } = require('@janiscommerce/api');
const Model = require('@janiscommerce/model');
const S3 = require('@janiscommerce/s3');
const SlsApiFileRelationError = require('./sls-api-file-relation-error');

const buildModel = (table, dataBaseKey) => class FileModel extends Model {
	get databaseKey() {
		return dataBaseKey;
	}

	static get table() {
		return table;
	}
};

class SlsApiFileRelation extends API {
	/**
	 * Method for take a simplyfied type for save type field
	 * @param {string} mimeType
	 * @returns {string}
	 */
	static getSimplyfiedType(mimeType) {
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

	get table() {
		return 'files';
	}

	get databaseKey() {
		return undefined;
	}

	/**
	 * Custom fields Struct validation
	 */
	get customFieldsStruct() {
		return undefined;
	}


	structValidate() {
		const CustomStruct = struct({
			fileName: 'string',
			fileSource: 'string',
			...this.customFieldsStruct
		});

		return CustomStruct(this.data);
	}

	validate() {
		if(!this.entityIdField)
			throw new SlsApiFileRelationError(SlsApiFileRelationError.messages.ENTITY_ID_FIELD_NOT_DEFINED);

		if(typeof this.entityIdField !== 'string')
			throw new SlsApiFileRelationError(SlsApiFileRelationError.messages.ENTITY_ID_FIELD_NOT_STRING);

		if(!this.bucket)
			throw new SlsApiFileRelationError(SlsApiFileRelationError.messages.BUCKET_NOT_DEFINED);

		if(typeof this.bucket !== 'string')
			throw new SlsApiFileRelationError(SlsApiFileRelationError.messages.BUCKET_NOT_STRING);

		if(!this.table)
			throw new SlsApiFileRelationError(SlsApiFileRelationError.messages.TABLE_NOT_DEFINED);

		if(typeof this.table !== 'string')
			throw new SlsApiFileRelationError(SlsApiFileRelationError.messages.TABLE_NOT_STRING);

		if(this.databaseKey && typeof this.databaseKey !== 'string')
			throw new SlsApiFileRelationError(SlsApiFileRelationError.messages.DATABASEKEY_NOT_STRING);

		if(this.customFieldsStruct && (typeof this.customFieldsStruct !== 'object' || Array.isArray(this.customFieldsStruct)))
			throw new SlsApiFileRelationError(SlsApiFileRelationError.messages.CUSTOM_FIELDS_STRUCT_NOT_OBJECT);

		this.structValidate();
	}

	async process() {
		const [entityId] = this.pathParameters;

		const {
			fileName: name,
			fileSource: path,
			...additionalData
		} = this.data;

		const model = buildModel(this.table, this.databaseKey);

		const modelInstance = this.session.getSessionInstance(model);

		const { ContentLength, ContentType } = await S3.headObject({
			Bucket: this.bucket,
			Key: path
		});

		const id = await modelInstance.insert({
			[this.entityIdField]: entityId,
			name,
			path,
			mimeType: ContentType,
			type: this.constructor.getSimplyfiedType(ContentType),
			size: ContentLength,
			...additionalData
		});

		this
			.setCode(201)
			.setBody({ id });
	}


}


module.exports = SlsApiFileRelation;
