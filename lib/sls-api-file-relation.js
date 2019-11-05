'use strict';

const { API } = require('@janiscommerce/api');

class SlsApiFileRelation extends API {
	get struct() {
		return {
			fileName: 'string',
			fileSource: 'string'
		};
	}
}


module.exports = SlsApiFileRelation;
