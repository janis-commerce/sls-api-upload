'use strict';

const globalSandbox = require('sinon').createSandbox();
const APITest = require('@janiscommerce/api-test');
const { ApiListData } = require('@janiscommerce/api-list');
const { SlsApiFileList } = require('../lib/index');
const BaseModel = require('../lib/base-model');

describe('File List Api', () => {
	class ApiListExample extends SlsApiFileList {}

	afterEach(() => {
		globalSandbox.restore();
	});

	beforeEach(() => {
		globalSandbox.stub(ApiListData.prototype, '_getModelInstance').returns(new BaseModel());
	});

	const rowGetted = {
		id: 20,
		name: 'what.jpeg',
		claimId: 7,
		size: 5014,
		mimeType: 'image/jpeg',
		path: 'file/a87a83d3-f494-4069-a0f7-fa0894590072.jpeg',
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
		path: 'file/a87a83d3-f494-4069-a0f7-fa0894590073.txt',
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

	APITest(ApiListExample, [
		{
			before: sandbox => {
				sandbox.stub(BaseModel.prototype, 'get')
					.resolves([]);
			},
			description: 'should return empty array in body when not exists rows',
			request: {
				body: []
			},
			session: true,
			response: {
				code: 200
			},
			after: (response, sandbox) => {
				sandbox.assert.calledOnce(BaseModel.prototype.get);
				sandbox.assert.calledWithExactly(BaseModel.prototype.get, {
					limit: 60,
					page: 1
				});
			}
		},
		{
			before: sandbox => {
				sandbox.stub(BaseModel.prototype, 'get')
					.resolves([rowGetted]);
				sandbox.stub(BaseModel.prototype, 'getTotals')
					.resolves({ total: 1 });
			},
			description: 'should return a body with an array of results, with each row formatted (one row)',
			request: {},
			session: true,
			response: {
				body: [rowFormatted],
				headers: {
					'x-janis-total': 1
				},
				code: 200
			},
			after: (response, sandbox) => {
				sandbox.assert.calledOnce(BaseModel.prototype.get);
				sandbox.assert.calledOnce(BaseModel.prototype.getTotals);
				sandbox.assert.calledWithExactly(BaseModel.prototype.getTotals);
				sandbox.assert.calledWithExactly(BaseModel.prototype.get, {
					limit: 60,
					page: 1
				});
			}
		},
		{
			before: sandbox => {
				sandbox.stub(BaseModel.prototype, 'get')
					.resolves([rowGetted, rowGetted2]);
				sandbox.stub(BaseModel.prototype, 'getTotals')
					.resolves({ total: 2 });
			},
			description: 'should return a body with an array of results, with each row formatted (two rows)',
			request: {},
			session: true,
			response: {
				body: [rowFormatted, rowFormatted2],
				headers: {
					'x-janis-total': 2
				},
				code: 200
			},
			after: (response, sandbox) => {
				sandbox.assert.calledOnce(BaseModel.prototype.get);
				sandbox.assert.calledOnce(BaseModel.prototype.getTotals);
				sandbox.assert.calledWithExactly(BaseModel.prototype.getTotals);
				sandbox.assert.calledWithExactly(BaseModel.prototype.get, {
					limit: 60,
					page: 1
				});
			}
		},
		{
			before: sandbox => {
				sandbox.stub(BaseModel.prototype, 'get')
					.resolves([rowGetted]);
				sandbox.stub(BaseModel.prototype, 'getTotals')
					.resolves({ total: 1 });
			},
			description: 'should return a body with an array of results, sending a filter',
			request: {
				data: { filters: { name: 'test' } }
			},
			session: true,
			response: {
				body: [rowFormatted],
				headers: {
					'x-janis-total': 1
				},
				code: 200
			},
			after: (response, sandbox) => {
				sandbox.assert.calledOnce(BaseModel.prototype.get);
				sandbox.assert.calledWithExactly(BaseModel.prototype.get, {
					filters: { name: 'test' },
					limit: 60,
					page: 1
				});
				sandbox.assert.calledOnce(BaseModel.prototype.getTotals);
				sandbox.assert.calledWithExactly(BaseModel.prototype.getTotals);
			}
		},
		{
			description: 'should return a 400 when send a wrong filter',
			request: {
				data: { filters: { wrongFilter: 'Testing' } }
			},
			session: true,
			response: {
				code: 400
			}
		},
		{
			description: 'should return a 400 when send a wrong sort',
			request: {
				data: { sortBy: 'Testing' }
			},
			session: true,
			response: {
				code: 400
			}
		}
	]);

	describe('Filtering', () => {
		const filters = {
			id: 2,
			name: 'test',
			dateCreated: '2019-02-22T21:30:59.000Z'
		};

		APITest(ApiListExample, Object.keys(filters).map(key => {
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
				before: sandbox => {
					sandbox.stub(BaseModel.prototype, 'get');
					BaseModel.prototype.get.returns([]);
				},
				after: (response, sandbox) => {
					sandbox.assert.calledOnce(BaseModel.prototype.get);
					sandbox.assert.calledWithExactly(BaseModel.prototype.get, {
						page: 1,
						limit: 60,
						filters: {
							[key]: filterValue
						}
					});
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

		APITest(ApiListExample,
			sorts.reduce((accum, sort) => ([
				...accum,
				{
					description: `'Should pass the "${sort}" sort field to the model asc'`,
					request: {
						data: {
							sortBy: sort
						}
					},
					response: {
						code: 200
					},
					before: sandbox => {
						sandbox.stub(BaseModel.prototype, 'get');
						BaseModel.prototype.get.resolves([]);
					},
					after: (response, sandbox) => {
						sandbox.assert.calledOnce(BaseModel.prototype.get);
						sandbox.assert.calledWithExactly(BaseModel.prototype.get, {
							page: 1,
							limit: 60,
							order: {
								[sort]: 'asc'
							}
						});
					}
				},
				{
					description: `'Should pass the "${sort}" sort field to the model desc'`,
					request: {
						data: {
							sortBy: sort,
							sortDirection: 'desc'
						}
					},
					response: {
						code: 200
					},
					before: sandbox => {
						sandbox.stub(BaseModel.prototype, 'get');
						BaseModel.prototype.get.resolves([]);
					},
					after: (response, sandbox) => {
						sandbox.assert.calledOnce(BaseModel.prototype.get);
						sandbox.assert.calledWithExactly(BaseModel.prototype.get, {
							page: 1,
							limit: 60,
							order: {
								[sort]: 'desc'
							}
						});
					}
				}
			]), [])
		);
	});
});
