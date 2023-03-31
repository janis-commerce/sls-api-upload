'use strict';

const assert = require('assert');

const BaseModel = require('../lib/base-model');

describe('Base Model', () => {

	it('Should have the proper default table getter', () => {
		assert.strictEqual(BaseModel.table, 'files');
	});

	it('Should return the indexes', () => {
		assert.deepStrictEqual(BaseModel.indexes, [
			{
				name: 'expiration',
				key: {
					expireAt: 1
				},
				expireAfterSeconds: 0
			}
		]);
	});

	it('Should allow to override the table', () => {

		class ModelTest extends BaseModel {
			static get table() {
				return 'entity-files';
			}
		}
		assert.strictEqual(ModelTest.table, 'entity-files');
	});

});
