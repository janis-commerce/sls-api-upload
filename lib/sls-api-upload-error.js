'use strict';

class SlsApiUploadError extends Error {

	static get messages() {

		return {
			BUCKET_NOT_DEFINED: 'bucket not defined',
			BUCKET_NOT_STRING: 'bucket should be a string',
			PATH_NOT_STRING: 'path should be a string',
			FILE_TYPE_NOT_RECOGNIZED: 'file type not recognized',
			AVAILABLE_TYPES_NOT_ARRAY: 'availableTypes should be an array',
			FILE_TYPE_NOT_AVAILABLE: 'file type not available'
		};

	}

	constructor(err, code) {
		super(err);
		this.message = err.message || err;
		this.code = code;
		this.name = 'SlsApiUploadError';
	}
}

module.exports = SlsApiUploadError;
