'use strict';

class SlsApiUploadError extends Error {

	static get messages() {

		return {
			BUCKET_NOT_DEFINED: 'Bucket not defined',
			BUCKET_NOT_STRING: 'Bucket should be return a string',
			ENTITY_ID_FIELD_NOT_DEFINED: 'EntityIdField not defined',
			ENTITY_ID_FIELD_NOT_STRING: 'EntityIdField should be return a string',
			TABLE_NOT_STRING: 'Table should be return a string',
			CUSTOM_FIELDS_NOT_ARRAY_OF_STRINGS: 'CustomFields should be an array of strings.',
			CUSTOM_FIELDS_STRUCT_NOT_OBJECT: 'CustomFieldsStruct should be a object',
			DATABASEKEY_NOT_STRING: 'DatabaseKey should be return a string'
		};

	}

	constructor(err) {
		super(err);
		this.message = err.message || err;
		this.name = 'SlsApiFileRelationError';
	}
}

module.exports = SlsApiUploadError;
