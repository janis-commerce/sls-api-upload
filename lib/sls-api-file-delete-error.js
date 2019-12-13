'use strict';

class SlsApiFilDeleteError extends Error {

	static get messages() {

		return {
			BUCKET_NOT_DEFINED: 'Bucket not defined',
			BUCKET_NOT_STRING: 'Bucket should be return a string',
			ENTITY_ID_FIELD_NOT_DEFINED: 'EntityIdField not defined',
			ENTITY_ID_FIELD_NOT_STRING: 'EntityIdField should be return a string',
			MODEL_NOT_DEFINED: 'Model not defined',
			MODEL_IS_NOT_MODEL_CLASS: 'Model is not a Model Class',
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
