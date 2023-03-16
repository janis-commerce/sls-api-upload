'use strict';

const { API } = require('@janiscommerce/api');
const { Invoker } = require('@janiscommerce/lambda');
const { struct } = require('@janiscommerce/superstruct');

const SlsApiFileRelationError = require('./sls-api-file-relation-error');

const EXPIRATION_FILE_OPTIONS = {
	oneDay: 1,
	tenDays: 10,
	month: 30,
	never: 'never'
};

const DEFAULT_EXPIRATION_FILE = 'tenDays';

module.exports = class SlsApiFileRelation extends API {

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
	 * Allows you to set a custom expiration for the file
	 * Possible values: 'oneDay'|'tenDays'|'month'|'never'
	 */
	get fileExpiration() {
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
			expiration: struct.optional(struct.enum(Object.keys(EXPIRATION_FILE_OPTIONS))),
			...this.customFieldsStruct
		};
	}

	async validate() {

		if(!this.model)
			throw new SlsApiFileRelationError(SlsApiFileRelationError.messages.MODEL_NOT_DEFINED);

		if(typeof this.model !== 'function')
			throw new SlsApiFileRelationError(SlsApiFileRelationError.messages.MODEL_IS_NOT_MODEL_CLASS);

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

		const { fileName: name, fileSource: path, expiration, ...additionalData } = this.data;

		const { ContentLength, ContentType } = await this.getFileInfo(path);

		const expirationDate = this.getExpirationDate(expiration);

		const additionalDataFormatted = this.format ? await this.format(additionalData) : additionalData;

		return {
			[this.entityIdField]: entityId,
			name,
			path,
			mimeType: ContentType || null,
			type: this.constructor.getSimplifiedType(ContentType),
			size: ContentLength || null,
			...expirationDate && { expireAt: expirationDate },
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

	getExpirationDate(expiration) {

		// eslint-disable-next-line max-len
		const expirationOption = EXPIRATION_FILE_OPTIONS[this.fileExpiration] || EXPIRATION_FILE_OPTIONS[expiration] || EXPIRATION_FILE_OPTIONS[DEFAULT_EXPIRATION_FILE];

		if(expirationOption === EXPIRATION_FILE_OPTIONS.never)
			return;

		const expireDate = new Date();
		expireDate.setDate(expireDate.getDate() + expirationOption);

		return expireDate;

	}
};
