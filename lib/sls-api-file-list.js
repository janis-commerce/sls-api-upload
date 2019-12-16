'use strict';

const { ApiListData } = require('@janiscommerce/api-list');

class FileListApi extends ApiListData {
	/* get fieldsToSelect() {
		return [
			'id',
			'path',
			'size',
			'name',
			'type',
			'dateCreated'
		];
	} */

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
		return files.map(({ path, ...file }) => file);
	}

}

module.exports = FileListApi;
