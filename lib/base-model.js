'use strict';

const Model = require('@janiscommerce/model');

module.exports = class BaseFileModel extends Model {

	static get table() {
		return 'files';
	}

	static get indexes() {
		return [
			{
				name: 'expiration',
				key: {
					expireAt: 1
				},
				expireAfterSeconds: 0
			}
		];
	}
};
