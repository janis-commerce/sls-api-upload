'use strict';

class SlsApiFilDeleteError extends Error {

	static get messages() {

		return {
			BUCKET_NOT_DEFINED: 'Bucket not defined',
			BUCKET_NOT_STRING: 'Bucket should be return a string',
			ENTITY_ID_FIELD_NOT_DEFINED: 'EntityIdField not defined',
			ENTITY_ID_FIELD_NOT_STRING: 'EntityIdField should be return a string',
			TABLE_NOT_DEFINED: 'Table not defined',
			TABLE_NOT_STRING: 'Table should be return a string',
			DATABASEKEY_NOT_STRING: 'DatabaseKey should be return a string',
			FILE_RECORD_NOT_FOUND: 'file record not found'
		};

	}

	constructor(err) {
		super(err);
		this.message = err.message || err;
		this.name = 'SlsApiFilDeleteError';
	}
}

module.exports = SlsApiFilDeleteError;
