'use strict';

const globalSandbox = require('sinon').createSandbox();
const APITest = require('@janiscommerce/api-test');
const S3 = require('@janiscommerce/s3');
const { ApiListData } = require('@janiscommerce/api-list');
const { SlsApiFileList, SlsApiFileListError } = require('../lib/index');
const BaseModel = require('../lib/base-model');

describe('File List Api', () => {

	afterEach(() => {
		globalSandbox.restore();
	});

	beforeEach(() => {
		globalSandbox.stub(ApiListData.prototype, '_getModelInstance').returns(new BaseModel());
	});

	const url =
		'https://bucket.s3.amazonaws.com/file/a87a83d3-f494-4069-a0f7-fa0894590072.jpeg?AWSAccessKeyId=0&Expires=0&Signature=0';

	const bucketParams = {
		Bucket: 'test',
		Key: 'file/a87a83d3-f494-4069-a0f7-fa0894590072.jpeg',
		ResponseContentDisposition: 'attachment; filename="what.jpeg"'
	};

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

	const apiExtendedSimple = ({
		bucket,
		shouldAddUrl = false
	} = {}) => class API extends SlsApiFileList {

		get bucket() {
			return bucket;
		}

		get shouldAddUrl() {
			return shouldAddUrl;
		}
	};

	const apiCustom = ({
		bucket,
		postValidateHook = () => true,
		formatFileData = data => data,
		customAvailableFilters = [],
		customSortableFields = []
	} = {}) => class API extends SlsApiFileList {

		get bucket() {
			return bucket;
		}

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

	context('When Should not add url', () => {

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
					sandbox.stub(BaseModel.prototype, 'get');
				},
				after: (response, sandbox) => {
					sandbox.assert.notCalled(BaseModel.prototype.get);
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
					sandbox.stub(BaseModel.prototype, 'get');
				},
				after: (response, sandbox) => {
					sandbox.assert.notCalled(BaseModel.prototype.get);
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
					sandbox.stub(BaseModel.prototype, 'get');
				},
				after: (response, sandbox) => {
					sandbox.assert.notCalled(BaseModel.prototype.get);
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
					sandbox.stub(BaseModel.prototype, 'getTotals').resolves({ total: 1 });
				},
				after: (response, sandbox) => {
					sandbox.assert.calledOnceWithExactly(BaseModel.prototype.get, {
						limit: 60,
						page: 1
					});
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
						order: 1
					}]
				},
				before: sandbox => {
					sandbox.stub(BaseModel.prototype, 'get').resolves([rowGetted2]);
					sandbox.stub(BaseModel.prototype, 'getTotals').resolves({ total: 1 });
				},
				after: (response, sandbox) => {
					sandbox.assert.calledOnceWithExactly(BaseModel.prototype.get, {
						limit: 60,
						page: 1
					});
				}
			}
		]);

		APITest(apiExtendedSimple(), [
			{
				description: 'Should return empty array in body when not exists rows',
				session: true,
				response: {
					code: 200,
					body: []
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
				description: 'Should return a body with an array of results',
				request: {},
				session: true,
				response: {
					body: [rowFormatted2],
					headers: {
						'x-janis-total': 1
					},
					code: 200
				},
				before: sandbox => {
					sandbox.stub(BaseModel.prototype, 'get').resolves([rowGetted2]);
					sandbox.stub(BaseModel.prototype, 'getTotals').resolves({ total: 1 });
				},
				after: (response, sandbox) => {
					sandbox.assert.calledOnceWithExactly(BaseModel.prototype.getTotals);
					sandbox.assert.calledOnceWithExactly(BaseModel.prototype.get, {
						limit: 60,
						page: 1
					});
				}
			}
		]);
	});

	context('When Bucket is not setted but should add Url', () => {

		APITest(apiExtendedSimple({ shouldAddUrl: true }), [{
			request: {},
			description: 'Should return 400 if bucket is not defined',
			session: true,
			response: { code: 400, body: { message: SlsApiFileListError.messages.BUCKET_NOT_DEFINED } }
		}]);

		APITest(apiExtendedSimple({ bucket: 123, shouldAddUrl: true }), [{
			description: 'Should return 400 if bucket is not a string',
			request: {},
			session: true,
			response: { code: 400, body: { message: SlsApiFileListError.messages.BUCKET_NOT_STRING } }
		}]);
	});

	context('When Bucket is setted', () => {

		APITest(apiExtendedSimple({ bucket: 'test', shouldAddUrl: true }), [
			{
				description: 'Should return empty array in body when not exists rows',
				session: true,
				response: {
					code: 200,
					body: []
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
					sandbox.stub(S3, 'getSignedUrl').resolves(url);
				},
				after: (response, sandbox) => {
					sandbox.assert.calledOnceWithExactly(BaseModel.prototype.getTotals);
					sandbox.assert.calledOnceWithExactly(BaseModel.prototype.get, {
						limit: 60,
						page: 1
					});

					sandbox.assert.calledOnceWithExactly(S3.getSignedUrl, 'getObject', bucketParams);
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
					sandbox.stub(S3, 'getSignedUrl').rejects();
				},
				after: (response, sandbox) => {
					sandbox.assert.calledOnceWithExactly(BaseModel.prototype.getTotals);
					sandbox.assert.calledOnceWithExactly(BaseModel.prototype.get, {
						limit: 60,
						page: 1
					});

					sandbox.assert.calledOnceWithExactly(S3.getSignedUrl, 'getObject', bucketParams);
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
					sandbox.stub(S3, 'getSignedUrl').rejects({
						statusCode: 404
					});
				},
				after: (response, sandbox) => {
					sandbox.assert.calledOnceWithExactly(BaseModel.prototype.getTotals);
					sandbox.assert.calledOnceWithExactly(BaseModel.prototype.get, {
						limit: 60,
						page: 1
					});

					sandbox.assert.calledOnceWithExactly(S3.getSignedUrl, 'getObject', bucketParams);
				}
			},
			{
				description: 'Should return 200 and not make S3 request when path is not setted',
				request: {},
				session: true,
				response: {
					body: [{ ...rowFormatted, url: undefined }],
					headers: {
						'x-janis-total': 1
					},
					code: 200
				},
				before: sandbox => {

					const { path, ...fileWithOutPath } = rowGetted;

					sandbox.stub(BaseModel.prototype, 'get').resolves([fileWithOutPath]);
					sandbox.stub(BaseModel.prototype, 'getTotals').resolves({ total: 1 });

					sandbox.spy(S3, 'getSignedUrl');

				},
				after: (response, sandbox) => {
					sandbox.assert.calledOnceWithExactly(BaseModel.prototype.getTotals);
					sandbox.assert.calledOnceWithExactly(BaseModel.prototype.get, {
						limit: 60,
						page: 1
					});

					sandbox.assert.notCalled(S3.getSignedUrl);
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

		APITest(apiExtendedSimple(), Object.keys(filters).map(key => {
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
					sandbox.assert.calledOnceWithExactly(BaseModel.prototype.get, {
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
				before: sandbox => {
					sandbox.stub(BaseModel.prototype, 'get');
					BaseModel.prototype.get.returns([]);
				},
				after: (response, sandbox) => {
					sandbox.assert.calledOnceWithExactly(BaseModel.prototype.get, {
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

		APITest(apiExtendedSimple(),
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
					before: sandbox => {
						sandbox.stub(BaseModel.prototype, 'get');
						BaseModel.prototype.get.resolves([]);
					},
					after: (response, sandbox) => {
						sandbox.assert.calledOnceWithExactly(BaseModel.prototype.get, {
							page: 1,
							limit: 60,
							order: {
								[sort]: 'asc'
							}
						});
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
					before: sandbox => {
						sandbox.stub(BaseModel.prototype, 'get');
						BaseModel.prototype.get.resolves([]);
					},
					after: (response, sandbox) => {
						sandbox.assert.calledOnceWithExactly(BaseModel.prototype.get, {
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
					before: sandbox => {
						sandbox.stub(BaseModel.prototype, 'get');
						BaseModel.prototype.get.resolves([]);
					},
					after: (response, sandbox) => {
						sandbox.assert.calledOnceWithExactly(BaseModel.prototype.get, {
							page: 1,
							limit: 60,
							order: {
								[sort]: 'asc'
							}
						});
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
					before: sandbox => {
						sandbox.stub(BaseModel.prototype, 'get');
						BaseModel.prototype.get.resolves([]);
					},
					after: (response, sandbox) => {
						sandbox.assert.calledOnceWithExactly(BaseModel.prototype.get, {
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
