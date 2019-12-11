'use strict';

const { struct } = require('superstruct');
const { API } = require('@janiscommerce/api');
const Model = require('@janiscommerce/model');
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
	get table() {
		return 'files';
	}

	get databaseKey() {
		return undefined;
	}

	get customFields() {
		return [];
	}

	get customFieldsStruct() {
		return undefined;
	}

	validate() {
		if(this.customFields.length) {
			if(!this.customFields.every(field => field === 'string'))
				throw new SlsApiFileRelationError(SlsApiFileRelationError.messages.CUSTOM_FIELDS_NOT_ARRAY_OF_STRINGS);
		}

		if(this.customFieldsStruct && (typeof this.customFieldsStruct !== 'object' || Array.isArray(this.customFieldsStruct)))
			throw new SlsApiFileRelationError(SlsApiFileRelationError.messages.CUSTOM_FIELDS_STRUCT_NOT_OBJECT);

		const CustomStruct = struct({
			fileName: 'string',
			fileSource: 'string',
			...this.customFieldsStruct
		});

		CustomStruct(this.data);

		if(!this.entityIdField)
			throw new SlsApiFileRelationError(SlsApiFileRelationError.messages.ENTITY_ID_FIELD_NOT_DEFINED);

		if(typeof this.entityIdField !== 'string')
			throw new SlsApiFileRelationError(SlsApiFileRelationError.messages.ENTITY_ID_FIELD_NOT_STRING);

		if(!this.bucket)
			throw new SlsApiFileRelationError(SlsApiFileRelationError.messages.BUCKET_NOT_DEFINED);

		if(typeof this.bucket !== 'string')
			throw new SlsApiFileRelationError(SlsApiFileRelationError.messages.BUCKET_NOT_STRING);

		if(typeof this.table !== 'string')
			throw new SlsApiFileRelationError(SlsApiFileRelationError.messages.TABLE_NOT_STRING);

		if(this.databaseKey && typeof this.databaseKey !== 'string')
			throw new SlsApiFileRelationError(SlsApiFileRelationError.messages.DATABASEKEY_NOT_STRING);

	}

	async process() {
		const [id] = this.pathParameters;

		const {
			fileName: name,
			fileSource: path,
			...data
		} = this.data;

		const model = buildModel(this.table, this.databaseKey);

		const modelInstance = this.session.getInstance(model);

		const insertedId = await modelInstance.insert({
			[this.entityIdField]: id,
			name,
			path,
			...data
		});

		console.log(insertedId);

		this
			.setCode(201)
			.setBody({ id: 'test' });
	}


}


module.exports = SlsApiFileRelation;
