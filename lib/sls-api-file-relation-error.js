'use strict';

module.exports = class SlsApiFileRelationError extends Error {

	static get messages() {
		return {
			BUCKET_NOT_DEFINED: 'Bucket not defined',
			BUCKET_NOT_STRING: 'Bucket should be return a string',
			ENTITY_ID_FIELD_NOT_DEFINED: 'EntityIdField not defined',
			ENTITY_ID_FIELD_NOT_STRING: 'EntityIdField should be return a string',
			MODEL_NOT_DEFINED: 'Model not defined',
			MODEL_IS_NOT_MODEL_CLASS: 'Model is not a Model Class',
			INVALID_SORTABLE_FIELDS: 'Invalid Custom Sortable Fields. Must be an Array.',
			INVALID_FILTERS_FIELDS: 'Invalid Custom Available Filters. Must be an Array.'
		};
	}

	constructor(err) {
		super(err.message || err);

		this.name = 'SlsApiFileRelationError';

		if(err instanceof Error)
			this.previousError = err;
	}
};
