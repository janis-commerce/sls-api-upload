'use strict';

const sinon = require('sinon');
const APITest = require('@janiscommerce/api-test');
const { ApiListData } = require('@janiscommerce/api-list');
const { Invoker } = require('@janiscommerce/lambda');

const { SlsApiFileList } = require('../lib/index');
const BaseModel = require('../lib/base-model');

describe('File List Api', () => {

	afterEach(() => {
		sinon.restore();
	});

	beforeEach(() => {
		sinon.stub(ApiListData.prototype, '_getModelInstance').returns(new BaseModel());
	});

	const path = 'cdn/files/defaultClient/a87a83d3-f494-4069-a0f7-fa0894590072.png';
	const url =
		// eslint-disable-next-line max-len
		'https://cdn.storage.janisdev.in/cdn/files/defaultClient/U2ZPvzsjjTeUy5v56VZjkTUyacfKyE3P.png?Expires=1673568000&Key-Pair-Id=K2P6YIJ6NYT9Z8&Signature=AKKu01bTVytc7nTrsJjHUGkn5hNCFXpHGJcDWojkzVfpb9Y2ssN47VNBQIWVE3lO8efU9W';

	const rowGetted = {
		id: 20,
		name: 'what.jpeg',
		claimId: 7,
		size: 5014,
		mimeType: 'image/jpeg',
		path,
		type: 'image',
		dateCreated: 1576269240,
		userCreated: 5,
		dateModified: 1576272801,
		userModified: null
	};

	const rowGetted2 = {
		id: 21,
		name: 'file.txt',
		claimId: 7,
		size: 8405,
		mimeType: 'text/plain',
		path,
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
		mimeType: 'image/jpeg',
		type: 'image',
		url,
		dateCreated: 1576269240,
		userCreated: 5,
		dateModified: 1576272801,
		userModified: null
	};

	const rowFormatted2 = {
		id: 21,
		name: 'file.txt',
		claimId: 7,
		size: 8405,
		mimeType: 'text/plain',
		type: 'other',
		dateCreated: 1576269240,
		userCreated: 5,
		dateModified: 1576272801,
		userModified: null
	};

	const signedFiles = {
		// eslint-disable-next-line max-len
		'cdn/files/defaultClient/a87a83d3-f494-4069-a0f7-fa0894590072.png': 'https://cdn.storage.janisdev.in/cdn/files/defaultClient/U2ZPvzsjjTeUy5v56VZjkTUyacfKyE3P.png?Expires=1673568000&Key-Pair-Id=K2P6YIJ6NYT9Z8&Signature=AKKu01bTVytc7nTrsJjHUGkn5hNCFXpHGJcDWojkzVfpb9Y2ssN47VNBQIWVE3lO8efU9W'
	};

	const apiCustom = ({
		postValidateHook = () => true,
		formatFileData = data => data,
		customAvailableFilters = [],
		customSortableFields = []
	} = {}) => class API extends SlsApiFileList {

		get customAvailableFilters() {
			return customAvailableFilters;
		}

		get customSortableFields() {
			return customSortableFields;
		}

		postValidateHook() {
			return postValidateHook();
		}

		formatFileData(data) {
			return formatFileData(data);
		}
	};

	context('When the implementation is not valid', () => {

		APITest(apiCustom({
			customSortableFields: 'order'
		}), [
			{
				description: 'Should return 400 if custom Sortable Fiels is invalid',
				session: true,
				response: {
					code: 400
				},
				before: sandbox => {
					sandbox.stub(BaseModel.prototype, 'get').resolves([]);
					sandbox.stub(BaseModel.prototype, 'getTotals').resolves({});
					sandbox.stub(Invoker, 'serviceSafeClientCall').resolves({});
				},
				after: (response, sandbox) => {
					sandbox.assert.notCalled(BaseModel.prototype.get);
					sandbox.assert.notCalled(Invoker.serviceSafeClientCall);
				}
			}
		]);

		APITest(apiCustom({
			customAvailableFilters: 'order'
		}), [
			{
				description: 'Should return 400 if custom Available Filters is invalid',
				session: true,
				response: {
					code: 400
				},
				before: sandbox => {
					sandbox.stub(BaseModel.prototype, 'get').resolves([]);
					sandbox.stub(BaseModel.prototype, 'getTotals').resolves({});
					sandbox.stub(Invoker, 'serviceSafeClientCall').resolves({});
				},
				after: (response, sandbox) => {
					sandbox.assert.notCalled(BaseModel.prototype.get);
					sandbox.assert.notCalled(Invoker.serviceSafeClientCall);
				}
			}
		]);

		APITest(apiCustom({
			postValidateHook: () => { throw new Error(); }
		}), [
			{
				description: 'Should return 400 if custom validation fails',
				session: true,
				response: {
					code: 400
				},
				before: sandbox => {
					sandbox.stub(BaseModel.prototype, 'get').resolves([]);
					sandbox.stub(BaseModel.prototype, 'getTotals').resolves({});
					sandbox.stub(Invoker, 'serviceSafeClientCall').resolves({});
				},
				after: (response, sandbox) => {
					sandbox.assert.notCalled(BaseModel.prototype.get);
					sandbox.assert.notCalled(Invoker.serviceSafeClientCall);
				}
			}
		]);

		APITest(apiCustom({
			formatFileData: () => { throw new Error(); }
		}), [
			{
				description: 'Should return 500 if custom format fails',
				session: true,
				response: {
					code: 500
				},
				before: sandbox => {
					sandbox.stub(BaseModel.prototype, 'get').resolves([rowGetted]);
					sandbox.stub(BaseModel.prototype, 'getTotals').resolves({});
					sandbox.stub(Invoker, 'serviceSafeClientCall').resolves({});
				},
				after: (response, sandbox) => {
					sandbox.assert.calledOnceWithExactly(BaseModel.prototype.get, {
						limit: 60,
						page: 1
					});
					sinon.assert.calledWithExactly(Invoker.serviceSafeClientCall, 'storage', 'GetSignedFiles', 'defaultClient', { paths: [path] });
				}
			}
		]);

		APITest(apiCustom({
			formatFileData: data => ({ ...data, order: 1 })
		}), [
			{
				description: 'Should return 200 and field in custom format',
				session: true,
				response: {
					code: 200,
					body: [{
						...rowFormatted2,
						url,
						order: 1
					}]
				},
				before: sandbox => {
					sandbox.stub(BaseModel.prototype, 'get').resolves([rowGetted2]);
					sandbox.stub(BaseModel.prototype, 'getTotals').resolves({ total: 1 });
					sandbox.stub(Invoker, 'serviceSafeClientCall').resolves({ statusCode: 200, payload: signedFiles });
				},
				after: (response, sandbox) => {
					sandbox.assert.calledOnceWithExactly(BaseModel.prototype.get, {
						limit: 60,
						page: 1
					});
					sinon.assert.calledWithExactly(Invoker.serviceSafeClientCall, 'storage', 'GetSignedFiles', 'defaultClient', { paths: [path] });
				}
			}
		]);
	});

	context('When the implementation is valid', () => {

		APITest(SlsApiFileList, [
			{
				description: 'Should return empty array in body when not exists rows',
				session: true,
				response: {
					code: 200,
					body: []
				},
				before: sandbox => {
					sandbox.stub(BaseModel.prototype, 'get').resolves([]);
					sandbox.stub(Invoker, 'serviceSafeClientCall').resolves({});
				},
				after: (response, sandbox) => {
					sandbox.assert.calledOnceWithExactly(BaseModel.prototype.get, {
						limit: 60,
						page: 1
					});
					sandbox.assert.notCalled(Invoker.serviceSafeClientCall);
				}
			},
			{
				description: 'Should return a body with an array of results',
				request: {},
				session: true,
				response: {
					body: [{ ...rowFormatted2, url }],
					headers: {
						'x-janis-total': 1
					},
					code: 200
				},
				before: sandbox => {
					sandbox.stub(BaseModel.prototype, 'get').resolves([rowGetted2]);
					sandbox.stub(BaseModel.prototype, 'getTotals').resolves({ total: 1 });
					sandbox.stub(Invoker, 'serviceSafeClientCall').resolves({ statusCode: 200, payload: signedFiles });
				},
				after: (response, sandbox) => {
					sandbox.assert.calledOnceWithExactly(BaseModel.prototype.getTotals);
					sandbox.assert.calledOnceWithExactly(BaseModel.prototype.get, {
						limit: 60,
						page: 1
					});
					sinon.assert.calledWithExactly(Invoker.serviceSafeClientCall, 'storage', 'GetSignedFiles', 'defaultClient', { paths: [path] });
				}
			}
		]);

		APITest(SlsApiFileList, [
			{
				description: 'Should return empty array in body when not exists rows',
				session: true,
				response: {
					code: 200
				},
				before: sandbox => {
					sandbox.stub(BaseModel.prototype, 'get').resolves([]);
				},
				after: (response, sandbox) => {
					sandbox.assert.calledOnceWithExactly(BaseModel.prototype.get, {
						limit: 60,
						page: 1
					});
				}
			},
			{
				description: 'Should return a body with an array of results with url formatted',
				request: {},
				session: true,
				response: {
					body: [rowFormatted],
					headers: {
						'x-janis-total': 1
					},
					code: 200
				},
				before: sandbox => {
					sandbox.stub(BaseModel.prototype, 'get').resolves([rowGetted]);
					sandbox.stub(BaseModel.prototype, 'getTotals').resolves({ total: 1 });
					sandbox.stub(Invoker, 'serviceSafeClientCall').resolves({ statusCode: 200, payload: signedFiles });
				},
				after: (response, sandbox) => {
					sandbox.assert.calledOnceWithExactly(BaseModel.prototype.getTotals);
					sandbox.assert.calledOnceWithExactly(BaseModel.prototype.get, {
						limit: 60,
						page: 1
					});
					sinon.assert.calledWithExactly(Invoker.serviceSafeClientCall, 'storage', 'GetSignedFiles', 'defaultClient', { paths: [path] });
				}
			},
			{
				description: 'Should return 500 if Sign URL fails',
				request: {},
				session: true,
				response: {
					code: 500
				},
				before: sandbox => {
					sandbox.stub(BaseModel.prototype, 'get').resolves([rowGetted]);
					sandbox.stub(BaseModel.prototype, 'getTotals').resolves({ total: 1 });
					sandbox.stub(Invoker, 'serviceSafeClientCall').rejects({ statusCode: 500, payload: {} });
				},
				after: (response, sandbox) => {
					sandbox.assert.calledOnceWithExactly(BaseModel.prototype.getTotals);
					sandbox.assert.calledOnceWithExactly(BaseModel.prototype.get, {
						limit: 60,
						page: 1
					});
					sinon.assert.calledWithExactly(Invoker.serviceSafeClientCall, 'storage', 'GetSignedFiles', 'defaultClient', { paths: [path] });
				}
			},
			{
				description: 'Should return 200 with valid data if file does not exist in s3',
				request: {},
				session: true,
				response: {
					body: [{ ...rowFormatted, url: null }],
					headers: {
						'x-janis-total': 1
					},
					code: 200
				},
				before: sandbox => {
					sandbox.stub(BaseModel.prototype, 'get').resolves([rowGetted]);
					sandbox.stub(BaseModel.prototype, 'getTotals').resolves({ total: 1 });
					sandbox.stub(Invoker, 'serviceSafeClientCall').resolves({ statusCode: 200, payload: {} });
				},
				after: (response, sandbox) => {
					sandbox.assert.calledOnceWithExactly(BaseModel.prototype.getTotals);
					sandbox.assert.calledOnceWithExactly(BaseModel.prototype.get, {
						limit: 60,
						page: 1
					});
					sinon.assert.calledWithExactly(Invoker.serviceSafeClientCall, 'storage', 'GetSignedFiles', 'defaultClient', { paths: [path] });
				}
			},
			{
				description: 'Should return 200 and not make Storage request when path is not setted',
				request: {},
				session: true,
				response: {
					body: [{ ...rowFormatted, url: null }],
					headers: {
						'x-janis-total': 1
					},
					code: 200
				},
				before: sandbox => {

					const { path: pathSaved, ...fileWithOutPath } = rowGetted;

					sandbox.stub(BaseModel.prototype, 'get').resolves([fileWithOutPath]);
					sandbox.stub(BaseModel.prototype, 'getTotals').resolves({ total: 1 });
					sandbox.stub(Invoker, 'serviceSafeClientCall').resolves({});
				},
				after: (response, sandbox) => {
					sandbox.assert.calledOnceWithExactly(BaseModel.prototype.getTotals);
					sandbox.assert.calledOnceWithExactly(BaseModel.prototype.get, {
						limit: 60,
						page: 1
					});
					sandbox.assert.notCalled(Invoker.serviceSafeClientCall);
				}
			}
		]);
	});

	describe('Filtering', () => {

		const filters = {
			id: 2,
			name: 'test',
			dateCreated: '2019-02-22T21:30:59.000Z'
		};

		APITest(SlsApiFileList, Object.keys(filters).map(key => {
			const filter = filters[key];
			const filterValue = key === 'dateCreated' ? new Date(filters[key]) : filters[key];

			return {
				description: `Should pass the ${key}=${filter} filter with to the model`,
				request: {
					data: {
						filters: {
							[key]: filter
						}
					}
				},
				response: {
					code: 200
				},
				session: true,
				before: sandbox => {
					sandbox.stub(BaseModel.prototype, 'get').returns([]);
					sandbox.stub(Invoker, 'serviceSafeClientCall').resolves({});
				},
				after: (response, sandbox) => {
					sandbox.assert.calledOnceWithExactly(BaseModel.prototype.get, {
						page: 1,
						limit: 60,
						filters: {
							[key]: filterValue
						}
					});
					sandbox.assert.notCalled(Invoker.serviceSafeClientCall);
				}
			};
		}));
	});

	describe('Custom Filters', () => {

		const filters = {
			id: 2,
			name: 'test',
			dateCreated: '2019-02-22T21:30:59.000Z',
			order: 1
		};

		APITest(apiCustom({ customAvailableFilters: ['order'] }), Object.keys(filters).map(key => {
			const filter = filters[key];
			const filterValue = key === 'dateCreated' ? new Date(filters[key]) : filters[key];

			return {
				description: `Should pass the ${key}=${filter} filter with to the model`,
				request: {
					data: {
						filters: {
							[key]: filter
						}
					}
				},
				response: {
					code: 200
				},
				session: true,
				before: sandbox => {
					sandbox.stub(BaseModel.prototype, 'get').returns([]);
					sandbox.stub(Invoker, 'serviceSafeClientCall').resolves({});
				},
				after: (response, sandbox) => {
					sandbox.assert.calledOnceWithExactly(BaseModel.prototype.get, {
						page: 1,
						limit: 60,
						filters: {
							[key]: filterValue
						}
					});
					sandbox.assert.notCalled(Invoker.serviceSafeClientCall);
				}
			};
		}));
	});

	describe('Sorting', () => {

		const sorts = [
			'id',
			'name',
			'dateCreated'
		];

		APITest(SlsApiFileList,
			sorts.reduce((accum, sort) => ([
				...accum,
				{
					description: `Should pass the "${sort}" sort field to the model asc`,
					request: {
						data: {
							sortBy: sort
						}
					},
					response: {
						code: 200
					},
					session: true,
					before: sandbox => {
						sandbox.stub(BaseModel.prototype, 'get').resolves([]);
						sandbox.stub(Invoker, 'serviceSafeClientCall').resolves({});
					},
					after: (response, sandbox) => {
						sandbox.assert.calledOnceWithExactly(BaseModel.prototype.get, {
							page: 1,
							limit: 60,
							order: {
								[sort]: 'asc'
							}
						});
						sandbox.assert.notCalled(Invoker.serviceSafeClientCall);
					}
				},
				{
					description: `Should pass the "${sort}" sort field to the model desc`,
					request: {
						data: {
							sortBy: sort,
							sortDirection: 'desc'
						}
					},
					response: {
						code: 200
					},
					session: true,
					before: sandbox => {
						sandbox.stub(BaseModel.prototype, 'get').resolves([]);
						sandbox.stub(Invoker, 'serviceSafeClientCall').resolves({});
					},
					after: (response, sandbox) => {
						sandbox.assert.calledOnceWithExactly(BaseModel.prototype.get, {
							page: 1,
							limit: 60,
							order: {
								[sort]: 'desc'
							}
						});
						sandbox.assert.notCalled(Invoker.serviceSafeClientCall);
					}
				}
			]), [])
		);
	});

	describe('Custom Sorting', () => {

		const sorts = [
			'id',
			'name',
			'dateCreated',
			'order'
		];

		APITest(apiCustom({ customSortableFields: ['order'] }),
			sorts.reduce((accum, sort) => ([
				...accum,
				{
					description: `Should pass the "${sort}" sort field to the model asc`,
					request: {
						data: {
							sortBy: sort
						}
					},
					response: {
						code: 200
					},
					session: true,
					before: sandbox => {
						sandbox.stub(BaseModel.prototype, 'get').resolves([]);
						sandbox.stub(Invoker, 'serviceSafeClientCall').resolves({});
					},
					after: (response, sandbox) => {
						sandbox.assert.calledOnceWithExactly(BaseModel.prototype.get, {
							page: 1,
							limit: 60,
							order: {
								[sort]: 'asc'
							}
						});
						sandbox.assert.notCalled(Invoker.serviceSafeClientCall);
					}
				},
				{
					description: `Should pass the "${sort}" sort field to the model desc`,
					request: {
						data: {
							sortBy: sort,
							sortDirection: 'desc'
						}
					},
					response: {
						code: 200
					},
					session: true,
					before: sandbox => {
						sandbox.stub(BaseModel.prototype, 'get').resolves([]);
						sandbox.stub(Invoker, 'serviceSafeClientCall').resolves({});
					},
					after: (response, sandbox) => {
						sandbox.assert.calledOnceWithExactly(BaseModel.prototype.get, {
							page: 1,
							limit: 60,
							order: {
								[sort]: 'desc'
							}
						});
						sandbox.assert.notCalled(Invoker.serviceSafeClientCall);
					}
				}
			]), [])
		);
	});
});
