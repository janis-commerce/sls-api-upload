'use strict';

class SlsApiUploadError extends Error {

	static get messages() {

		return {
			BUCKET_NOT_DEFINED: 'bucket not defined',
			BUCKET_NOT_STRING: 'bucket should be return a string',
			PATH_NOT_STRING: 'path should be return a string',
			FILE_TYPE_NOT_RECOGNIZED: 'file type not recognized',
			AVAILABLE_TYPES_NOT_ARRAY: 'availableTypes should be return an array',
			FILE_TYPE_NOT_AVAILABLE: 'file type not available',
			EXPIRATION_NOT_NUMBER: 'expiration should be return a number',
			LENGTH_RANGE_NOT_ARRAY: 'lengthRange should be return an array',
			LENGTH_RANGE_ITEM_NOT_NUMBER: 'lengthRange item should be a number'
		};

	}

	constructor(err) {
		super(err);
		this.message = err.message || err;
		this.name = 'SlsApiUploadError';
	}
}

module.exports = SlsApiUploadError;
