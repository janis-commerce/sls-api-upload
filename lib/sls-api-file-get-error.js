'use strict';

module.exports = class SlsApiFileGetError extends Error {

	static get messages() {
		return {
			ENTITY_ID_FIELD_NOT_DEFINED: 'EntityIdField not defined',
			ENTITY_ID_FIELD_NOT_STRING: 'EntityIdField should be return a string',
			MODEL_NOT_DEFINED: 'Model not defined',
			MODEL_IS_NOT_MODEL_CLASS: 'Model is not a Model Class',
			FILE_RECORD_NOT_FOUND: 'file record not found'
		};
	}

	constructor(err) {
		super(err.message || err);

		this.name = 'SlsApiFileGetError';

		if(err instanceof Error)
			this.previousError = err;
	}
};
