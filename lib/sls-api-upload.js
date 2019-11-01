'use strict';

const uuid = require('uuid/v4');
const mime = require('mime');
const S3 = require('./s3');

const SlsApiUploadError = require('./sls-api-upload-error');

class SlsApiUpload {
	get expiration() {
		return 60;
	}

	get lengthRange() {
		return [100, 10000000];
	}

	validate() {
		if(!this.bucket)
			throw new SlsApiUploadError('BUCKET not defined', SlsApiUploadError.codes.BUCKET_NOT_DEFINED);

		if(!this.path)
			throw new SlsApiUploadError('PATH not defined', SlsApiUploadError.codes.PATH_NOT_DEFINED);
	}

	getPresignedUrlToUpload(fileName) {
		this.validate();

		if(!fileName)
			throw new SlsApiUploadError('fileName not defined', SlsApiUploadError.codes.FILE_NAME_NOT_DEFINED);

		const id = uuid();

		const type = mime.getType(fileName);
		const extension = mime.getExtension(type);

		const key = `${this.path}/${id}.${extension}`;

		const params = {
			Bucket: this.bucket,
			Expires: this.expiration,
			Conditions: [['content-length-range', ...this.lengthRange]],
			Fields: { 'Content-Type': type, key }
		};

		return S3.createPresignedPost(params);
	}
}


module.exports = SlsApiUpload;
