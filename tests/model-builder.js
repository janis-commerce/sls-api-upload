'use strict';

const assert = require('assert');
const BaseModel = require('../lib/base-model');

describe('Base Model', () => {

	it('Should have the proper default getters', () => {
		assert.strictEqual(BaseModel.table, 'files');

		assert.deepStrictEqual(BaseModel.fields, {
			id: true,
			path: true,
			size: true,
			name: true,
			type: true,
			dateCreated: true
		});
	});

	it('Should allow to override the getters', () => {

		class ModelTest extends BaseModel {
			static get table() {
				return 'entity_files';
			}

			static get fields() {
				return {
					...super.fields,
					test: true
				};
			}
		}
		assert.strictEqual(ModelTest.table, 'entity_files');

		assert.deepStrictEqual(ModelTest.fields, {
			id: true,
			path: true,
			size: true,
			name: true,
			type: true,
			dateCreated: true,
			test: true
		});
	});

});
