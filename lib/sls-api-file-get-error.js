'use strict';

module.exports = class SlsApiFileGetError extends Error {

	constructor(err) {

		super(err.message);

		this.name = 'SlsApiFileGetError';

		this.previousError = err;
	}
};
