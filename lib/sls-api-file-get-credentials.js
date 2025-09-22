'use strict';

const { API } = require('@janiscommerce/api');
const { struct } = require('@janiscommerce/superstruct');
const { Invoker } = require('@janiscommerce/lambda');
const logger = require('lllog')();

const SlsApiFileGetCredentialsError = require('./sls-api-file-get-credentials-error');
const { isEmpty } = require('./helper/is-empty');

const EXPIRATION_FILE_OPTIONS = ['oneDay', 'tenDays', 'month', 'never'];

const credentialsStruct = struct.partial({
	credentialExpiration: 'positive?',
	fileExpiration: struct.optional(struct.enum(EXPIRATION_FILE_OPTIONS)),
	fileNames: struct.dynamic((value, parent) => struct(parent.fileName ? struct.optional('array&!empty') : 'array&!empty')),
	fileName: struct.dynamic((value, parent) => struct(parent.fileNames ? struct.optional('string&!empty') : 'string&!empty'))
});

module.exports = class SlsApiFileGetCredentials extends API {

	get struct() {
		return credentialsStruct;
	}

	async validate() {

		if(!this.entity)
			throw new SlsApiFileGetCredentialsError(SlsApiFileGetCredentialsError.messages.ENTITY_NOT_DEFINED);

		if(typeof this.entity !== 'string')
			throw new SlsApiFileGetCredentialsError(SlsApiFileGetCredentialsError.messages.ENTITY_NOT_STRING);
	}

	async process() {

		try {

			const response = await this.getCredentials(this.session.clientCode, this.data);

			this.setBody(response);

		} catch(error) {
			throw new SlsApiFileGetCredentialsError(error);
		}
	}

	/**
	 * It gets the file info for the given path
	 * @param path - The path to the file you want to get the info for.
	 * @returns The file info for the path.
	 */
	async getCredentials() {

		const fileExpiration = this.fileExpiration || this.data.fileExpiration;

		const requestData = {
			...this.data,
			...fileExpiration && { fileExpiration },
			serviceName: process.env.JANIS_SERVICE_NAME,
			entity: this.entity
		};

		const {
			statusCode,
			functionError,
			payload
		} = await Invoker.serviceSafeClientCall('storage', 'GetCredentials', this.session.clientCode, requestData);

		if(statusCode >= 400 || functionError) {
			logger.error(`Fail getting credentials: ${payload?.trace?.join('\n') || payload?.errorMessage || functionError || statusCode}`);
			throw new Error(`Fail getting credentials${payload?.errorMessage ? `: ${payload.errorMessage}` : ''}`);
		}

		if(isEmpty(payload))
			return {};

		return payload;
	}

};
