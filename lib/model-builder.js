'use strict';

const Model = require('@janiscommerce/model');

class ModelBuilder {

	/**
	 * Build a model class with databaseKey and table passed in params
	 * @param {string} table
	 * @param {string} dataBaseKey
	 */
	static build(table, dataBaseKey, entityField) {
		class FileModel extends Model {
			get databaseKey() {
				return dataBaseKey;
			}

			static get fields() {
				return {
					id: true,
					path: true,
					[entityField]: true
				};
			}

			static get table() {
				return table;
			}
		}

		return FileModel;
	}
}

module.exports = ModelBuilder;
