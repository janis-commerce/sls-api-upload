'use strict';

const APITest = require('@janiscommerce/api-test');
const { Invoker } = require('@janiscommerce/lambda');

const BaseModel = require('../lib/base-model');
const { SlsApiFileRelation, SlsApiFileRelationError } = require('../lib/index');

describe('SlsApiRelation', () => {

	const apiExtendedSimple = ({
		entityIdField,
		customFieldsStruct,
		model = BaseModel
	} = {}) => class API extends SlsApiFileRelation {

		get model() {
			return model;
		}

		get entityIdField() {
			return entityIdField;
		}

		get customFieldsStruct() {
			return customFieldsStruct || super.customFieldsStruct;
		}
	};

	const defaultApiExtended = apiExtendedSimple({
		entityIdField: 'test'
	});

	const apiCustom = ({
		postValidateHook = () => true,
		postSaveHook = () => true,
		format = data => data
	}) => class CustomApi extends defaultApiExtended {

		postValidateHook() {
			return postValidateHook();
		}

		postSaveHook() {
			return postSaveHook();
		}

		format(additonalData) {
			return format(additonalData);
		}
	};

	const path = 'cdn/files/defaultClient/a87a83d3-f494-4069-a0f7-fa0894590072.png';
	const defaultRequestData = { fileName: 'test.png', fileSource: path };

	const fileInfo = {
		'cdn/files/defaultClient/a87a83d3-f494-4069-a0f7-fa0894590072.png': {
			AcceptRanges: 'bytes',
			LastModified: '2023-01-11T18:51:04.000Z',
			ContentLength: 10000,
			ETag: 'ffd87faf53d1d1627f635101c295ce78',
			ContentType: 'image/png',
			Metadata: {}
		}
	};

	context('Validate', () => {

		APITest(apiExtendedSimple({ model: null }), [{
			description: 'Should return 400 if model is not defined',
			request: { data: defaultRequestData },
			response: { code: 400, body: { message: SlsApiFileRelationError.messages.MODEL_NOT_DEFINED } }
		}]);

		APITest(apiExtendedSimple({ model: 'model' }), [{
			description: 'Should return 400 if model is not a Class',
			request: { data: defaultRequestData },
			response: { code: 400, body: { message: SlsApiFileRelationError.messages.MODEL_IS_NOT_MODEL_CLASS } }
		}]);

		APITest(apiExtendedSimple(), [{
			description: 'Should return 400 if entityIdField is not defined',
			request: { data: defaultRequestData },
			session: true,
			response: { code: 400, body: { message: SlsApiFileRelationError.messages.ENTITY_ID_FIELD_NOT_DEFINED } }
		}]);

		APITest(apiExtendedSimple({ entityIdField: 123 }), [{
			description: 'Should return 400 if entityIdField is not a string',
			request: { data: defaultRequestData },
			response: { code: 400, body: { message: SlsApiFileRelationError.messages.ENTITY_ID_FIELD_NOT_STRING } }
		}]);

		APITest(apiExtendedSimple({
			entityIdField: 'test',
			customFieldsStruct: { type: 'string' }
		}), [{
			description: 'Should return 400 if pass incorrect custom fields in body',
			request: { data: { fileName: 'test.js', fileSource: 'files/test.js', type: 132 } },
			response: { code: 400 }
		}]);

		APITest(defaultApiExtended, [
			{
				description: 'Should return 400 if not pass body',
				request: {},
				response: { code: 400 }
			},
			{
				description: 'Should return 400 if not pass fileName in body',
				request: { data: {} },
				response: { code: 400 }
			},
			{
				description: 'Should return 400 if not pass filename string',
				request: { data: { fileName: 132 } },
				response: { code: 400 }
			},
			{
				description: 'Should return 400 if not pass fileSource in body',
				request: { data: { fileName: 'test.js' } },
				response: { code: 400 }
			},
			{
				description: 'Should return 400 if not pass fileSource string',
				request: { data: { fileName: 'test.js', fileSource: 132 } },
				response: { code: 400 }
			},
			{
				description: 'Should return 400 if not pass custom fields in body',
				request: { data: { fileName: 'test.js', fileSource: 'files/test.js', type: 'asdasd' } },
				response: { code: 400 }
			}
		]);

		APITest(apiCustom({
			postValidateHook: () => { throw new Error('Fails Validate'); }
		}), [{
			description: 'Should return 400 if not pass custom validation',
			request: {
				data: defaultRequestData,
				pathParameters: [1]
			},
			response: { code: 400 }
		}]);
	});

	context('Process', () => {

		APITest(defaultApiExtended, [
			{
				description: 'Should return 500 if fail headObject',
				session: true,
				request: {
					data: defaultRequestData,
					pathParameters: [1]
				},
				response: { code: 500 },
				before: sandbox => {
					sandbox.stub(Invoker, 'serviceSafeClientCall').rejects({ statusCode: 404 });
					sandbox.stub(BaseModel.prototype, 'insert');
				},
				after: (afterResponse, sandbox) => {
					sandbox.assert.calledWithExactly(Invoker.serviceSafeClientCall, 'storage', 'GetFilesInfo', 'defaultClient', { paths: [path] });
					sandbox.assert.notCalled(BaseModel.prototype.insert);
				}
			},
			{
				description: 'Should return 200 and save without content data',
				session: true,
				request: {
					data: defaultRequestData,
					pathParameters: [1]
				},
				response: { code: 201 },
				before: sandbox => {
					sandbox.stub(Invoker, 'serviceSafeClientCall').resolves({});
					sandbox.stub(BaseModel.prototype, 'insert').resolves(12345);
				},
				after: (afterResponse, sandbox) => {
					sandbox.assert.calledWithExactly(Invoker.serviceSafeClientCall, 'storage', 'GetFilesInfo', 'defaultClient', { paths: [path] });
					sandbox.assert.calledWithExactly(BaseModel.prototype.insert, {
						test: 1,
						path,
						name: 'test.png',
						mimeType: null,
						type: 'other',
						size: null
					});
				}
			},
			{
				description: 'Should return 500 if fail model insert',
				session: true,
				request: {
					data: defaultRequestData,
					pathParameters: [1]
				},
				response: { code: 500 },
				before: sandbox => {
					sandbox.stub(Invoker, 'serviceSafeClientCall').resolves({ statusCode: 200, payload: fileInfo });
					sandbox.stub(BaseModel.prototype, 'insert').rejects();
				},
				after: (afterResponse, sandbox) => {
					sandbox.assert.calledWithExactly(Invoker.serviceSafeClientCall, 'storage', 'GetFilesInfo', 'defaultClient', { paths: [path] });
					sandbox.assert.calledWithExactly(BaseModel.prototype.insert, {
						test: 1,
						path,
						name: 'test.png',
						mimeType: 'image/png',
						type: 'image',
						size: 10000
					});
				}
			},
			{
				description: 'Should return 200 with valid data',
				session: true,
				request: {
					data: defaultRequestData,
					pathParameters: [1]
				},
				response: { code: 201, body: { id: 12345 } },
				before: sandbox => {
					sandbox.stub(Invoker, 'serviceSafeClientCall').resolves({ statusCode: 200, payload: fileInfo });
					sandbox.stub(BaseModel.prototype, 'insert').resolves(12345);
				},
				after: (afterResponse, sandbox) => {
					sandbox.assert.calledWithExactly(Invoker.serviceSafeClientCall, 'storage', 'GetFilesInfo', 'defaultClient', { paths: [path] });
					sandbox.assert.calledWithExactly(BaseModel.prototype.insert, {
						test: 1,
						path,
						name: 'test.png',
						mimeType: 'image/png',
						type: 'image',
						size: 10000
					});
				}
			}
		]);

		APITest(apiExtendedSimple({
			entityIdField: 'test',
			customFieldsStruct: {
				description: 'string',
				order: 'number'
			}
		}), [{
			description: 'Should return 200 with valid data and custom fields struct',
			session: true,
			request: {
				data: {
					...defaultRequestData,
					description: 'test description',
					order: 1
				},
				pathParameters: [1]
			},
			response: { code: 201, body: { id: 12345 } },
			before: sandbox => {
				sandbox.stub(Invoker, 'serviceSafeClientCall').resolves({ statusCode: 200, payload: fileInfo });
				sandbox.stub(BaseModel.prototype, 'insert').resolves(12345);
			},
			after: (afterResponse, sandbox) => {
				sandbox.assert.calledWithExactly(Invoker.serviceSafeClientCall, 'storage', 'GetFilesInfo', 'defaultClient', { paths: [path] });
				sandbox.assert.calledWithExactly(BaseModel.prototype.insert, {
					test: 1,
					path,
					name: 'test.png',
					mimeType: 'image/png',
					type: 'image',
					size: 10000,
					description: 'test description',
					order: 1
				});
			}
		}]);

		APITest(apiCustom({
			postValidateHook: () => true
		}), [{
			description: 'Should return 200 with custom validation and post-save-hook',
			session: true,
			request: {
				data: defaultRequestData,
				pathParameters: [1]
			},
			response: { code: 201, body: { id: 12345 } },
			before: sandbox => {
				sandbox.stub(Invoker, 'serviceSafeClientCall').resolves({ statusCode: 200, payload: fileInfo });
				sandbox.stub(BaseModel.prototype, 'insert').resolves(12345);
			},
			after: (afterResponse, sandbox) => {
				sandbox.assert.calledWithExactly(Invoker.serviceSafeClientCall, 'storage', 'GetFilesInfo', 'defaultClient', { paths: [path] });
				sandbox.assert.calledWithExactly(BaseModel.prototype.insert, {
					test: 1,
					path,
					name: 'test.png',
					mimeType: 'image/png',
					type: 'image',
					size: 10000
				});
			}
		}]);

		APITest(apiCustom({
			postSaveHook: () => { throw new Error('Fails'); }
		}), [{
			description: 'Should return 500 if fails in post-save-hook',
			session: true,
			request: {
				data: defaultRequestData,
				pathParameters: [1]
			},
			response: { code: 500 },
			before: sandbox => {
				sandbox.stub(Invoker, 'serviceSafeClientCall').resolves({ statusCode: 200, payload: fileInfo });
				sandbox.stub(BaseModel.prototype, 'insert').resolves(12345);
			},
			after: (afterResponse, sandbox) => {
				sandbox.assert.calledWithExactly(Invoker.serviceSafeClientCall, 'storage', 'GetFilesInfo', 'defaultClient', { paths: [path] });
				sandbox.assert.calledWithExactly(BaseModel.prototype.insert, {
					test: 1,
					path,
					name: 'test.png',
					mimeType: 'image/png',
					type: 'image',
					size: 10000
				});
			}
		}]);

		APITest(apiCustom({
			format: () => { throw new Error('Fails'); }
		}), [{
			description: 'Should return 500 and no save if fails in format',
			session: true,
			request: {
				data: defaultRequestData,
				pathParameters: [1]
			},
			response: { code: 500 },
			before: sandbox => {
				sandbox.stub(Invoker, 'serviceSafeClientCall').resolves({ statusCode: 200, payload: fileInfo });
				sandbox.stub(BaseModel.prototype, 'insert').resolves(12345);
			},
			after: (afterResponse, sandbox) => {
				sandbox.assert.calledWithExactly(Invoker.serviceSafeClientCall, 'storage', 'GetFilesInfo', 'defaultClient', { paths: [path] });
				sandbox.assert.notCalled(BaseModel.prototype.insert);
			}
		}]);

		APITest(apiCustom({
			format: () => ({ order: 1 })
		}), [{
			description: 'Should return 200 and add a custom field',
			session: true,
			request: {
				data: defaultRequestData,
				pathParameters: [1]
			},
			response: { code: 201, body: { id: 12345 } },
			before: sandbox => {
				sandbox.stub(Invoker, 'serviceSafeClientCall').resolves({ statusCode: 200, payload: fileInfo });
				sandbox.stub(BaseModel.prototype, 'insert').resolves(12345);
			},
			after: (afterResponse, sandbox) => {
				sandbox.assert.calledWithExactly(Invoker.serviceSafeClientCall, 'storage', 'GetFilesInfo', 'defaultClient', { paths: [path] });
				sandbox.assert.calledWithExactly(BaseModel.prototype.insert, {
					test: 1,
					path,
					name: 'test.png',
					mimeType: 'image/png',
					type: 'image',
					size: 10000,
					order: 1
				});
			}
		}]);

		const types = [
			{ extension: '.jpg', type: 'image', ContentType: 'image/jpeg' },
			{ extension: '.gif', type: 'image', ContentType: 'image/gif' },
			{ extension: '.png', type: 'image', ContentType: 'image/png' },
			{ extension: '.jpeg', type: 'image', ContentType: 'image/jpeg' },
			{ extension: '.doc', type: 'doc', ContentType: 'application/msword' },
			{ extension: '.docx', type: 'doc', ContentType: 'application/vnd.openxmlformats- officedocument.wordprocessingml.document' },
			{ extension: '.mp4', type: 'video', ContentType: 'video/mp4' },
			{ extension: '.flv', type: 'video', ContentType: 'video/x-flv' },
			{ extension: '.mp3', type: 'audio', ContentType: 'audio/mpeg3' },
			{ extension: '.wav', type: 'audio', ContentType: 'audio/wav' },
			{ extension: '.ods', type: 'sheet', ContentType: 'application/vnd.oasis.opendocument.spreadsheet' },
			{ extension: '.csv', type: 'sheet', ContentType: 'text/csv' },
			{ extension: '.xlsx', type: 'sheet', ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
			{ extension: '.xls', type: 'sheet', ContentType: 'application/vnd.ms-excel' },
			{ extension: '.json', type: 'other', ContentType: 'application/json' },
			{ extension: '.txt', type: 'other', ContentType: 'text/plain' }
		];

		APITest(defaultApiExtended, types.map(({ extension, type, ContentType }) => ({
			description: `Should return 200 passing diferents files types in data (${extension})`,
			session: true,
			request: {
				data: { fileName: `test${extension}`, fileSource: `cdn/files/defaultClient/test${extension}` },
				pathParameters: [1]
			},
			response: { code: 201, body: { id: 12345 } },
			before: sandbox => {
				sandbox.stub(Invoker, 'serviceSafeClientCall').resolves({
					statusCode: 200,
					payload: {
						[`cdn/files/defaultClient/test${extension}`]: {
							...fileInfo[path],
							ContentType
						}
					}
				});
				sandbox.stub(BaseModel.prototype, 'insert').resolves(12345);
			},
			after: (afterResponse, sandbox) => {
				sandbox.assert.calledWithExactly(Invoker.serviceSafeClientCall, 'storage', 'GetFilesInfo', 'defaultClient', {
					paths: [`cdn/files/defaultClient/test${extension}`]
				});
				sandbox.assert.calledWithExactly(BaseModel.prototype.insert, {
					test: 1,
					path: `cdn/files/defaultClient/test${extension}`,
					name: `test${extension}`,
					mimeType: ContentType,
					type,
					size: 10000
				});
			}
		})));
	});
});
