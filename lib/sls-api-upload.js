'use strict';

const { API } = require('@janiscommerce/api');
const uuid = require('uuid/v4');
const mime = require('mime');
/* const fs = require('fs');
const request = require('request'); */
const S3 = require('./s3');

const SlsApiUploadError = require('./sls-api-upload-error');

class SlsApiUpload extends API {
	get struct() {
		return {
			fileName: 'string'
		};
	}

	/**
	 * Path where file is saved
	 */
	get path() {
		return '';
	}

	/**
	 * Availables file types
	 */
	get availableTypes() {
		return [];
	}

	/**
	 * Expiration time for upload file in s3
	 */
	get expiration() {
		return 60; // seconds
	}

	/**
	 * File size Range
	 */
	get lengthRange() {
		return [1, 10000000]; // 1Byte - 10MB
	}

	/**
	 * Resolve path passed for interpolate key
	 */
	resolvePath() {
		let path = this.path.trim();

		if(path.startsWith('/'))
			path = path.slice(1);

		if(path && !path.endsWith('/'))
			path = `${path}/`;

		return path;
	}

	validate() {
		const { fileName } = this.data;

		if(!this.bucket)
			throw new SlsApiUploadError(SlsApiUploadError.messages.BUCKET_NOT_DEFINED);

		if(typeof this.bucket !== 'string')
			throw new SlsApiUploadError(SlsApiUploadError.messages.BUCKET_NOT_STRING);

		if(typeof this.path !== 'string')
			throw new SlsApiUploadError(SlsApiUploadError.messages.PATH_NOT_STRING);

		this.fileType = mime.getType(fileName);

		if(!this.fileType)
			throw new SlsApiUploadError(SlsApiUploadError.messages.FILE_TYPE_NOT_RECOGNIZED);

		if(!Array.isArray(this.availableTypes))
			throw new SlsApiUploadError(SlsApiUploadError.messages.AVAILABLE_TYPES_NOT_ARRAY);


		if(this.availableTypes.length) {
			const typeAvailable = this.availableTypes.find(type => type === this.fileType);

			if(!typeAvailable)
				throw new SlsApiUploadError(SlsApiUploadError.messages.FILE_TYPE_NOT_AVAILABLE);
		}
	}

	async process() {
		const id = uuid();

		const path = this.resolvePath();

		const extension = mime.getExtension(this.fileType);

		const key = `${path}${id}.${extension}`;

		const params = {
			Bucket: this.bucket,
			Expires: this.expiration,
			Conditions: [['content-length-range', ...this.lengthRange]],
			Fields: { 'Content-Type': this.fileType, key }
		};

		const response = await S3.createPresignedPost(params);

		this
			.setCode(200)
			.setBody(response);
	}
}


module.exports = SlsApiUpload;
