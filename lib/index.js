'use strict';

const BaseFileModel = require('./base-model');
const SlsApiUpload = require('./sls-api-upload');
const SlsApiFileRelation = require('./sls-api-file-relation');
const SlsApiFileDelete = require('./sls-api-file-delete');
const SlsApiFileGet = require('./sls-api-file-get');
const SlsApiFileList = require('./sls-api-file-list');
const SlsApiFileRelationError = require('./sls-api-file-relation-error');
const SlsApiUploadError = require('./sls-api-upload-error');
const SlsApiFileDeleteError = require('./sls-api-file-delete-error');
const SlsApiFileGetError = require('./sls-api-file-get-error');

module.exports = {
	BaseFileModel,
	SlsApiUpload,
	SlsApiFileRelation,
	SlsApiFileDelete,
	SlsApiFileGet,
	SlsApiFileList,
	SlsApiFileRelationError,
	SlsApiUploadError,
	SlsApiFileDeleteError,
	SlsApiFileGetError
};
