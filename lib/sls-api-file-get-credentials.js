'use strict';

const logger = require('lllog')();
const { API } = require('@janiscommerce/api');
const { struct } = require('@janiscommerce/superstruct');
const { Invoker } = require('@janiscommerce/lambda');

const SlsApiFileGetCredentialsError = require('./sls-api-file-get-credentials-error');
const { isEmpty } = require('./helper/is-empty');

const credentialsStruct = struct.partial({
	expiration: 'positive?',
	fileNames: 'array&!empty'
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

		const requestData = {
			...this.data,
			service: this.session.serviceName,
			entity: this.entity
		};

		const { payload, statusCode } = await Invoker.serviceSafeClientCall('storage', 'GetCredentials', this.session.clientCode, requestData);

		if(statusCode >= 400) {
			// console.log('entro aca!');
			logger.info('payload', JSON.stringify(payload, null, 4));
			throw new Error('Fail getting credentials');
		}

		if(isEmpty(payload))
			return {};

		return payload;
	}

};
