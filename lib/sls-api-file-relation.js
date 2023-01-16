'use strict';

const { API } = require('@janiscommerce/api');
const { Invoker } = require('@janiscommerce/lambda');

const SlsApiFileRelationError = require('./sls-api-file-relation-error');
const Model = require('./base-model');

module.exports = class SlsApiFileRelation extends API {

	/**
	 * It returns the Model.
	 * @returns The model property is being returned.
	 */
	get model() {
		return Model;
	}

	/**
	 * Method for take a simplified type for save type field
	 * @param {string} mimeType
	 * @returns {string}
	 */
	static getSimplifiedType(mimeType) {
		switch(true) {
			case /image/.test(mimeType):
				return 'image';

			case /video/.test(mimeType):
				return 'video';

			case /audio/.test(mimeType):
				return 'audio';

			case /msword|wordprocessingml\.document/.test(mimeType):
				return 'doc';

			case /ms-excel|spreadsheet|csv/.test(mimeType):
				return 'sheet';

			default:
				return 'other';
		}
	}

	/**
	 * Custom fields Struct validation
	 */
	get customFieldsStruct() {
		return undefined;
	}

	/**
	 * It returns an object with the properties fileName and fileSource.
	 * @returns The struct() method is being returned.
	 */
	get struct() {
		return {
			fileName: 'string',
			fileSource: 'string',
			...this.customFieldsStruct
		};
	}

	async validate() {

		if(!this.entityIdField)
			throw new SlsApiFileRelationError(SlsApiFileRelationError.messages.ENTITY_ID_FIELD_NOT_DEFINED);

		if(typeof this.entityIdField !== 'string')
			throw new SlsApiFileRelationError(SlsApiFileRelationError.messages.ENTITY_ID_FIELD_NOT_STRING);

		if(this.postValidateHook) {
			try {
				await this.postValidateHook();
			} catch(error) {
				throw new SlsApiFileRelationError(error);
			}
		}
	}

	/**
	 * It takes the file data, formats it, saves it to the database, and then runs a post save hook if one
	 * is defined
	 */
	async process() {

		const modelInstance = this.session.getSessionInstance(this.model);

		try {

			const dataFormatted = await this.formatFileData();

			const id = await modelInstance.insert(dataFormatted);

			if(this.postSaveHook)
				await this.postSaveHook(id, dataFormatted);

			this.setCode(201).setBody({ id });

		} catch(error) {
			throw new SlsApiFileRelationError(error);
		}
	}

	/**
	 * It formats the file data to be stored in the database
	 * @returns The file data is being returned.
	 */
	async formatFileData() {

		const [entityId] = this.pathParameters;

		const { fileName: name, fileSource: path, ...additionalData } = this.data;

		const { ContentLength, ContentType } = await this.getFileInfo(path);

		const additionalDataFormatted = this.format ? await this.format(additionalData) : additionalData;

		return {
			[this.entityIdField]: entityId,
			name,
			path,
			mimeType: ContentType || null,
			type: this.constructor.getSimplifiedType(ContentType),
			size: ContentLength || null,
			...additionalDataFormatted
		};
	}

	/**
	 * It gets the file info for the given path
	 * @param path - The path to the file you want to get the info for.
	 * @returns The file info for the path.
	 */
	async getFileInfo(path) {

		const { payload, statusCode } = await Invoker.serviceSafeClientCall('storage', 'GetFilesInfo', this.session.clientCode, { paths: [path] });

		if(statusCode !== 200 || !payload)
			return {};

		return payload[path];
	}
};
