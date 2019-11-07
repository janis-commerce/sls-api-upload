'use strict';

const assert = require('assert');

const sandbox = require('sinon').createSandbox();

const s3Wrapper = require('../lib/s3/s3Wrapper');

const S3 = require('../lib/s3');


describe('S3 Wrapper Test', () => {

	beforeEach(() => {
		this.s3 = sandbox.stub(s3Wrapper, 'createPresignedPost').resolves({
			url: 'URL',
			fields: {}
		});
	});

	afterEach(() => {
		sandbox.restore();
	});

	it('Should throw an error when S3 createPresignedPost object return an error', async () => {
		this.s3.callsFake((params, callback) => {
			callback(new Error('ERROR'), null);
		});

		await assert.rejects(S3.createPresignedPost({}), {
			message: 'ERROR'
		});
	});

	it('Should return the S3 createPresignedPost return object', async () => {
		const response = {
			url: 'URL',
			fields: {}
		};

		this.s3.callsFake((params, callback) => {
			callback(null, response);
		});

		const presignedPost = await S3.createPresignedPost({});

		assert.deepEqual(presignedPost, {
			url: 'URL',
			fields: {}
		});
	});
});
