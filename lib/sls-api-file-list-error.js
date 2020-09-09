'use strict';

module.exports = class SlsApiFileListError extends Error {

	static get messages() {
		return {
			BUCKET_NOT_DEFINED: 'Bucket not defined',
			BUCKET_NOT_STRING: 'Bucket should be return a string'
		};
	}

	constructor(err) {
		super(err.message || err);

		this.name = 'SlsApiFileListError';

		if(err instanceof Error)
			this.previousError = err;
	}
};
