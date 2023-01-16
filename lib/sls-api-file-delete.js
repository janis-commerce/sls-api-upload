'use strict';

const { API } = require('@janiscommerce/api');
const { Invoker } = require('@janiscommerce/lambda');

const SlsApiFileDeleteError = require('./sls-api-file-delete-error');
const Model = require('./base-model');

module.exports = class SlsApiFileDelete extends API {

	/**
	 * It returns the Model.
	 * @returns The model property is being returned.
	 */
	get model() {
		return Model;
	}

	async validate() {

		if(!this.entityIdField)
			throw new SlsApiFileDeleteError(SlsApiFileDeleteError.messages.ENTITY_ID_FIELD_NOT_DEFINED);

		if(typeof this.entityIdField !== 'string')
			throw new SlsApiFileDeleteError(SlsApiFileDeleteError.messages.ENTITY_ID_FIELD_NOT_STRING);

		if(this.postValidateHook) {
			try {
				await this.postValidateHook();
			} catch(error) {
				throw new SlsApiFileDeleteError(error);
			}
		}
	}


	async process() {

		const [entityId, fileId] = this.pathParameters;

		const modelInstance = this.session.getSessionInstance(this.model);

		const filtersParams = { filters: { [this.entityIdField]: entityId, id: fileId } };

		const [record] = await modelInstance.get(filtersParams);

		if(!record) {
			this.setCode(404);
			throw new SlsApiFileDeleteError(SlsApiFileDeleteError.messages.FILE_RECORD_NOT_FOUND);
		}

		await modelInstance.remove({ id: fileId });

		await this.deleteFile(record.path);

		if(this.postDeleteHook)
			return this.postDeleteHook(record);
	}

	async deleteFile(path) {
		return Invoker.serviceSafeClientCall('storage', 'DeleteFiles', this.session.clientCode, { paths: [path] });
	}
};
