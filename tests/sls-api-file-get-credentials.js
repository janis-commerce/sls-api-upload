'use strict';

require('lllog')('none');
const APITest = require('@janiscommerce/api-test');
const { Invoker } = require('@janiscommerce/lambda');

const { SlsApiFileGetCredentials, SlsApiFileGetCredentialsError } = require('../lib/index');

describe('SlsApiFileGetCredentials', () => {

	const entity = 'entityName';
	const serviceName = 'serviceName';

	const requestData = { serviceName, entity };
	const requestDataMultiplesFiles = {
		...requestData,
		fileNames: ['image.png']
	};

	const credential = {
		url: 'https://s3.amazonaws.com/janis-storage-service-beta',
		fields: {
			'Content-Type': 'image/png',
			key: 'cdn/files/defaultClient/9ea2lbLalrQrjkoWqyJ5gOsJGBtzbml1.png',
			bucket: 'janis-storage-service-beta',
			'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
			'X-Amz-Credential': 'ASIASJHJMNZZ5MVD5YHU/20230112/us-east-1/s3/aws4_request',
			'X-Amz-Date': '20230112T114452Z',
			'X-Amz-Security-Token': 'IQoJb3JpZ2luX2VjEGQaCXVzLWVhc3QtMSJGMEQCIHJFEKyCqC1P0svU5z3M/szk8tN92pSnn5uR=',
			Policy: 'eyJleHBpcmF0aW9uIjoiMjAyMy0wMS0xMlQxMTo0NTo1MloiLCJjb25kaXRpb25zIjpbWyJjb250ZW50LWxlbmd0aC1y',
			'X-Amz-Signature': 'c9b0e78d8b166847c2583383ac5da48e92e95501ed2991058e5a97e4c1514aba'
		}
	};

	const credentials = {
		'image.png': credential
	};

	const originalEnv = { ...process.env };

	beforeEach(() => {
		process.env.JANIS_SERVICE_NAME = serviceName;
	});

	afterEach(() => {
		process.env = { ...originalEnv };
	});

	const apiCustom = ({
		entityName
	} = {}) => {
		class CustomApi extends SlsApiFileGetCredentials {

			get entity() {
				return entityName;
			}
		}

		return CustomApi;
	};

	const defaultApiGetCredentials = apiCustom({ entityName: entity });

	context('Validate', () => {

		APITest(defaultApiGetCredentials, 'api/entity/1/file-get-credentials', [
			{
				description: 'Should return 400 without fileNames',
				session: true,
				request: {
					pathParameters: [1],
					data: {}
				},
				response: { code: 400 },
				before: sandbox => {
					sandbox.stub(Invoker, 'serviceSafeClientCall').resolves();
				},
				after: (afterResponse, sandbox) => {
					sandbox.assert.notCalled(Invoker.serviceSafeClientCall);
				}
			},
			{
				description: 'Should return 400 with empty fileNames',
				session: true,
				request: {
					pathParameters: [1],
					data: {
						fileNames: []
					}
				},
				response: { code: 400 },
				before: sandbox => {
					sandbox.stub(Invoker, 'serviceSafeClientCall').resolves();
				},
				after: (afterResponse, sandbox) => {
					sandbox.assert.notCalled(Invoker.serviceSafeClientCall);
				}
			},
			{
				description: 'Should return 400 with invalid credential expiration',
				session: true,
				request: {
					pathParameters: [1],
					data: {
						fileNames: ['image.png'],
						credentialExpiration: 'foo'
					}
				},
				response: { code: 400 },
				before: sandbox => {
					sandbox.stub(Invoker, 'serviceSafeClientCall').resolves();
				},
				after: (afterResponse, sandbox) => {
					sandbox.assert.notCalled(Invoker.serviceSafeClientCall);
				}
			},
			{
				description: 'Should return 400 with invalid file expiration',
				session: true,
				request: {
					pathParameters: [1],
					data: {
						fileNames: ['image.png'],
						fileExpiration: 'foo'
					}
				},
				response: { code: 400 },
				before: sandbox => {
					sandbox.stub(Invoker, 'serviceSafeClientCall').resolves();
				},
				after: (afterResponse, sandbox) => {
					sandbox.assert.notCalled(Invoker.serviceSafeClientCall);
				}
			}
		]);

		APITest(apiCustom({}), 'api/entity/1/file-get-credentials', [
			{
				description: 'Should return 400 if the entity its empty',
				session: true,
				request: {
					pathParameters: [1],
					data: { fileNames: ['image.png'] }
				},
				response: { code: 400, body: { message: SlsApiFileGetCredentialsError.messages.ENTITY_NOT_DEFINED } },
				before: sandbox => {
					sandbox.stub(Invoker, 'serviceSafeClientCall').resolves();
				},
				after: (afterResponse, sandbox) => {
					sandbox.assert.notCalled(Invoker.serviceSafeClientCall);
				}
			}
		]);

		APITest(apiCustom({ entityName: ['foo'] }), 'api/entity/1/file-get-credentials', [
			{
				description: 'Should return 400 if the entity its no a string',
				session: true,
				request: {
					pathParameters: [1],
					data: { fileNames: ['image.png'] }
				},
				response: { code: 400, body: { message: SlsApiFileGetCredentialsError.messages.ENTITY_NOT_STRING } },
				before: sandbox => {
					sandbox.stub(Invoker, 'serviceSafeClientCall').resolves();
				},
				after: (afterResponse, sandbox) => {
					sandbox.assert.notCalled(Invoker.serviceSafeClientCall);
				}
			}
		]);
	});

	context('Process', () => {

		context('When invoke fails', () => {

			APITest(defaultApiGetCredentials, 'api/entity/1/file-get-credentials', [
				{
					description: 'Should return 500 invoke fails',
					session: true,
					request: {
						pathParameters: [1],
						data: {
							fileNames: ['image.png']
						}
					},
					response: { code: 500 },
					before: sandbox => {
						sandbox.stub(Invoker, 'serviceSafeClientCall').rejects(new Error('some error'));
					},
					after: (afterResponse, sandbox) => {
						sandbox.assert.calledWithExactly(Invoker.serviceSafeClientCall, 'storage', 'GetCredentials', 'defaultClient', requestDataMultiplesFiles);
					}
				},
				{
					description: 'Should return 200 without the credentials',
					session: true,
					request: {
						pathParameters: [1],
						data: {
							fileNames: ['image.png']
						}
					},
					response: { code: 200 },
					before: sandbox => {
						sandbox.stub(Invoker, 'serviceSafeClientCall').resolves({ statusCode: 200, payload: {} });

					},
					after: (afterResponse, sandbox) => {
						sandbox.assert.calledWithExactly(Invoker.serviceSafeClientCall, 'storage', 'GetCredentials', 'defaultClient', requestDataMultiplesFiles);
					}
				},
				{
					description: 'Should return 500 when the data is wrong',
					session: true,
					request: {
						pathParameters: [1],
						data: {
							fileNames: ['image.png']
						}
					},
					response: { code: 500 },
					before: sandbox => {
						sandbox.stub(Invoker, 'serviceSafeClientCall').resolves({ statusCode: 404, payload: {} });

					},
					after: (afterResponse, sandbox) => {
						sandbox.assert.calledWithExactly(Invoker.serviceSafeClientCall, 'storage', 'GetCredentials', 'defaultClient', requestDataMultiplesFiles);
					}
				}
			]);
		});

		context('When the invoke success', () => {

			APITest(defaultApiGetCredentials, 'api/entity/1/file-get-credentials', [
				{
					description: 'Should return 200 with the credentials',
					session: true,
					request: {
						pathParameters: [1],
						data: {
							fileNames: ['image.png']
						}
					},
					response: { code: 200, body: { fileNames: credentials } },
					before: sandbox => {
						sandbox.stub(Invoker, 'serviceSafeClientCall').resolves({ statusCode: 200, payload: { fileNames: credentials } });
					},
					after: (afterResponse, sandbox) => {
						sandbox.assert.calledWithExactly(Invoker.serviceSafeClientCall, 'storage', 'GetCredentials', 'defaultClient', requestDataMultiplesFiles);
					}
				},
				{
					description: 'Should return 200 with the credentials',
					session: true,
					request: {
						pathParameters: [1],
						data: {
							fileName: 'image.png'
						}
					},
					response: { code: 200, body: credential },
					before: sandbox => {
						sandbox.stub(Invoker, 'serviceSafeClientCall').resolves({ statusCode: 200, payload: credential });
					},
					after: (afterResponse, sandbox) => {
						sandbox.assert.calledWithExactly(Invoker.serviceSafeClientCall, 'storage', 'GetCredentials', 'defaultClient', {
							...requestData,
							fileName: 'image.png'
						});
					}
				},
				{
					description: 'Should return 200 when request with the complete data',
					session: true,
					request: {
						pathParameters: [1],
						data: {
							fileNames: ['image.png'],
							credentialExpiration: '60',
							fileExpiration: 'oneDay'
						}
					},
					response: { code: 200, body: { fileNames: credentials } },
					before: sandbox => {
						sandbox.stub(Invoker, 'serviceSafeClientCall').resolves({ statusCode: 200, payload: { fileNames: credentials } });
					},
					after: (afterResponse, sandbox) => {
						sandbox.assert.calledWithExactly(Invoker.serviceSafeClientCall, 'storage', 'GetCredentials', 'defaultClient', {
							...requestDataMultiplesFiles,
							credentialExpiration: '60',
							fileExpiration: 'oneDay'
						});
					}
				}
			]);
		});
	});
});
