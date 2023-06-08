'use strict';

const globalSandbox = require('sinon').createSandbox();
const APITest = require('@janiscommerce/api-test');
const S3 = require('@janiscommerce/s3');
const { ApiGet } = require('@janiscommerce/api-get');
const BaseModel = require('../lib/base-model');
const { SlsApiFileGet, SlsApiFileGetError } = require('../lib/index');


describe('SlsApiFileGet', () => {

	const url =
		'https://bucket.s3.amazonaws.com/files/a87a83d3-f494-4069-a0f7-fa0894590072.png?AWSAccessKeyId=0&Expires=0&Signature=0';

	const rowGetted = {
		id: 20,
		name: 'file.png',
		claimId: 7,
		size: 5014,
		mimeType: 'image/png',
		path: '/files/a87a83d3-f494-4069-a0f7-fa0894590072.png',
		type: 'image',
		dateCreated: 1576269240,
		userCreated: 5,
		dateModified: 1576272801,
		userModified: null
	};

	const rowFormatted = {
		id: 20,
		name: 'file.png',
		claimId: 7,
		size: 5014,
		mimeType: 'image/png',
		type: 'image',
		dateCreated: 1576269240,
		userCreated: 5,
		dateModified: 1576272801,
		userModified: null
	};

	const bucketParams = {
		Bucket: 'test',
		Key: '/files/a87a83d3-f494-4069-a0f7-fa0894590072.png',
		ResponseContentDisposition: 'attachment; filename="file.png"'
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

	const defaultApiExtended = apiExtendedSimple({ bucket: 'test' });

	const apiCustom = ({
		postValidateHook = () => true,
		formatFileData = data => data
	}) => class CustomApi extends defaultApiExtended {

		postValidateHook() {
			return postValidateHook();
		}

		formatFileData(data) {
			return formatFileData(data);
		}
	};

	afterEach(() => {
		globalSandbox.restore();
	});

	beforeEach(() => {
		globalSandbox.stub(ApiGet.prototype, '_getModelInstance').returns(new BaseModel());
	});


	context('Validate', () => {

		APITest(apiExtendedSimple(), 'api/entity/1/file/2', [{
			description: 'Should return 500 if bucket is not defined',
			session: true,
			response: { code: 400, body: { message: SlsApiFileGetError.messages.BUCKET_NOT_DEFINED } },
			request: {}
		}]);

		APITest(apiExtendedSimple({ bucket: 123 }), 'api/entity/1/file/2', [{
			description: 'Should return 500 if bucket is not a string',
			request: {},
			session: true,
			response: { code: 400, body: { message: SlsApiFileGetError.messages.BUCKET_NOT_STRING } }
		}]);

		APITest(apiCustom({
			postValidateHook: () => { throw new Error('Fails'); }
		}), 'api/entity/1/file/2', [{
			description: 'Should return 400, if fail custom Validation',
			session: true,
			request: {
				pathParameters: [1, 2]
			},
			response: { code: 400 }
		}]);
	});

	context('Process', () => {

		APITest(defaultApiExtended, 'api/entity/1/file/2', [
			{
				description: 'Should return 500. if fail get current file record',
				session: true,
				request: {
					pathParameters: [1, 2]
				},
				response: { code: 500 },
				before: sandbox => {
					sandbox.stub(BaseModel.prototype, 'get').rejects();
					sandbox.stub(S3, 'getSignedUrl');
				},
				after: (afterResponse, sandbox) => {
					sandbox.assert.calledOnce(BaseModel.prototype.get);
					sandbox.assert.notCalled(S3.getSignedUrl);
				}
			},
			{
				description: 'Should return 500 if fail getSignedUrl',
				session: true,
				request: {
					pathParameters: [1, 2]
				},
				response: { code: 500 },
				before: sandbox => {
					sandbox.stub(BaseModel.prototype, 'get').resolves([rowGetted]);
					sandbox.stub(S3, 'getSignedUrl').rejects();
				},
				after: (afterResponse, sandbox) => {
					sandbox.assert.calledOnce(BaseModel.prototype.get);
					sandbox.assert.calledOnce(S3.getSignedUrl);
				}
			},
			{
				description: 'Should return 404 if not exists current file record',
				session: true,
				request: {
					pathParameters: [1, 2]
				},
				response: { code: 404, body: { message: 'common.message.notFound' } },
				before: sandbox => {
					sandbox.stub(BaseModel.prototype, 'get').resolves([]);
					sandbox.stub(S3, 'getSignedUrl');
				},
				after: (afterResponse, sandbox) => {
					sandbox.assert.calledOnce(BaseModel.prototype.get);
					sandbox.assert.notCalled(S3.getSignedUrl);
				}
			},
			{
				description: 'Should return 200 if get file and get url correctly',
				session: true,
				request: {
					pathParameters: [1, 2]
				},
				response: { code: 200, body: { ...rowFormatted, url } },
				before: sandbox => {
					sandbox.stub(BaseModel.prototype, 'get').resolves([rowGetted]);
					sandbox.stub(S3, 'getSignedUrl').resolves(url);
				},
				after: (afterResponse, sandbox) => {
					sandbox.assert.calledWithExactly(BaseModel.prototype.get, {
						filters: { entity: '1', id: '2' }, limit: 1, page: 1
					});

					sandbox.assert.calledWithExactly(S3.getSignedUrl, bucketParams);
				}
			},
			{
				description: 'Should return 200 with valid data but file not exist in s3',
				session: true,
				request: {
					pathParameters: [1, 2]
				},
				response: { code: 200, body: { ...rowFormatted, url: null } },
				before: sandbox => {
					sandbox.stub(BaseModel.prototype, 'get').resolves([rowGetted]);
					sandbox.stub(S3, 'getSignedUrl').rejects({
						statusCode: 404
					});
				},
				after: (afterResponse, sandbox) => {
					sandbox.assert.calledWithExactly(BaseModel.prototype.get, {
						filters: { entity: '1', id: '2' }, limit: 1, page: 1
					});

					sandbox.assert.calledWithExactly(S3.getSignedUrl, bucketParams);
				}
			}
		]);

		APITest(apiCustom({}), 'api/entity/1/file/2', [
			{
				description: 'Should return 200 with custom validation',
				session: true,
				request: {
					pathParameters: [1, 2]
				},
				response: { code: 200, body: { ...rowFormatted, url } },
				before: sandbox => {
					sandbox.stub(BaseModel.prototype, 'get').resolves([rowGetted]);
					sandbox.stub(S3, 'getSignedUrl').resolves(url);
				},
				after: (afterResponse, sandbox) => {
					sandbox.assert.calledWithExactly(BaseModel.prototype.get, {
						filters: { entity: '1', id: '2' }, limit: 1, page: 1
					});

					sandbox.assert.calledWithExactly(S3.getSignedUrl, bucketParams);
				}
			}
		]);

		APITest(apiCustom({
			formatFileData: () => { throw new Error(); }
		}), 'api/entity/1/file/2', [
			{
				description: 'Should return 500 if fails formatFileData',
				session: true,
				request: {
					pathParameters: [1, 2]
				},
				response: { code: 500 },
				before: sandbox => {
					sandbox.stub(BaseModel.prototype, 'get').resolves([rowGetted]);
					sandbox.stub(S3, 'getSignedUrl').resolves(url);
				},
				after: (afterResponse, sandbox) => {
					sandbox.assert.calledWithExactly(BaseModel.prototype.get, {
						filters: { entity: '1', id: '2' }, limit: 1, page: 1
					});

					sandbox.assert.calledWithExactly(S3.getSignedUrl, bucketParams);
				}
			}
		]);

		APITest(apiCustom({
			formatFileData: data => ({ ...data, order: 1 })
		}), 'api/entity/1/file/2', [
			{
				description: 'Should return 200 with custom format adding field',
				session: true,
				request: {
					pathParameters: [1, 2]
				},
				response: { code: 200, body: { ...rowFormatted, url, order: 1 } },
				before: sandbox => {
					sandbox.stub(BaseModel.prototype, 'get').resolves([rowGetted]);
					sandbox.stub(S3, 'getSignedUrl').resolves(url);
				},
				after: (afterResponse, sandbox) => {
					sandbox.assert.calledWithExactly(BaseModel.prototype.get, {
						filters: { entity: '1', id: '2' }, limit: 1, page: 1
					});

					sandbox.assert.calledWithExactly(S3.getSignedUrl, bucketParams);
				}
			}
		]);
	});
});
