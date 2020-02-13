'use strict';

const APITest = require('@janiscommerce/api-test');
const S3 = require('@janiscommerce/s3');
const BaseModel = require('../lib/base-model');
const { SlsApiFileDelete, SlsApiFileDeleteError } = require('../lib/index');


describe('SlsApiFileDelete', () => {

	const apiExtendedSimple = ({
		entityIdField,
		bucket,
		model = BaseModel
	} = {}) => {
		class API extends SlsApiFileDelete {
			get entityIdField() {
				return entityIdField;
			}

			get bucket() {
				return bucket;
			}

			get model() {
				return model;
			}
		}

		return API;
	};

	const defaultApiExtended = apiExtendedSimple({
		entityIdField: 'test',
		bucket: 'test'
	});


	context('Validate', () => {
		APITest(apiExtendedSimple({ model: null }), [{
			description: 'Should return 400 if model is not defined',
			response: { code: 400, body: { message: SlsApiFileDeleteError.messages.MODEL_NOT_DEFINED } }
		}]);

		APITest(apiExtendedSimple({ model: 'model' }), [{
			description: 'Should return 400 if model is not a Class',
			response: { code: 400, body: { message: SlsApiFileDeleteError.messages.MODEL_IS_NOT_MODEL_CLASS } }
		}]);

		APITest(apiExtendedSimple(), [{
			description: 'Should return 400 if entityIdField is not defined',
			response: { code: 400, body: { message: SlsApiFileDeleteError.messages.ENTITY_ID_FIELD_NOT_DEFINED } }
		}]);

		APITest(apiExtendedSimple({ entityIdField: 123 }), [{
			description: 'Should return 400 if entityIdField is not a string',
			response: { code: 400, body: { message: SlsApiFileDeleteError.messages.ENTITY_ID_FIELD_NOT_STRING } }
		}]);

		APITest(apiExtendedSimple({
			entityIdField: 'test'
		}), [{
			description: 'Should return 400 if bucket is not defined',
			response: { code: 400, body: { message: SlsApiFileDeleteError.messages.BUCKET_NOT_DEFINED } }
		}]);

		APITest(apiExtendedSimple({
			entityIdField: 'test',
			bucket: 123
		}), [{
			description: 'Should return 400 if bucket is not a string',
			response: { code: 400, body: { message: SlsApiFileDeleteError.messages.BUCKET_NOT_STRING } }
		}]);
	});

	context('Process', () => {
		APITest(defaultApiExtended, [{
			before: sandbox => {
				sandbox.stub(BaseModel.prototype, 'get').rejects();
				sandbox.stub(BaseModel.prototype, 'remove');
				sandbox.stub(S3, 'deleteObject');
			},
			session: true,
			description: 'Should return 500 if fail get current file record',
			request: {
				pathParameters: [1, 2]
			},
			response: { code: 500 },
			after: (afterResponse, sandbox) => {
				sandbox.assert.calledOnce(BaseModel.prototype.get);
				sandbox.assert.notCalled(BaseModel.prototype.remove);
				sandbox.assert.notCalled(S3.deleteObject);
			}
		}]);

		APITest(defaultApiExtended, [{
			before: sandbox => {
				sandbox.stub(BaseModel.prototype, 'get').resolves([{
					path: '/files/file.jpg'
				}]);
				sandbox.stub(BaseModel.prototype, 'remove').rejects();
				sandbox.stub(S3, 'deleteObject');
			},
			session: true,
			description: 'Should return 500 if fail model remove',
			request: {
				pathParameters: [1, 2]
			},
			response: { code: 500 },
			after: (afterResponse, sandbox) => {
				sandbox.assert.calledOnce(BaseModel.prototype.get);
				sandbox.assert.calledOnce(BaseModel.prototype.remove);
				sandbox.assert.notCalled(S3.deleteObject);
			}
		}]);

		APITest(defaultApiExtended, [{
			before: sandbox => {
				sandbox.stub(BaseModel.prototype, 'get').resolves([{
					path: '/files/file.jpg'
				}]);
				sandbox.stub(BaseModel.prototype, 'remove').resolves(1);
				sandbox.stub(S3, 'deleteObject').rejects();
			},
			session: true,
			description: 'Should return 500 if fail deleteObject',
			request: {
				pathParameters: [1, 2]
			},
			response: { code: 500 },
			after: (afterResponse, sandbox) => {
				sandbox.assert.calledOnce(BaseModel.prototype.get);
				sandbox.assert.calledOnce(BaseModel.prototype.remove);
				sandbox.assert.calledOnce(S3.deleteObject);
			}
		}]);

		APITest(defaultApiExtended, [{
			before: sandbox => {
				sandbox.stub(BaseModel.prototype, 'get').resolves([]);
				sandbox.stub(BaseModel.prototype, 'remove');
				sandbox.stub(S3, 'deleteObject');
			},
			session: true,
			description: 'Should return 404 if not exists current file record',
			request: {
				pathParameters: [1, 2]
			},
			response: { code: 404, body: { message: SlsApiFileDeleteError.messages.FILE_RECORD_NOT_FOUND } },
			after: (afterResponse, sandbox) => {
				sandbox.assert.calledOnce(BaseModel.prototype.get);
				sandbox.assert.notCalled(BaseModel.prototype.remove);
				sandbox.assert.notCalled(S3.deleteObject);
			}
		}]);

		APITest(defaultApiExtended, [{
			before: sandbox => {
				sandbox.stub(BaseModel.prototype, 'get').resolves([{
					path: '/files/file.jpg'
				}]);
				sandbox.stub(BaseModel.prototype, 'remove').resolves(1);
				sandbox.stub(S3, 'deleteObject').resolves();
			},
			session: true,
			description: 'Should return 200 if delete record and file correctly',
			request: {
				pathParameters: [1, 2]
			},
			response: { code: 200 },
			after: (afterResponse, sandbox) => {
				sandbox.assert.calledWithExactly(BaseModel.prototype.get, {
					filters: { test: 1, id: 2 }
				});

				sandbox.assert.calledWithExactly(BaseModel.prototype.remove, { id: 2 });

				sandbox.assert.calledWithExactly(S3.deleteObject, {
					Bucket: 'test',
					Key: '/files/file.jpg'
				});
			}
		}]);

		APITest(defaultApiExtended, [{
			before: sandbox => {
				sandbox.stub(BaseModel.prototype, 'get').resolves([{
					path: '/files/file.jpg'
				}]);
				sandbox.stub(BaseModel.prototype, 'remove').resolves(1);
				sandbox.stub(S3, 'deleteObject').rejects({
					statusCode: 404
				});
			},
			session: true,
			description: 'Should return 200 if delete record correctly but file not exist in s3',
			request: {
				pathParameters: [1, 2]
			},
			response: { code: 200 },
			after: (afterResponse, sandbox) => {
				sandbox.assert.calledWithExactly(BaseModel.prototype.get, {
					filters: { test: 1, id: 2 }
				});

				sandbox.assert.calledWithExactly(BaseModel.prototype.remove, { id: 2 });

				sandbox.assert.calledWithExactly(S3.deleteObject, {
					Bucket: 'test',
					Key: '/files/file.jpg'
				});
			}
		}]);
	});
});
