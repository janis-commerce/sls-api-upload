'use strict';

const assert = require('assert');
const ModelBuilder = require('../lib/model-builder');

describe('test model builder', () => {

	it('test build method', () => {
		const ModelBuilded = ModelBuilder.build('table_test', 'database_test', 'test');
		const modelInstance = new ModelBuilded();

		assert.strictEqual(ModelBuilded.table, 'table_test');
		assert.strictEqual(modelInstance.databaseKey, 'database_test');
		assert.deepStrictEqual(ModelBuilded.fields, {
			id: true,
			test: true
		});
	});

});
