'use strict';

const { API } = require('@janiscommerce/api');
const { v4: uuid } = require('uuid');
const mime = require('mime');
const S3 = require('@janiscommerce/s3');
const SlsApiUploadError = require('./sls-api-upload-error');

module.exports = class SlsApiUpload extends API {

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
	 * Expiration time for upload file to S3 in seconds
	 */
	get expiration() {
		return 60;
	}

	/**
	 * File size range in bytes
	 */
	get sizeRange() {
		return [1, 10 * 1024 * 1024]; // 1Byte - 10MB
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

	async validate() {
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

		if(typeof this.expiration !== 'number')
			throw new SlsApiUploadError(SlsApiUploadError.messages.EXPIRATION_NOT_NUMBER);

		if(!Array.isArray(this.sizeRange))
			throw new SlsApiUploadError(SlsApiUploadError.messages.LENGTH_RANGE_NOT_ARRAY);

		const [minSize, maxSize] = this.sizeRange;

		if(typeof minSize !== 'number' || typeof maxSize !== 'number')
			throw new SlsApiUploadError(SlsApiUploadError.messages.LENGTH_RANGE_ITEM_NOT_NUMBER);

		if(this.postValidateHook) {
			try {
				await this.postValidateHook();
			} catch(error) {
				throw new SlsApiUploadError(error);
			}
		}
	}

	async process() {

		const id = uuid();

		const path = this.resolvePath();

		const extension = mime.getExtension(this.fileType);

		const key = `${path}${id}.${extension}`;

		const [minSize, maxSize] = this.sizeRange;

		const params = {
			Bucket: this.bucket,
			Expires: this.expiration,
			Conditions: [['content-length-range', minSize, maxSize]],
			Fields: { 'Content-Type': this.fileType, key }
		};

		try {
			const response = await S3.createPresignedPost(params);

			this.setBody(response);
		} catch(error) {
			throw new SlsApiUploadError(error);
		}
	}

};
