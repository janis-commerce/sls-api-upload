'use strict';

const BaseFileModel = require('./base-model');
const SlsApiFileRelation = require('./sls-api-file-relation');
const SlsApiFileDelete = require('./sls-api-file-delete');
const SlsApiFileGetCredentials = require('./sls-api-file-get-credentials');
const SlsApiFileGet = require('./sls-api-file-get');
const SlsApiFileList = require('./sls-api-file-list');

const SlsApiFileRelationError = require('./sls-api-file-relation-error');
const SlsApiFileDeleteError = require('./sls-api-file-delete-error');
const SlsApiFileListError = require('./sls-api-file-list-error');
const SlsApiFileGetCredentialsError = require('./sls-api-file-get-credentials-error');

module.exports = {
	BaseFileModel,
	SlsApiFileRelation,
	SlsApiFileDelete,
	SlsApiFileGet,
	SlsApiFileGetCredentials,
	SlsApiFileList,
	SlsApiFileRelationError,
	SlsApiFileDeleteError,
	SlsApiFileListError,
	SlsApiFileGetCredentialsError
};
