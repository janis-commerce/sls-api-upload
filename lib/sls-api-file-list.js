'use strict';

const S3 = require('@janiscommerce/s3');
const { ApiListData } = require('@janiscommerce/api-list');
const SlsApiFileListError = require('./sls-api-file-list-error');

module.exports = class FileListApi extends ApiListData {

	get sortableFields() {
		return [
			'id',
			'name',
			'dateCreated'
		];
	}

	get availableFilters() {
		return [
			'id',
			'name',
			{
				name: 'dateCreated',
				valueMapper: date => new Date(date)
			}
		];
	}

	formatRows(files) {

		return Promise.all(files.map(async ({ path, ...file }) => {

			if(!this.shouldAddUrl(file))
				return file;

			this.validateBucket();

			let url = null;

			try {
				url = await S3.getSignedUrl('getObject', {
					Bucket: this.bucket,
					Key: path,
					ResponseContentDisposition: `attachment; filename="${file.name}"`
				});
			} catch(error) {
				if(error.statusCode !== 404)
					throw new SlsApiFileListError(error);
			}

			return { ...file, url };
		}));
	}

	shouldAddUrl(file) {
		return file.type === 'image';
	}

	validateBucket() {

		if(this.isValidBucket)
			return;

		if(!this.bucket)
			throw new SlsApiFileListError(SlsApiFileListError.messages.BUCKET_NOT_DEFINED);

		if(typeof this.bucket !== 'string')
			throw new SlsApiFileListError(SlsApiFileListError.messages.BUCKET_NOT_STRING);

		this.isValidBucket = true;
	}
};
