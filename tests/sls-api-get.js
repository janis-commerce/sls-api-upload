'use strict';

const APITest = require('@janiscommerce/api-test');
const S3 = require('@janiscommerce/s3');
const BaseModel = require('../lib/base-model');
const { SlsApiFileGet, SlsApiFileGetError } = require('../lib/index');


describe('SlsApiFileGet', () => {
	const url =
		'https://bucket.s3.amazonaws.com/fizzmodarg/uploads/2019/11/27/6dbe6f910adb.png?AWSAccessKeyId=asd456&Expires=1576516295&Signature=asd456';

	const rowGetted = {
		id: 20,
		name: 'what.jpeg',
		claimId: 7,
		size: 5014,
		path: '/files/file.jpg',
		type: 'image',
		dateCreated: 1576269240
	};

	const rowFormatted = {
		id: 20,
		name: 'what.jpeg',
		claimId: 7,
		size: 5014,
		type: 'image',
		dateCreated: 1576269240
	};

	const apiExtendedSimple = ({
		entityIdField,
		bucket,
		model = BaseModel
	} = {}) => {
		class API extends SlsApiFileGet {
			get entityIdField() {
				return entityIdField;
			}

			get bucket() {
				return bucket;
			}
		}

		if(model !== undefined) {
			Object.defineProperty(API.prototype, 'model', {
				get: () => model
			});
		}

		return API;
	};


	context('test validate', () => {
		APITest(apiExtendedSimple({ model: null }), [{
			description: 'should return 400 if model is not defined',
			response: { code: 400, body: { message: SlsApiFileGetError.messages.MODEL_NOT_DEFINED } }
		}]);

		APITest(apiExtendedSimple({ model: 'model' }), [{
			description: 'should return 400 if model is not defined',
			response: { code: 400, body: { message: SlsApiFileGetError.messages.MODEL_IS_NOT_MODEL_CLASS } }
		}]);

		APITest(apiExtendedSimple(), [{
			description: 'should return 400 if entityIdField is not defined',
			response: { code: 400, body: { message: SlsApiFileGetError.messages.ENTITY_ID_FIELD_NOT_DEFINED } }
		}]);

		APITest(apiExtendedSimple({ entityIdField: 123 }), [{
			description: 'should return 400 if entityIdField is not a string',
			response: { code: 400, body: { message: SlsApiFileGetError.messages.ENTITY_ID_FIELD_NOT_STRING } }
		}]);

		APITest(apiExtendedSimple({
			entityIdField: 'test'
		}), [{
			description: 'should return 400 if bucket is not defined',
			response: { code: 400, body: { message: SlsApiFileGetError.messages.BUCKET_NOT_DEFINED } }
		}]);

		APITest(apiExtendedSimple({
			entityIdField: 'test',
			bucket: 123
		}), [{
			description: 'should return 400 if bucket is not a string',
			response: { code: 400, body: { message: SlsApiFileGetError.messages.BUCKET_NOT_STRING } }
		}]);
	});

	context('test process', () => {
		APITest(apiExtendedSimple({
			entityIdField: 'test',
			bucket: 'test'
		}), [{
			before: sandbox => {
				sandbox.stub(BaseModel.prototype, 'get').rejects();
				sandbox.stub(S3, 'getSignedUrl');
			},
			session: true,
			description: 'should return 500. if fail get current file record',
			request: {
				pathParameters: [1, 2]
			},
			response: { code: 500 },
			after: (afterResponse, sandbox) => {
				sandbox.assert.called(BaseModel.prototype.get);
				sandbox.assert.notCalled(S3.getSignedUrl);
			}
		}]);

		APITest(apiExtendedSimple({
			entityIdField: 'test',
			bucket: 'test'
		}), [{
			before: sandbox => {
				sandbox.stub(BaseModel.prototype, 'get').resolves([rowGetted]);
				sandbox.stub(S3, 'getSignedUrl').rejects();
			},
			session: true,
			description: 'should return 500 if fail getSignedUrl',
			request: {
				pathParameters: [1, 2]
			},
			response: { code: 500 },
			after: (afterResponse, sandbox) => {
				sandbox.assert.called(BaseModel.prototype.get);
				sandbox.assert.called(S3.getSignedUrl);
			}
		}]);

		APITest(apiExtendedSimple({
			entityIdField: 'test',
			bucket: 'test'
		}), [{
			before: sandbox => {
				sandbox.stub(BaseModel.prototype, 'get').resolves([]);
				sandbox.stub(S3, 'getSignedUrl');
			},
			session: true,
			description: 'should return 404 if not exists current file record',
			request: {
				pathParameters: [1, 2]
			},
			response: { code: 404, body: { message: SlsApiFileGetError.messages.FILE_RECORD_NOT_FOUND } },
			after: (afterResponse, sandbox) => {
				sandbox.assert.called(BaseModel.prototype.get);
				sandbox.assert.notCalled(S3.getSignedUrl);
			}
		}]);

		APITest(apiExtendedSimple({
			entityIdField: 'test',
			bucket: 'test'
		}), [{
			before: sandbox => {
				sandbox.stub(BaseModel.prototype, 'get').resolves([rowGetted]);
				sandbox.stub(S3, 'getSignedUrl').resolves(url);
			},
			session: true,
			description: 'should return 200 if get file and get url correctly',
			request: {
				pathParameters: [1, 2]
			},
			response: { code: 200, body: { ...rowFormatted, url } },
			after: (afterResponse, sandbox) => {
				sandbox.assert.calledWithExactly(BaseModel.prototype.get, {
					filters: { test: 1, id: 2 }
				});

				sandbox.assert.calledWithExactly(S3.getSignedUrl, 'getObject', {
					Bucket: 'test',
					Key: '/files/file.jpg'
				});
			}
		}]);

		APITest(apiExtendedSimple({
			entityIdField: 'test',
			bucket: 'test'
		}), [{
			before: sandbox => {
				sandbox.stub(BaseModel.prototype, 'get').resolves([rowGetted]);
				sandbox.stub(S3, 'getSignedUrl').rejects({
					statusCode: 404
				});
			},
			session: true,
			description: 'should return 200 with valid data but file not exist in s3',
			request: {
				pathParameters: [1, 2]
			},
			response: { code: 200, body: { ...rowFormatted, url: null } },
			after: (afterResponse, sandbox) => {
				sandbox.assert.calledWithExactly(BaseModel.prototype.get, {
					filters: { test: 1, id: 2 }
				});

				sandbox.assert.calledWithExactly(S3.getSignedUrl, 'getObject', {
					Bucket: 'test',
					Key: '/files/file.jpg'
				});
			}
		}]);
	});
});
