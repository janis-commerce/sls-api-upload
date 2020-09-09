'use strict';

const Model = require('@janiscommerce/model');

module.exports = class BaseFileModel extends Model {

	static get table() {
		return 'files';
	}

	static get fields() {
		return {
			id: true,
			path: true,
			size: true,
			name: true,
			type: true,
			dateCreated: true
		};
	}

};
