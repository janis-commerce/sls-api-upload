'use strict';

module.exports = class SlsApiFileGetCredentialsError extends Error {

	static get messages() {
		return {
			ENTITY_NOT_DEFINED: 'Entity not defined',
			ENTITY_NOT_STRING: 'Entity should be return a string'
		};
	}

	constructor(err) {
		super(err.message || err);

		this.name = 'SlsApiFileGetCredentialsError';

		if(err instanceof Error)
			this.previousError = err;
	}

};
