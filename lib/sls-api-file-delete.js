'use strict';

const { API } = require('@janiscommerce/api');
const Model = require('@janiscommerce/model');
// const S3 = require('@janiscommerce/s3');
// const SlsApiFileRelationError = require('./sls-api-file-relation-error');

class SlsApiFileDelete extends API {

	/**
	 * Build a model class with databaseKey and table passed in params
	 * @param {string} table
	 * @param {string} dataBaseKey
	 */
	static buildModel(table, dataBaseKey) {
		class FileModel extends Model {
			get databaseKey() {
				return dataBaseKey;
			}

			static get table() {
				return table;
			}
		}

		return FileModel;
	}


	/**
	 * Database table where to save the record
	 */
	get table() {
		return 'files';
	}


	/**
	 * Database name where to save the record
	 */
	get databaseKey() {
		return undefined;
	}

	async process() {
		const [entityId, fileID] = this.pathParameters;

		console.log(entityId, fileID);

		this
			.setCode(201)
			.setBody({});
	}

}


module.exports = SlsApiFileDelete;
