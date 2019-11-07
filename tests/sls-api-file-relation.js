'use strict';

const APITest = require('@janiscommerce/api-test');
const { SlsApiFileRelation } = require('../lib/index');


describe('SlsApiRelation', () => {

	context('test request body', () => {

		const response = { code: 400 };

		APITest(SlsApiFileRelation, [{
			description: 'should return 400 if request body is missing',
			response
		}, {
			description: 'should return 400 if request body data is empty',
			response,
			data: {}
		}, {
			description: 'should return 400 if fileSource in request body is missing',
			request: {
				data: { fileName: 'test.txt' }
			},
			response
		}, {
			description: 'should return 400 if fileName in request body is missing',
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

	class MyApiRelation extends SlsApiFileRelation {
		process() {}
	}

	APITest(MyApiRelation, [
		{
			description: 'should return 200 if request body is valid',
			request: {
				data: { fileName: 'test.txt', fileSource: 'files/ID.txt' }
			},
			response: {}
		}
	]);

});
