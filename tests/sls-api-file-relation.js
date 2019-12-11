'use strict';

const APITest = require('@janiscommerce/api-test');
const { SlsApiFileRelation, SlsApiFileRelationError } = require('../lib/index');


describe('SlsApiRelation', () => {
	const apiExtendedSimple = ({
		entityIdField,
		bucket,
		table,
		databaseKey,
		customFieldsStruct
	} = {}) => {
		class API extends SlsApiFileRelation {
			get entityIdField() {
				return entityIdField;
			}

			get bucket() {
				return bucket;
			}

			get table() {
				return table;
			}

			get databaseKey() {
				return databaseKey;
			}

			get customFieldsStruct() {
				return customFieldsStruct;
			}
		}

		return API;
	};


	context('test validations', () => {
		APITest(apiExtendedSimple(), [{
			description: 'should return 400 if entityIdField is not defined',
			response: { code: 400, body: { message: SlsApiFileRelationError.messages.ENTITY_ID_FIELD_NOT_DEFINED } }
		}]);

		APITest(apiExtendedSimple({ entityIdField: 123 }), [{
			description: 'should return 400 if entityIdField is not a string',
			response: { code: 400, body: { message: SlsApiFileRelationError.messages.ENTITY_ID_FIELD_NOT_STRING } }
		}]);

		APITest(apiExtendedSimple({
			entityIdField: 'test'
		}), [{
			description: 'should return 400 if bucket is not defined',
			response: { code: 400, body: { message: SlsApiFileRelationError.messages.BUCKET_NOT_DEFINED } }
		}]);

		APITest(apiExtendedSimple({
			entityIdField: 'test',
			bucket: 123
		}), [{
			description: 'should return 400 if bucket is not a string',
			response: { code: 400, body: { message: SlsApiFileRelationError.messages.BUCKET_NOT_STRING } }
		}]);

		APITest(apiExtendedSimple({
			entityIdField: 'test',
			bucket: 'test'
		}), [{
			description: 'should return 400 if table is not a string',
			response: { code: 400, body: { message: SlsApiFileRelationError.messages.TABLE_NOT_DEFINED } }
		}]);

		APITest(apiExtendedSimple({
			entityIdField: 'test',
			bucket: 'test',
			table: 132
		}), [{
			description: 'should return 400 if table is not a string',
			response: { code: 400, body: { message: SlsApiFileRelationError.messages.TABLE_NOT_STRING } }
		}]);

		APITest(apiExtendedSimple({
			entityIdField: 'test',
			bucket: 'test',
			table: 'test',
			databaseKey: 123
		}), [{
			description: 'should return 400 if databaseKey is not a string',
			response: { code: 400, body: { message: SlsApiFileRelationError.messages.DATABASEKEY_NOT_STRING } }
		}]);

		APITest(apiExtendedSimple({
			entityIdField: 'test',
			bucket: 'test',
			table: 'test',
			databaseKey: 'database',
			customFieldsStruct: []
		}), [{
			description: 'should return 400 if customFieldsStruct is not an array of strings',
			response: { code: 400, body: { message: SlsApiFileRelationError.messages.CUSTOM_FIELDS_STRUCT_NOT_OBJECT } }
		}]);

		APITest(apiExtendedSimple({
			entityIdField: 'test',
			bucket: 'test',
			table: 'test'
		}), [{
			description: 'should return 400 if not pass body',
			request: {},
			response: { code: 400 }
		}]);

		APITest(apiExtendedSimple({
			entityIdField: 'test',
			bucket: 'test',
			table: 'test'
		}), [{
			description: 'should return 400 if not pass fileName in body',
			request: { data: {} },
			response: { code: 400 }
		}]);

		APITest(apiExtendedSimple({
			entityIdField: 'test',
			bucket: 'test',
			table: 'test'
		}), [{
			description: 'should return 400 if not pass filename string',
			request: { data: { fileName: 132 } },
			response: { code: 400 }
		}]);

		APITest(apiExtendedSimple({
			entityIdField: 'test',
			bucket: 'test',
			table: 'test'
		}), [{
			description: 'should return 400 if not pass fileSource in body',
			request: { data: { fileName: 'test.js' } },
			response: { code: 400 }
		}]);

		APITest(apiExtendedSimple({
			entityIdField: 'test',
			bucket: 'test',
			table: 'test'
		}), [{
			description: 'should return 400 if not pass fileSource string',
			request: { data: { fileName: 'test.js', fileSource: 132 } },
			response: { code: 400 }
		}]);

		APITest(apiExtendedSimple({
			entityIdField: 'test',
			bucket: 'test',
			table: 'test'
		}), [{
			description: 'should return 400 if not pass custom fields in body',
			request: { data: { fileName: 'test.js', fileSource: 'files/test.js', type: 'asdasd' } },
			response: { code: 400 }
		}]);

		APITest(apiExtendedSimple({
			entityIdField: 'test',
			bucket: 'test',
			table: 'test',
			customFieldsStruct: { type: 'string' }
		}), [{
			description: 'should return 400 if pass incorrect custom fields in body',
			request: { data: { fileName: 'test.js', fileSource: 'files/test.js', type: 132 } },
			response: { code: 400 }
		}]);
	});

	context('test process', () => {
		APITest(apiExtendedSimple({
			entityIdField: 'test',
			bucket: 'test',
			table: 'test',
			customFieldsStruct: { type: 'string' }
		}), [{
			description: 'should return 400 if pass incorrect custom fields in body',
			request: { data: { fileName: 'test.js', fileSource: 'files/test.js', type: 132 } },
			response: { code: 400 }
		}]);
	});
});
