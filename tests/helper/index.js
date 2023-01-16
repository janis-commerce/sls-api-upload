'use strict';

const assert = require('assert');

const Validators = require('../../lib/helper/is-empty');

describe('Validators Test', () => {

	context('Is Object Test', () => {
		[
			['isObject', [null], false],
			['isObject', ['test'], false],
			['isObject', [[]], false],
			['isObject', [{}], true]
		].forEach(([validator, args, testValue]) => {
			it(`Should use validator ${validator} for ${args} and return ${String(testValue)}`, () => {
				assert.deepStrictEqual(Validators[validator](...args), testValue);
			});
		});
	});

	context('Is Empty Test', () => {
		[
			['isEmpty', [{}], true],
			['isEmpty', [''], true],
			['isEmpty', [0], false],
			['isEmpty', [[]], true]
		].forEach(([validator, args, testValue]) => {
			it(`Should use validator ${validator} for ${args} and return ${String(testValue)}`, () => {
				assert.deepStrictEqual(Validators[validator](...args), testValue);
			});
		});
	});

});
