'use strict';

const BaseFileModel = require('./base-model');
const SlsApiFileRelation = require('./sls-api-file-relation');
const SlsApiFileDelete = require('./sls-api-file-delete');
const SlsApiFileGet = require('./sls-api-file-get');
const SlsApiFileList = require('./sls-api-file-list');

const SlsApiFileRelationError = require('./sls-api-file-relation-error');
const SlsApiFileDeleteError = require('./sls-api-file-delete-error');
const SlsApiFileListError = require('./sls-api-file-list-error');

module.exports = {
	BaseFileModel,
	SlsApiFileRelation,
	SlsApiFileDelete,
	SlsApiFileGet,
	SlsApiFileList,
	SlsApiFileRelationError,
	SlsApiFileDeleteError,
	SlsApiFileListError
};
