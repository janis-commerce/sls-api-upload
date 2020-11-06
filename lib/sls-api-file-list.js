'use strict';

const S3 = require('@janiscommerce/s3');
const {
	ApiListData,
	FilterMappers: {
		dateMapper
	}
} = require('@janiscommerce/api-list');
const SlsApiFileListError = require('./sls-api-file-list-error');

module.exports = class FileListApi extends ApiListData {

	get sortableFields() {

		if(!Array.isArray(this.customSortableFields))
			throw new SlsApiFileListError(SlsApiFileListError.messages.INVALID_SORTABLE_FIELDS);

		return [
			'id',
			'name',
			'dateCreated',
			...this.customSortableFields
		];
	}

	/**
	 * Custom Sortable Fields
	 * @returns {Array<String>}
	 */
	get customSortableFields() {
		return [];
	}

	get availableFilters() {

		if(!Array.isArray(this.customAvailableFilters))
			throw new SlsApiFileListError(SlsApiFileListError.messages.INVALID_FILTERS_FIELDS);

		return [
			'id',
			'name',
			{
				name: 'dateCreated',
				valueMapper: dateMapper
			},
			...this.customAvailableFilters
		];
	}

	/**
	 * Custom AvailableFilters
	 * @returns {Array<string|object>} filters type object
	 */
	get customAvailableFilters() {
		return [];
	}

	get shouldAddUrl() {
		return false;
	}

	async validate() {

		await super.validate();

		if(this.shouldAddUrl)
			this.validateBucket();

		if(this.postValidateHook) {
			try {
				await this.postValidateHook();
			} catch(error) {
				throw new SlsApiFileListError(error);
			}
		}
	}

	validateBucket() {

		if(!this.bucket)
			throw new SlsApiFileListError(SlsApiFileListError.messages.BUCKET_NOT_DEFINED);

		if(typeof this.bucket !== 'string')
			throw new SlsApiFileListError(SlsApiFileListError.messages.BUCKET_NOT_STRING);
	}

	formatRows(files) {
		return Promise.all(files.map(file => this.formatFile(file)));
	}

	async formatFile({ path, ...file }) {

		const fileDataFormatted = this.formatFileData ? await this.formatFileData(file) : file;

		if(!this.shouldAddUrl)
			return fileDataFormatted;

		const url = await this.formatUrl(path, file.name);

		return { ...fileDataFormatted, url };
	}

	async formatUrl(path, name) {

		try {

			const url = await S3.getSignedUrl('getObject', {
				Bucket: this.bucket,
				Key: path,
				ResponseContentDisposition: `attachment; filename="${name}"`
			});

			return url;

		} catch(error) {

			if(error.statusCode !== 404)
				throw new SlsApiFileListError(error);

			return null;
		}
	}
};
