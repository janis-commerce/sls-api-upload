'use strict';

const BaseFileModel = require('./base-model');
const SlsApiUpload = require('./sls-api-upload');
const SlsApiFileRelation = require('./sls-api-file-relation');
const SlsApiFileDelete = require('./sls-api-file-delete');
const SlsApiFileGet = require('./sls-api-file-get');
const SlsApiFileGetCredentials = require('./sls-api-file-get-credentials');
const SlsApiFileList = require('./sls-api-file-list');

const SlsApiUploadError = require('./sls-api-upload-error');
const SlsApiFileRelationError = require('./sls-api-file-relation-error');
const SlsApiFileDeleteError = require('./sls-api-file-delete-error');
const SlsApiFileListError = require('./sls-api-file-list-error');
const SlsApiFileGetCredentialsError = require('./sls-api-file-get-credentials-error');

module.exports = {
	BaseFileModel,
	SlsApiUpload,
	SlsApiFileRelation,
	SlsApiFileDelete,
	SlsApiFileGet,
	SlsApiFileGetCredentials,
	SlsApiFileList,
	SlsApiUploadError,
	SlsApiFileRelationError,
	SlsApiFileDeleteError,
	SlsApiFileListError,
	SlsApiFileGetCredentialsError
};
