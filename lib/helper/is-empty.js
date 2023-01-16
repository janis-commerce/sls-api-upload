'use strict';

/**
 * Validates if is object
 * @param param
 * @returns {boolean}
 */
const isObject = param => !!(param && typeof param === 'object' && !Array.isArray(param));

/**
 * Validates if is empty
 * @param param
 * @returns {boolean}
 */
const isEmpty = param => !!(
	param === null ||
	(typeof param === 'string' && !param) ||
	(typeof param === 'number' && Number.isNaN(Number(param))) ||
	(Array.isArray(param) && !param.length) ||
	(isObject(param) && !Object.keys(param).length && !(param instanceof Date))
);

module.exports = {
	isObject,
	isEmpty
};
