'use strict';

class SlsApiUploadError extends Error {

	static get messages() {

		return {
			BUCKET_NOT_DEFINED: 'Bucket not defined',
			BUCKET_NOT_STRING: 'Bucket should be return a string',
			PATH_NOT_STRING: 'Path should be return a string',
			FILE_TYPE_NOT_RECOGNIZED: 'File type not recognized',
			AVAILABLE_TYPES_NOT_ARRAY: 'AvailableTypes should be return an array',
			FILE_TYPE_NOT_AVAILABLE: 'File type not available',
			EXPIRATION_NOT_NUMBER: 'Expiration should be return a number',
			LENGTH_RANGE_NOT_ARRAY: 'LengthRange should be return an array',
			LENGTH_RANGE_ITEM_NOT_NUMBER: 'LengthRange item should be a number'
		};

	}

	constructor(err) {
		super(err);
		this.message = err.message || err;
		this.name = 'SlsApiUploadError';
	}
}

module.exports = SlsApiUploadError;
