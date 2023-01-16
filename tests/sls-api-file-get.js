'use strict';

const sinon = require('sinon');
const APITest = require('@janiscommerce/api-test');
const { ApiGet } = require('@janiscommerce/api-get');
const { Invoker } = require('@janiscommerce/lambda');

const BaseModel = require('../lib/base-model');
const { SlsApiFileGet } = require('../lib/index');

describe('SlsApiFileGet', () => {

	const url =
		// eslint-disable-next-line max-len
		'https://cdn.storage.janisdev.in/cdn/files/defaultClient/U2ZPvzsjjTeUy5v56VZjkTUyacfKyE3P.png?Expires=1673568000&Key-Pair-Id=K2P6YIJ6NYT9Z8&Signature=AKKu01bTVytc7nTrsJjHUGkn5hNCFXpHGJcDWojkzVfpb9Y2ssN47VNBQIWVE3lO8efU9W';

	const rowGetted = {
		id: 20,
		name: 'file.png',
		claimId: 7,
		size: 5014,
		mimeType: 'image/png',
		path: 'cdn/files/defaultClient/a87a83d3-f494-4069-a0f7-fa0894590072.png',
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

	const path = 'cdn/files/defaultClient/a87a83d3-f494-4069-a0f7-fa0894590072.png';
	const signedFiles = {
		// eslint-disable-next-line max-len
		'cdn/files/defaultClient/a87a83d3-f494-4069-a0f7-fa0894590072.png': 'https://cdn.storage.janisdev.in/cdn/files/defaultClient/U2ZPvzsjjTeUy5v56VZjkTUyacfKyE3P.png?Expires=1673568000&Key-Pair-Id=K2P6YIJ6NYT9Z8&Signature=AKKu01bTVytc7nTrsJjHUGkn5hNCFXpHGJcDWojkzVfpb9Y2ssN47VNBQIWVE3lO8efU9W'
	};

	const apiCustom = ({
		postValidateHook = () => true,
		formatFileData = data => data
	}) => class CustomApi extends SlsApiFileGet {

		postValidateHook() {
			return postValidateHook();
		}

		formatFileData(data) {
			return formatFileData(data);
		}
	};

	beforeEach(() => {
		sinon.stub(ApiGet.prototype, '_getModelInstance').returns(new BaseModel());
	});

	afterEach(() => {
		sinon.restore();
	});

	context('Validate', () => {

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

		APITest(SlsApiFileGet, 'api/entity/1/file/2', [
			{
				description: 'Should return 500. if fail get current file record',
				session: true,
				request: {
					pathParameters: [1, 2]
				},
				response: { code: 500 },
				before: sandbox => {
					sandbox.stub(BaseModel.prototype, 'get').rejects();
				},
				after: (afterResponse, sandbox) => {
					sandbox.assert.calledOnce(BaseModel.prototype.get);
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
					sandbox.stub(Invoker, 'serviceSafeClientCall').rejects();
				},
				after: (afterResponse, sandbox) => {
					sandbox.assert.calledOnce(BaseModel.prototype.get);
					sinon.assert.calledWithExactly(Invoker.serviceSafeClientCall, 'storage', 'GetSignedFiles', 'defaultClient', { paths: [path] });
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
					sandbox.stub(Invoker, 'serviceSafeClientCall').resolves();
				},
				after: (afterResponse, sandbox) => {
					sandbox.assert.calledOnce(BaseModel.prototype.get);
					sandbox.assert.notCalled(Invoker.serviceSafeClientCall);
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
					sandbox.stub(Invoker, 'serviceSafeClientCall').resolves({ statusCode: 200, payload: signedFiles });

				},
				after: (afterResponse, sandbox) => {
					sandbox.assert.calledWithExactly(BaseModel.prototype.get, {
						filters: { entity: '1', id: '2' }, limit: 1, page: 1
					});
					sinon.assert.calledWithExactly(Invoker.serviceSafeClientCall, 'storage', 'GetSignedFiles', 'defaultClient', { paths: [path] });
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
					sandbox.stub(Invoker, 'serviceSafeClientCall').resolves({ statusCode: 404, payload: {} });

				},
				after: (afterResponse, sandbox) => {
					sandbox.assert.calledWithExactly(BaseModel.prototype.get, {
						filters: { entity: '1', id: '2' }, limit: 1, page: 1
					});
					sinon.assert.calledWithExactly(Invoker.serviceSafeClientCall, 'storage', 'GetSignedFiles', 'defaultClient', { paths: [path] });
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
					sandbox.stub(Invoker, 'serviceSafeClientCall').resolves({ statusCode: 200, payload: signedFiles });
				},
				after: (afterResponse, sandbox) => {
					sandbox.assert.calledWithExactly(BaseModel.prototype.get, {
						filters: { entity: '1', id: '2' }, limit: 1, page: 1
					});
					sinon.assert.calledWithExactly(Invoker.serviceSafeClientCall, 'storage', 'GetSignedFiles', 'defaultClient', { paths: [path] });
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
					sandbox.stub(Invoker, 'serviceSafeClientCall').resolves({ statusCode: 404, payload: {} });
				},
				after: (afterResponse, sandbox) => {
					sandbox.assert.calledWithExactly(BaseModel.prototype.get, {
						filters: { entity: '1', id: '2' }, limit: 1, page: 1
					});
					sinon.assert.calledWithExactly(Invoker.serviceSafeClientCall, 'storage', 'GetSignedFiles', 'defaultClient', { paths: [path] });
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
					sandbox.stub(Invoker, 'serviceSafeClientCall').resolves({ statusCode: 200, payload: signedFiles });
				},
				after: (afterResponse, sandbox) => {
					sandbox.assert.calledWithExactly(BaseModel.prototype.get, {
						filters: { entity: '1', id: '2' }, limit: 1, page: 1
					});
					sinon.assert.calledWithExactly(Invoker.serviceSafeClientCall, 'storage', 'GetSignedFiles', 'defaultClient', { paths: [path] });
				}
			}
		]);
	});
});
