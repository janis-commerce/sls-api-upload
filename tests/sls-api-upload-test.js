'use strict';

const assert = require('assert');
const APITest = require('@janiscommerce/api-test');
const globalSandbox = require('sinon').createSandbox();
const S3 = require('../lib/s3');
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
	expiration = 60,
	lengthRange = [1, 10000000]
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
			return expiration;
		}

		get lengthRange() {
			return lengthRange;
		}
	}

	return API;
};

describe('SlsApiUpload', () => {
	context('test body request', () => {

		const response = { code: 400 };

		APITest(apiExtendedSimple('test'), [{
			description: 'should return 400 if request body is missing',
			response
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
			description: 'should return 400 if not define bucket',
			request: { data: { fileName: 'test.txt' } },
			response: { code: 400, body: { message: SlsApiUploadError.messages.BUCKET_NOT_DEFINED } }
		}]);

		APITest(apiExtendedSimple({}), [{
			description: 'should return 400 if pass invalid bucket',
			request: { data: { fileName: 'test.txt' } },
			response: { code: 400, body: { message: SlsApiUploadError.messages.BUCKET_NOT_STRING } }
		}]);

		APITest(apiExtendedWithGetters('bucket-name', null), [{
			description: 'should return 400 if pass invalid path',
			request: { data: { fileName: 'test.txt' } },
			response: { code: 400, body: { message: SlsApiUploadError.messages.PATH_NOT_STRING } }
		}]);

		APITest(apiExtendedSimple('bucket-name'), [{
			description: 'should return 400 if pass fileName with invalid extension',
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
			description: 'should return 400 if pass filename with expiration invalid',
			request: { data: { fileName: 'test.txt' } },
			response: { code: 400, body: { message: SlsApiUploadError.messages.EXPIRATION_NOT_NUMBER } }
		}]);

		APITest(apiExtendedWithGetters('bucket-name', 'files', [], 120, 'test'), [{
			description: 'should return 400 if pass filename with lengthRange invalid',
			request: { data: { fileName: 'test.txt' } },
			response: { code: 400, body: { message: SlsApiUploadError.messages.LENGTH_RANGE_NOT_ARRAY } }
		}]);

		APITest(apiExtendedWithGetters('bucket-name', 'files', [], 120, [1, 'range']), [{
			description: 'should return 400 if pass filename with lengthRange invalid',
			request: { data: { fileName: 'test.txt' } },
			response: { code: 400, body: { message: SlsApiUploadError.messages.LENGTH_RANGE_ITEM_NOT_NUMBER } }
		}]);

		APITest(apiExtendedWithGetters('bucket-name', 'files', [], 120, ['range', 15000]), [{
			description: 'should return 400 if pass filename with lengthRange invalid',
			request: { data: { fileName: 'test.txt' } },
			response: { code: 400, body: { message: SlsApiUploadError.messages.LENGTH_RANGE_ITEM_NOT_NUMBER } }
		}]);

	});


	context('test correct usage', () => {

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

		APITest(apiExtendedWithGetters('bucket-name', 'files', [], 120, [1, 20000000]), [{
			description: 'should return 200 if pass a filename json with lengthRange',
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
			before: sandbox => {
				sandbox.spy(SlsApiUpload.prototype, 'resolvePath');
			},
			description: 'should return 200 if pass filename with path correct',
			request: { data: { fileName: 'test.json' } },
			response: { code: 200 },
			after: () => {
				const call = SlsApiUpload.prototype.resolvePath.getCall(0);

				assert(call.returnValue === 'files/');
			}
		}]);


		APITest(apiExtendedWithGetters('bucket-name', '/files'), [{
			before: sandbox => {
				sandbox.spy(SlsApiUpload.prototype, 'resolvePath');
			},
			description: 'should return 200 if pass filename with path to resolve',
			request: { data: { fileName: 'test.json' } },
			response: { code: 200 },
			after: () => {
				const call = SlsApiUpload.prototype.resolvePath.getCall(0);

				assert(call.returnValue === 'files/');
			}
		}]);

		APITest(apiExtendedWithGetters('bucket-name', 'files'), [{
			before: sandbox => {
				sandbox.spy(SlsApiUpload.prototype, 'resolvePath');
			},
			description: 'should return 200 if pass filename with path to resolve',
			request: { data: { fileName: 'test.json' } },
			response: { code: 200 },
			after: () => {
				const call = SlsApiUpload.prototype.resolvePath.getCall(0);

				assert(call.returnValue === 'files/');
			}
		}]);

		APITest(apiExtendedSimple('bucket-name'), [{
			before: sandbox => {
				sandbox.spy(SlsApiUpload.prototype, 'resolvePath');
			},
			description: 'should return 200 if pass filename with path empty',
			request: { data: { fileName: 'test.json' } },
			response: { code: 200 },
			after: () => {
				const call = SlsApiUpload.prototype.resolvePath.getCall(0);

				assert(call.returnValue === '');
			}
		}]);

	});

});
