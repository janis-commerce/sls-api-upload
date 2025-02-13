'use strict';

const { ApiListData, FilterMappers: { dateMapper } } = require('@janiscommerce/api-list');

const SlsApiFileListError = require('./sls-api-file-list-error');

const { findSignedFile, getSignedFiles, formatUrlForOwnBucket } = require('./helper/format-url');

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

	async validate() {

		await super.validate();

		if(this.postValidateHook) {
			try {
				await this.postValidateHook();
			} catch(error) {
				throw new SlsApiFileListError(error);
			}
		}
	}

	async formatRows(files) {

		if(this.bucket)
			return Promise.all(files.map(file => this.formatFileForOwnBucket(file)));

		const paths = files.map(file => file.path).filter(Boolean);

		const signedFiles = await getSignedFiles(this.session.clientCode, paths);

		return Promise.all(files.map(file => this.formatFileForStorage(file, signedFiles)));
	}

	async formatFileForStorage({ path, ...file }, signedFiles) {

		const fileDataFormatted = this.formatFileData ? await this.formatFileData(file) : file;

		const url = findSignedFile(signedFiles, path);

		return { ...fileDataFormatted, url };
	}


	async formatFileForOwnBucket({ path, ...file }) {

		const fileDataFormatted = this.formatFileData ? await this.formatFileData(file) : file;

		if(!this.shouldAddUrl)
			return fileDataFormatted;

		const url = await this.formatUrl(path, file.name);

		return { ...fileDataFormatted, url };
	}

	formatUrl(path, name) {
		return formatUrlForOwnBucket(path, name, this.bucket, SlsApiFileListError);
	}
};
