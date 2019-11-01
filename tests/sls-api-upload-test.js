'use strict';

const assert = require('assert');

/* const AWS = require('aws-sdk-mock');

const sandbox = require('sinon').createSandbox(); */

const { SlsApiUpload, SlsApiUploadError } = require('../lib/index');


/* const mockS3 = () => {
	AWS.mock('S3', 'createPresignedPost', (params, callback) => {
		callback(null, 'successfully put item in database');
	});
}; */

const apiExtended = (bucket, path) => {
	class API extends SlsApiUpload {
		get bucket() {
			return bucket;
		}

		get path() {
			return path;
		}
	}

	return new API();
};

describe('SlsApiUpload', () => {
	it('should error if not define bucket', () => {
		const instance = apiExtended();
		assert.throws(() => {
			instance.getPresignedUrlToUpload('file.txt');
		}, {
			message: 'BUCKET not defined',
			code: SlsApiUploadError.codes.BUCKET_NOT_DEFINED
		});
	});

	it('should error if not define path', () => {
		const instance = apiExtended('bucket-name');

		assert.throws(() => {
			instance.getPresignedUrlToUpload('file.txt');
		}, {
			message: 'PATH not defined',
			code: SlsApiUploadError.codes.PATH_NOT_DEFINED
		});
	});

	it('should error if pass fileName', () => {
		const instance = apiExtended('bucket-name', 'files/images');

		assert.throws(() => {
			instance.getPresignedUrlToUpload();
		}, {
			message: 'fileName not defined',
			code: SlsApiUploadError.codes.FILE_NAME_NOT_DEFINED
		});
	});
});
