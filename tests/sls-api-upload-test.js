'use strict';

const APITest = require('@janiscommerce/api-test');
const S3 = require('@janiscommerce/s3');
const globalSandbox = require('sinon').createSandbox();
const { SlsApiUpload, SlsApiUploadError } = require('../lib/index');


const mockS3 = () => {
	globalSandbox.stub(S3, 'createPresignedPost').resolves({ url: 'URL', fields: {} });
};

const apiExtendedSimple = bucket => {
	class API extends SlsApiUpload {
		get bucket() {
			return bucket;
		}
	}

	return API;
};

const apiExtendedWithGetters = (
	bucket,
	path,
	availableTypes = [],
	expiration,
	sizeRange
) => {
	class API extends SlsApiUpload {
		get bucket() {
			return bucket;
		}

		get path() {
			return path;
		}

		get availableTypes() {
			return availableTypes;
		}

		get expiration() {
			return expiration || super.expiration;
		}

		get sizeRange() {
			return sizeRange || super.sizeRange;
		}
	}

	return API;
};

describe('SlsApiUpload', () => {

	context('test request body', () => {

		const response = { code: 400 };

		APITest(apiExtendedSimple('test'), [{
			description: 'should return 400 if request body is missing',
			response
		}, {
			description: 'should return 400 if request body data is empty',
			response,
			data: {}
		}, {
			description: 'should return 400 if fileName in request body is missing',
			request: {
				data: { name: 'test.txt' }
			},
			response
		}, {
			description: 'should return 400 if add extra data in request body received',
			request: {
				data: { fileName: 'test.txt', test: 1 }
			},
			response
		}, {
			description: 'should return 400 if fileName has invalid type',
			request: {
				data: { fileName: 1 }
			},
			response
		}]);
	});

	context('test required properties', () => {

		APITest(apiExtendedSimple(), [{
			description: 'should return 400 bucket is not defined',
			request: { data: { fileName: 'test.txt' } },
			response: { code: 400, body: { message: SlsApiUploadError.messages.BUCKET_NOT_DEFINED } }
		}]);

		APITest(apiExtendedSimple({}), [{
			description: 'should return 400 if bucket is not a string',
			request: { data: { fileName: 'test.txt' } },
			response: { code: 400, body: { message: SlsApiUploadError.messages.BUCKET_NOT_STRING } }
		}]);

		APITest(apiExtendedWithGetters('bucket-name', null), [{
			description: 'should return 400 if path is not a string',
			request: { data: { fileName: 'test.txt' } },
			response: { code: 400, body: { message: SlsApiUploadError.messages.PATH_NOT_STRING } }
		}]);

		APITest(apiExtendedSimple('bucket-name'), [{
			description: 'should return 400 if fileName has an invalid extension',
			request: {
				data: { fileName: 'test.extension' }
			},
			response: { code: 400, body: { message: SlsApiUploadError.messages.FILE_TYPE_NOT_RECOGNIZED } }
		}]);

		APITest(apiExtendedWithGetters('bucket-name', 'files', null), [{
			description: 'should return 400 if pass invalid availableTypes',
			request: { data: { fileName: 'test.txt' } },
			response: { code: 400, body: { message: SlsApiUploadError.messages.AVAILABLE_TYPES_NOT_ARRAY } }
		}]);

		APITest(apiExtendedWithGetters('bucket-name', 'files', ['application/json']), [{
			description: 'should return 400 if pass filename with extension not available',
			request: { data: { fileName: 'test.txt' } },
			response: { code: 400, body: { message: SlsApiUploadError.messages.FILE_TYPE_NOT_AVAILABLE } }
		}]);

		APITest(apiExtendedWithGetters('bucket-name', 'files', [], 'test'), [{
			description: 'should return 400 if pass filename with invalid expiration',
			request: { data: { fileName: 'test.txt' } },
			response: { code: 400, body: { message: SlsApiUploadError.messages.EXPIRATION_NOT_NUMBER } }
		}]);

		APITest(apiExtendedWithGetters('bucket-name', 'files', [], 120, 'test'), [{
			description: 'should return 400 if pass filename with invalid sizeRange',
			request: { data: { fileName: 'test.txt' } },
			response: { code: 400, body: { message: SlsApiUploadError.messages.LENGTH_RANGE_NOT_ARRAY } }
		}]);

		APITest(apiExtendedWithGetters('bucket-name', 'files', [], 120, [1, 'range']), [{
			description: 'should return 400 if pass filename with invalid sizeRange',
			request: { data: { fileName: 'test.txt' } },
			response: { code: 400, body: { message: SlsApiUploadError.messages.LENGTH_RANGE_ITEM_NOT_NUMBER } }
		}]);

		APITest(apiExtendedWithGetters('bucket-name', 'files', [], 120, ['range', 15000]), [{
			description: 'should return 400 if pass filename with invalid sizeRange',
			request: { data: { fileName: 'test.txt' } },
			response: { code: 400, body: { message: SlsApiUploadError.messages.LENGTH_RANGE_ITEM_NOT_NUMBER } }
		}]);
	});

	context('Correct usage', () => {
		const uuidRgx = '[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}.json$';

		beforeEach(() => {
			mockS3();
		});

		afterEach(() => {
			globalSandbox.restore();
		});

		APITest(apiExtendedSimple('bucket-name'), [{
			description: 'should return 200 if file txt',
			request: { data: { fileName: 'test.text' } },
			response: { code: 200 }
		}]);

		APITest(apiExtendedWithGetters('bucket-name', 'files', ['application/json']), [{
			description: 'should return 200 if pass a filename json with availableTypes',
			request: { data: { fileName: 'test.json' } },
			response: { code: 200 }
		}]);

		APITest(apiExtendedWithGetters('bucket-name', 'files', [], 120), [{
			description: 'should return 200 if pass a filename json with expiration',
			request: { data: { fileName: 'test.json' } },
			response: { code: 200 },
			after: (afterResponse, sandbox) => {
				sandbox.assert.calledWithMatch(S3.createPresignedPost, {
					Expires: 120
				});
			}
		}]);

		APITest(apiExtendedWithGetters('bucket-name', 'files'), [{
			description: 'should return 200 if pass a filename json with default sizeRange',
			request: { data: { fileName: 'test.json' } },
			response: { code: 200 },
			after: (afterResponse, sandbox) => {
				sandbox.assert.calledWithMatch(S3.createPresignedPost, {
					Expires: 60,
					Conditions: [['content-length-range', 1, 10 * 1024 * 1024]]
				});
			}
		}]);

		APITest(apiExtendedWithGetters('bucket-name', 'files', [], 120, [1, 20000000]), [{
			description: 'should return 200 if pass a filename json with sizeRange',
			request: { data: { fileName: 'test.json' } },
			response: { code: 200 },
			after: (afterResponse, sandbox) => {
				sandbox.assert.calledWithMatch(S3.createPresignedPost, {
					Expires: 120,
					Conditions: [['content-length-range', 1, 20000000]]
				});
			}
		}]);


		APITest(apiExtendedWithGetters('bucket-name', 'files/'), [{
			description: 'should return 200 if pass filename with path correct',
			request: { data: { fileName: 'test.json' } },
			response: { code: 200 },
			after: (afterResponse, sandbox) => {
				sandbox.assert.calledWithMatch(S3.createPresignedPost, {
					Fields: {
						key: sandbox.match(new RegExp(`^files/${uuidRgx}`))
					}
				});
			}
		}]);


		APITest(apiExtendedWithGetters('bucket-name', '/files/images'), [{
			description: 'should return 200 if pass filename with path to resolve',
			request: { data: { fileName: 'test.json' } },
			response: { code: 200 },
			after: (afterResponse, sandbox) => {
				sandbox.assert.calledWithMatch(S3.createPresignedPost, {
					Fields: {
						key: sandbox.match(new RegExp(`^files/images/${uuidRgx}`))
					}
				});
			}
		}]);

		APITest(apiExtendedWithGetters('bucket-name', 'files'), [{
			description: 'should return 200 if pass filename with path to resolve',
			request: { data: { fileName: 'test.json' } },
			response: { code: 200 },
			after: (afterResponse, sandbox) => {
				sandbox.assert.calledWithMatch(S3.createPresignedPost, {
					Fields: {
						key: sandbox.match(new RegExp(`^files/${uuidRgx}`))
					}
				});
			}
		}]);

		APITest(apiExtendedSimple('bucket-name'), [{
			description: 'should return 200 if pass filename with path empty',
			request: { data: { fileName: 'test.json' } },
			response: { code: 200 },
			after: (afterResponse, sandbox) => {
				sandbox.assert.calledWithMatch(S3.createPresignedPost, {
					Fields: {
						key: sandbox.match(new RegExp(`^${uuidRgx}`))
					}
				});
			}
		}]);

		APITest(apiExtendedSimple('bucket-name'), [
			{
				description: 'should pass correct content-type to request with image png file',
				request: { data: { fileName: 'test.png' } },
				response: { code: 200 },
				after: (afterResponse, sandbox) => {
					sandbox.assert.calledWithMatch(S3.createPresignedPost, {
						Fields: {
							'Content-Type': 'image/png'
						}
					});
				}
			},
			{
				description: 'should pass correct content-type to request with json file',
				request: { data: { fileName: 'test.json' } },
				response: { code: 200 },
				after: (afterResponse, sandbox) => {
					sandbox.assert.calledWithMatch(S3.createPresignedPost, {
						Fields: {
							'Content-Type': 'application/json'
						}
					});
				}
			}
		]);
	});

	context('S3 error', () => {

		beforeEach(() => {
			globalSandbox.stub(S3, 'createPresignedPost').rejects(new Error('S3 internal error'));
		});

		afterEach(() => {
			globalSandbox.restore();
		});

		APITest(apiExtendedSimple('bucket-name'), [{
			description: 'should return 500 if S3 rejects',
			request: { data: { fileName: 'test.text' } },
			response: { code: 500 }
		}]);
	});

});
