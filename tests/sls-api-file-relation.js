'use strict';

const mime = require('mime');
const APITest = require('@janiscommerce/api-test');
const S3 = require('@janiscommerce/s3');
const BaseModel = require('../lib/base-model');
const { SlsApiFileRelation, SlsApiFileRelationError } = require('../lib/index');


describe('SlsApiRelation', () => {
	const apiExtendedSimple = ({
		entityIdField,
		bucket,
		customFieldsStruct,
		model = BaseModel
	} = {}) => {
		class API extends SlsApiFileRelation {
			get entityIdField() {
				return entityIdField;
			}

			get bucket() {
				return bucket;
			}

			get model() {
				return model;
			}

			get customFieldsStruct() {
				return customFieldsStruct || super.customFieldsStruct;
			}
		}

		return API;
	};

	const defaultApiExtended = apiExtendedSimple({
		entityIdField: 'test',
		bucket: 'test'
	});

	const defaultRequestData = { fileName: 'test.js', fileSource: 'files/test.js' };

	context('test validate', () => {
		APITest(apiExtendedSimple({ model: null }), [{
			description: 'should return 400 if model is not defined',
			request: { data: defaultRequestData },
			response: { code: 400, body: { message: SlsApiFileRelationError.messages.MODEL_NOT_DEFINED } }
		}]);

		APITest(apiExtendedSimple({ model: 'model' }), [{
			description: 'should return 400 if model is not a Class',
			request: { data: defaultRequestData },
			response: { code: 400, body: { message: SlsApiFileRelationError.messages.MODEL_IS_NOT_MODEL_CLASS } }
		}]);

		APITest(apiExtendedSimple(), [{
			description: 'should return 400 if entityIdField is not defined',
			request: { data: defaultRequestData },
			response: { code: 400, body: { message: SlsApiFileRelationError.messages.ENTITY_ID_FIELD_NOT_DEFINED } }
		}]);

		APITest(apiExtendedSimple({ entityIdField: 123 }), [{
			description: 'should return 400 if entityIdField is not a string',
			request: { data: defaultRequestData },
			response: { code: 400, body: { message: SlsApiFileRelationError.messages.ENTITY_ID_FIELD_NOT_STRING } }
		}]);

		APITest(apiExtendedSimple({
			entityIdField: 'test'
		}), [{
			description: 'should return 400 if bucket is not defined',
			request: { data: defaultRequestData },
			response: { code: 400, body: { message: SlsApiFileRelationError.messages.BUCKET_NOT_DEFINED } }
		}]);

		APITest(apiExtendedSimple({
			entityIdField: 'test',
			bucket: 123
		}), [{
			description: 'should return 400 if bucket is not a string',
			request: { data: defaultRequestData },
			response: { code: 400, body: { message: SlsApiFileRelationError.messages.BUCKET_NOT_STRING } }
		}]);

		APITest(defaultApiExtended, [{
			description: 'should return 400 if not pass body',
			request: {},
			response: { code: 400 }
		}]);

		APITest(defaultApiExtended, [{
			description: 'should return 400 if not pass fileName in body',
			request: { data: {} },
			response: { code: 400 }
		}]);

		APITest(defaultApiExtended, [{
			description: 'should return 400 if not pass filename string',
			request: { data: { fileName: 132 } },
			response: { code: 400 }
		}]);

		APITest(defaultApiExtended, [{
			description: 'should return 400 if not pass fileSource in body',
			request: { data: { fileName: 'test.js' } },
			response: { code: 400 }
		}]);

		APITest(defaultApiExtended, [{
			description: 'should return 400 if not pass fileSource string',
			request: { data: { fileName: 'test.js', fileSource: 132 } },
			response: { code: 400 }
		}]);

		APITest(defaultApiExtended, [{
			description: 'should return 400 if not pass custom fields in body',
			request: { data: { fileName: 'test.js', fileSource: 'files/test.js', type: 'asdasd' } },
			response: { code: 400 }
		}]);

		APITest(apiExtendedSimple({
			entityIdField: 'test',
			bucket: 'test',
			customFieldsStruct: { type: 'string' }
		}), [{
			description: 'should return 400 if pass incorrect custom fields in body',
			request: { data: { fileName: 'test.js', fileSource: 'files/test.js', type: 132 } },
			response: { code: 400 }
		}]);
	});

	context('test process', () => {
		APITest(defaultApiExtended, [{
			before: sandbox => {
				sandbox.stub(S3, 'headObject').rejects();
				sandbox.stub(BaseModel.prototype, 'insert');
			},
			session: true,
			description: 'should return 500 if fail headObject',
			request: {
				data: { fileName: 'test.png', fileSource: 'files/test.png' },
				pathParameters: [1]
			},
			response: { code: 500 },
			after: (afterResponse, sandbox) => {
				sandbox.assert.calledOnce(S3.headObject);
				sandbox.assert.notCalled(BaseModel.prototype.insert);
			}
		}]);


		APITest(defaultApiExtended, [{
			before: sandbox => {
				sandbox.stub(S3, 'headObject').resolves({
					ContentType: 'image/png',
					ContentLength: 10000
				});
				sandbox.stub(BaseModel.prototype, 'insert').rejects();
			},
			session: true,
			description: 'should return 500 if fail model insert',
			request: {
				data: { fileName: 'test.png', fileSource: 'files/test.png' },
				pathParameters: [1]
			},
			response: { code: 500 },
			after: (afterResponse, sandbox) => {
				sandbox.assert.calledOnce(BaseModel.prototype.insert);
				sandbox.assert.calledOnce(S3.headObject);
			}
		}]);

		APITest(defaultApiExtended, [{
			before: sandbox => {
				sandbox.stub(S3, 'headObject').resolves({
					ContentType: 'image/png',
					ContentLength: 10000
				});
				sandbox.stub(BaseModel.prototype, 'insert').resolves(12345);
			},
			session: true,
			description: 'should return 200 with valid data',
			request: {
				data: { fileName: 'test.png', fileSource: 'files/test.png' },
				pathParameters: [1]
			},
			response: { code: 201, body: { id: 12345 } },
			after: (afterResponse, sandbox) => {
				sandbox.assert.calledWithExactly(BaseModel.prototype.insert, {
					test: 1,
					path: 'files/test.png',
					name: 'test.png',
					mimeType: 'image/png',
					type: 'image',
					size: 10000
				});
			}
		}]);

		APITest(apiExtendedSimple({
			entityIdField: 'test',
			bucket: 'test',
			customFieldsStruct: {
				description: 'string',
				order: 'number'
			}
		}), [{
			before: sandbox => {
				sandbox.stub(S3, 'headObject').resolves({
					ContentType: 'image/png',
					ContentLength: 10000
				});
				sandbox.stub(BaseModel.prototype, 'insert').resolves(12345);
			},
			session: true,
			description: 'should return 200 with valid data and custom fields struct',
			request: {
				data: {
					fileName: 'test.png',
					fileSource: 'files/test.png',
					description: 'test description',
					order: 1
				},
				pathParameters: [1]
			},
			response: { code: 201, body: { id: 12345 } },
			after: (afterResponse, sandbox) => {
				sandbox.assert.calledWithExactly(BaseModel.prototype.insert, {
					test: 1,
					path: 'files/test.png',
					name: 'test.png',
					mimeType: 'image/png',
					type: 'image',
					size: 10000,
					description: 'test description',
					order: 1
				});
			}
		}]);

		const types = [{
			extension: '.jpg',
			type: 'image'
		}, {
			extension: '.gif',
			type: 'image'
		}, {
			extension: '.png',
			type: 'image'
		}, {
			extension: '.jpeg',
			type: 'image'
		}, {
			extension: '.doc',
			type: 'doc'
		}, {
			extension: '.docx',
			type: 'doc'
		}, {
			extension: '.mp4',
			type: 'video'
		}, {
			extension: '.flv',
			type: 'video'
		}, {
			extension: '.mp3',
			type: 'audio'
		}, {
			extension: '.wav',
			type: 'audio'
		}, {
			extension: '.ods',
			type: 'sheet'
		}, {
			extension: '.csv',
			type: 'sheet'
		}, {
			extension: '.xlsx',
			type: 'sheet'
		}, {
			extension: '.xls',
			type: 'sheet'
		}, {
			extension: '.json',
			type: 'other'
		}, {
			extension: '.txt',
			type: 'other'
		}];

		APITest(defaultApiExtended, types.map(({ extension, type }) => ({
			before: sandbox => {
				sandbox.stub(S3, 'headObject').resolves({
					ContentType: mime.getType(extension),
					ContentLength: 10000
				});
				sandbox.stub(BaseModel.prototype, 'insert').resolves(12345);
			},
			session: true,
			description: `should return 200 passing diferents files types in data (${extension})`,
			request: {
				data: { fileName: `test${extension}`, fileSource: `files/test${extension}` },
				pathParameters: [1]
			},
			response: { code: 201, body: { id: 12345 } },
			after: (afterResponse, sandbox) => {
				sandbox.assert.calledWithExactly(BaseModel.prototype.insert, sandbox.match({
					type
				}));
			}
		})));
	});
});
