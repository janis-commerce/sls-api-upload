'use strict';

const Model = require('@janiscommerce/model');

class BaseFileModel extends Model {
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

	static get table() {
		return 'files';
	}
}

module.exports = BaseFileModel;
