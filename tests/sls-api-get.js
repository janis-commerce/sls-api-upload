'use strict';

const glabalSandbox = require('sinon').createSandbox();
const APITest = require('@janiscommerce/api-test');
const S3 = require('@janiscommerce/s3');
const { ApiGet } = require('@janiscommerce/api-get');
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
		mimeType: 'image/png',
		path: '/files/file.jpg',
		type: 'other',
		dateCreated: 1576269240,
		userCreated: 5,
		dateModified: 1576272801,
		userModified: null
	};

	const rowFormatted = {
		id: 20,
		name: 'what.jpeg',
		claimId: 7,
		size: 5014,
		mimeType: 'image/png',
		type: 'other',
		dateCreated: 1576269240,
		userCreated: 5,
		dateModified: 1576272801,
		userModified: null
	};

	const apiExtendedSimple = ({
		bucket
	} = {}) => {
		class API extends SlsApiFileGet {
			get bucket() {
				return bucket;
			}
		}

		return API;
	};

	afterEach(() => {
		glabalSandbox.restore();
	});

	beforeEach(() => {
		glabalSandbox.stub(ApiGet.prototype, '_getModelInstance').returns(new BaseModel());
	});


	context('test validate', () => {
		APITest(apiExtendedSimple(), 'api/entity/1/file/2', [{
			before: sandbox => {
				sandbox.stub(BaseModel.prototype, 'get').resolves([rowGetted]);
				sandbox.stub(S3, 'getSignedUrl');
			},
			request: {},
			description: 'should return 500 if bucket is not defined',
			session: true,
			response: { code: 500, body: { message: SlsApiFileGetError.messages.BUCKET_NOT_DEFINED } }
		}]);

		APITest(apiExtendedSimple({ bucket: 123 }), 'api/entity/1/file/2', [{
			before: sandbox => {
				sandbox.stub(BaseModel.prototype, 'get').resolves([rowGetted]);
				sandbox.stub(S3, 'getSignedUrl');
			},
			description: 'should return 500 if bucket is not a string',
			request: {},
			session: true,
			response: { code: 500, body: { message: SlsApiFileGetError.messages.BUCKET_NOT_STRING } }
		}]);
	});

	context('test process', () => {
		APITest(apiExtendedSimple({ bucket: 'test' }), 'api/entity/1/file/2', [{
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

		APITest(apiExtendedSimple({ bucket: 'test' }), 'api/entity/1/file/2', [{
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

		APITest(apiExtendedSimple({ bucket: 'test' }), 'api/entity/1/file/2', [{
			before: sandbox => {
				sandbox.stub(BaseModel.prototype, 'get').resolves([]);
				sandbox.stub(S3, 'getSignedUrl');
			},
			session: true,
			description: 'should return 404 if not exists current file record',
			request: {
				pathParameters: [1, 2]
			},
			response: { code: 404, body: { message: 'common.message.notFound' } },
			after: (afterResponse, sandbox) => {
				sandbox.assert.called(BaseModel.prototype.get);
				sandbox.assert.notCalled(S3.getSignedUrl);
			}
		}]);

		APITest(apiExtendedSimple({ bucket: 'test' }), 'api/entity/1/file/2', [{
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
					filters: { entity: '1', id: '2' }, limit: 1, page: 1
				});

				sandbox.assert.calledWithExactly(S3.getSignedUrl, 'getObject', {
					Bucket: 'test',
					Key: '/files/file.jpg',
					ResponseContentDisposition: 'attachment'
				});
			}
		}]);

		APITest(apiExtendedSimple({ bucket: 'test' }), 'api/entity/1/file/2', [{
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
					filters: { entity: '1', id: '2' }, limit: 1, page: 1
				});

				sandbox.assert.calledWithExactly(S3.getSignedUrl, 'getObject', {
					Bucket: 'test',
					Key: '/files/file.jpg',
					ResponseContentDisposition: 'attachment'
				});
			}
		}]);
	});
});
