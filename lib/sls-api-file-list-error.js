'use strict';

module.exports = class SlsApiFileListError extends Error {

	static get messages() {
		return {
			INVALID_SORTABLE_FIELDS: 'Invalid Custom Sortable Fields. Must be an Array.',
			INVALID_FILTERS_FIELDS: 'Invalid Custom Available Filters. Must be an Array.'
		};
	}

	constructor(err) {
		super(err.message || err);

		this.name = 'SlsApiFileListError';

		if(err instanceof Error)
			this.previousError = err;
	}
};
