'use strict';

const Model = require('@janiscommerce/model');

module.exports = class BaseFileModel extends Model {

	static get table() {
		return 'files';
	}
};
