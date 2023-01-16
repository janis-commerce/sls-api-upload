'use strict';

const { ApiListData, FilterMappers: { dateMapper } } = require('@janiscommerce/api-list');

const SlsApiFileListError = require('./sls-api-file-list-error');
const { findSignedFile, getSignedFiles } = require('./helper/format-url');

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

		const paths = files.map(file => file.path).filter(Boolean);

		const signedFiles = await getSignedFiles(this.session.clientCode, paths);

		return Promise.all(files.map(file => this.formatFile(file, signedFiles)));
	}

	async formatFile({ path, ...file }, signedFiles) {

		const fileDataFormatted = this.formatFileData ? await this.formatFileData(file) : file;

		const url = findSignedFile(signedFiles, path);

		return { ...fileDataFormatted, url };
	}
};
