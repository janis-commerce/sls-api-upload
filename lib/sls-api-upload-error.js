'use strict';

class SlsApiUploadError extends Error {

	static get codes() {

		return {
			BUCKET_NOT_DEFINED: 1,
			PATH_NOT_DEFINED: 2,
			FILE_NAME_NOT_DEFINED: 3
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
