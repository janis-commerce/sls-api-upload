'use strict';

const APITest = require('@janiscommerce/api-test');
const { Invoker } = require('@janiscommerce/lambda');

const BaseModel = require('../lib/base-model');
const { SlsApiFileDelete, SlsApiFileDeleteError } = require('../lib/index');

describe('SlsApiFileDelete', () => {

	const apiExtendedSimple = ({
		entityIdField
	} = {}) => {
		class API extends SlsApiFileDelete {

			get entityIdField() {
				return entityIdField;
			}
		}

		return API;
	};

	const defaultApiExtended = apiExtendedSimple({
		entityIdField: 'test'
	});

	const apiCustom = ({
		postValidateHook = () => true,
		postDeleteHook = () => true
	} = {}) => class CustomApi extends defaultApiExtended {

		postValidateHook() {
			return postValidateHook();
		}

		postDeleteHook() {
			return postDeleteHook();
		}
	};

	const path = 'cdn/files/fizzmodarg/a87a83d3-f494-4069-a0f7-fa0894590072.png';
	const fileGetted = {
		path
	};

	context('Validate', () => {

		APITest(apiExtendedSimple(), [{
			description: 'Should return 400 if entityIdField is not defined',
			session: true,
			response: { code: 400, body: { message: SlsApiFileDeleteError.messages.ENTITY_ID_FIELD_NOT_DEFINED } }
		}]);

		APITest(apiExtendedSimple({ entityIdField: 123 }), [{
			description: 'Should return 400 if entityIdField is not a string',
			session: true,
			response: { code: 400, body: { message: SlsApiFileDeleteError.messages.ENTITY_ID_FIELD_NOT_STRING } }
		}]);

		APITest(apiCustom({
			postValidateHook: () => { throw new Error(); }
		}), [{
			description: 'Should return 400 if custom validation fails',
			session: true,
			response: { code: 400 }
		}]);
	});

	context('Process', () => {

		APITest(defaultApiExtended, [
			{
				description: 'Should return 500 if fail get current file record',
				session: true,
				request: {
					pathParameters: [1, 2]
				},
				response: { code: 500 },
				before: sandbox => {
					sandbox.stub(BaseModel.prototype, 'get').rejects();
					sandbox.stub(BaseModel.prototype, 'remove');
					sandbox.stub(Invoker, 'serviceSafeClientCall');

				},
				after: (afterResponse, sandbox) => {
					sandbox.assert.calledOnce(BaseModel.prototype.get);
					sandbox.assert.notCalled(BaseModel.prototype.remove);
					sandbox.assert.notCalled(Invoker.serviceSafeClientCall);
				}
			},
			{
				description: 'Should return 500 if fail model remove',
				session: true,
				request: {
					pathParameters: [1, 2]
				},
				response: { code: 500 },
				before: sandbox => {
					sandbox.stub(BaseModel.prototype, 'get').resolves([fileGetted]);
					sandbox.stub(BaseModel.prototype, 'remove').rejects();
					sandbox.stub(Invoker, 'serviceSafeClientCall');
				},
				after: (afterResponse, sandbox) => {
					sandbox.assert.calledOnce(BaseModel.prototype.get);
					sandbox.assert.calledOnce(BaseModel.prototype.remove);
					sandbox.assert.notCalled(Invoker.serviceSafeClientCall);
				}
			},
			{
				description: 'Should return 500 if fail deleteObject',
				session: true,
				request: {
					pathParameters: [1, 2]
				},
				response: { code: 500 },
				before: sandbox => {
					sandbox.stub(BaseModel.prototype, 'get').resolves([fileGetted]);
					sandbox.stub(BaseModel.prototype, 'remove').resolves(1);
					sandbox.stub(Invoker, 'serviceSafeClientCall').rejects();
				},
				after: (afterResponse, sandbox) => {
					sandbox.assert.calledOnce(BaseModel.prototype.get);
					sandbox.assert.calledOnce(BaseModel.prototype.remove);
					sandbox.assert.calledWithExactly(Invoker.serviceSafeClientCall, 'storage', 'DeleteFiles', 'defaultClient', { paths: [path] });
				}
			},
			{
				description: 'Should return 404 if not exists current file record',
				session: true,
				request: {
					pathParameters: [1, 2]
				},
				response: {
					code: 404,
					body: { message: SlsApiFileDeleteError.messages.FILE_RECORD_NOT_FOUND }
				},
				before: sandbox => {
					sandbox.stub(BaseModel.prototype, 'get').resolves([]);
					sandbox.stub(BaseModel.prototype, 'remove');
					sandbox.stub(Invoker, 'serviceSafeClientCall');
				},
				after: (afterResponse, sandbox) => {
					sandbox.assert.calledOnce(BaseModel.prototype.get);
					sandbox.assert.notCalled(BaseModel.prototype.remove);
					sandbox.assert.notCalled(Invoker.serviceSafeClientCall);
				}
			},
			{
				description: 'Should return 200 if delete record and file correctly',
				session: true,
				request: {
					pathParameters: [1, 2]
				},
				response: { code: 200 },
				before: sandbox => {
					sandbox.stub(BaseModel.prototype, 'get').resolves([fileGetted]);
					sandbox.stub(BaseModel.prototype, 'remove').resolves(1);
					sandbox.stub(Invoker, 'serviceSafeClientCall').resolves();
				},
				after: (afterResponse, sandbox) => {
					sandbox.assert.calledWithExactly(BaseModel.prototype.get, {
						filters: { test: 1, id: 2 }
					});
					sandbox.assert.calledWithExactly(BaseModel.prototype.remove, { id: 2 });
					sandbox.assert.calledWithExactly(Invoker.serviceSafeClientCall, 'storage', 'DeleteFiles', 'defaultClient', { paths: [path] });
				}
			},
			{
				description: 'Should return 200 if delete record correctly but file not exist in s3',
				session: true,
				request: {
					pathParameters: [1, 2]
				},
				response: { code: 200 },
				before: sandbox => {
					sandbox.stub(BaseModel.prototype, 'get').resolves([fileGetted]);
					sandbox.stub(BaseModel.prototype, 'remove').resolves(1);
					sandbox.stub(Invoker, 'serviceSafeClientCall').resolves();
				},
				after: (afterResponse, sandbox) => {
					sandbox.assert.calledWithExactly(BaseModel.prototype.get, {
						filters: { test: 1, id: 2 }
					});
					sandbox.assert.calledWithExactly(BaseModel.prototype.remove, { id: 2 });
					sandbox.assert.calledWithExactly(Invoker.serviceSafeClientCall, 'storage', 'DeleteFiles', 'defaultClient', { paths: [path] });
				}
			}
		]);
	});

	APITest(apiCustom(), [
		{
			description: 'Should return 200 if custom validation and postDeleteHooks are correct',
			session: true,
			request: {
				pathParameters: [1, 2]
			},
			response: { code: 200 },
			before: sandbox => {
				sandbox.stub(BaseModel.prototype, 'get').resolves([fileGetted]);
				sandbox.stub(BaseModel.prototype, 'remove').resolves(1);
				sandbox.stub(Invoker, 'serviceSafeClientCall').resolves();
			},
			after: (afterResponse, sandbox) => {
				sandbox.assert.calledWithExactly(BaseModel.prototype.get, {
					filters: { test: 1, id: 2 }
				});
				sandbox.assert.calledWithExactly(BaseModel.prototype.remove, { id: 2 });
				sandbox.assert.calledWithExactly(Invoker.serviceSafeClientCall, 'storage', 'DeleteFiles', 'defaultClient', { paths: [path] });
			}
		}
	]);

	APITest(apiCustom({
		postDeleteHook: () => { throw new Error(); }
	}), [
		{
			description: 'Should return 500 if postDeleteHooks fails',
			session: true,
			request: {
				pathParameters: [1, 2]
			},
			response: { code: 500 },
			before: sandbox => {
				sandbox.stub(BaseModel.prototype, 'get').resolves([fileGetted]);
				sandbox.stub(BaseModel.prototype, 'remove').resolves(1);
				sandbox.stub(Invoker, 'serviceSafeClientCall').resolves();

			},
			after: (afterResponse, sandbox) => {
				sandbox.assert.calledWithExactly(BaseModel.prototype.get, {
					filters: { test: 1, id: 2 }
				});
				sandbox.assert.calledWithExactly(BaseModel.prototype.remove, { id: 2 });
				sandbox.assert.calledWithExactly(Invoker.serviceSafeClientCall, 'storage', 'DeleteFiles', 'defaultClient', { paths: [path] });
			}
		}
	]);
});
