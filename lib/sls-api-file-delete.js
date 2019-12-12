'use strict';

const { API } = require('@janiscommerce/api');
const Model = require('@janiscommerce/model');
const SlsApiFileDeleteError = require('./sls-api-file-delete-error');
// const S3 = require('@janiscommerce/s3');

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

	async validate() {
		if(!this.entityIdField)
			throw new SlsApiFileDeleteError(SlsApiFileDeleteError.messages.ENTITY_ID_FIELD_NOT_DEFINED);

		if(typeof this.entityIdField !== 'string')
			throw new SlsApiFileDeleteError(SlsApiFileDeleteError.messages.ENTITY_ID_FIELD_NOT_STRING);

		if(!this.bucket)
			throw new SlsApiFileDeleteError(SlsApiFileDeleteError.messages.BUCKET_NOT_DEFINED);

		if(typeof this.bucket !== 'string')
			throw new SlsApiFileDeleteError(SlsApiFileDeleteError.messages.BUCKET_NOT_STRING);

		if(!this.table)
			throw new SlsApiFileDeleteError(SlsApiFileDeleteError.messages.TABLE_NOT_DEFINED);

		if(typeof this.table !== 'string')
			throw new SlsApiFileDeleteError(SlsApiFileDeleteError.messages.TABLE_NOT_STRING);

		if(this.databaseKey && typeof this.databaseKey !== 'string')
			throw new SlsApiFileDeleteError(SlsApiFileDeleteError.messages.DATABASEKEY_NOT_STRING);


		const [entityId, fileId] = this.pathParameters;

		const model = this.constructor.buildModel(this.table, this.databaseKey);

		this.modelInstance = this.session.getSessionInstance(model);

		const [record] = await this.modelInstance.get({ filters: { [this.entityIdField]: entityId, id: fileId } });

		if(!record) {
			this.setCode(404);
			throw new SlsApiFileDeleteError(SlsApiFileDeleteError.messages.FILE_RECORD_NOT_FOUND);
		}
	}


	async process() {
		const [entityId, fileId] = this.pathParameters;

		const id = await this.modelInstance.remove({ filters: { [this.entityIdField]: entityId, id: fileId } });

		this.setBody({ id });
	}

}


module.exports = SlsApiFileDelete;
