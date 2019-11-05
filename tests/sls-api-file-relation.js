'use strict';

const APITest = require('@janiscommerce/api-test');
const { SlsApiFileRelation } = require('../lib/index');


describe('SlsApiRelation', () => {

	context('test body request', () => {

		const response = { code: 400 };

		APITest(SlsApiFileRelation, [{
			description: 'should return 400 if request body is missing',
			response
		}, {
			description: 'should return 400 if fileName or fileSource in request body is missing 1',
			request: {
				data: { fileName: 'test.txt' }
			},
			response
		}, {
			description: 'should return 400 if fileName or fileSource in request body is missing 2',
			request: {
				data: { fileSource: 'files/ID.txt' }
			},
			response
		}, {
			description: 'should return 400 if add extra data in request body received',
			request: {
				data: { fileName: 'test.txt', fileSource: 'files/ID.txt', test: 'test' }
			},
			response
		}, {
			description: 'should return 400 if fileName has invalid type',
			request: {
				data: { fileName: 1, fileSource: 'files/ID.txt' }
			},
			response
		}, {
			description: 'should return 400 if fileSource has invalid type',
			request: {
				data: { fileName: 'test.txt', fileSource: 1 }
			},
			response
		}]);
	});

});
