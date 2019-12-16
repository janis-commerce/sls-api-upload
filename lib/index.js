'use strict';

const BaseFileModel = require('./base-model');
const SlsApiUpload = require('./sls-api-upload');
const SlsApiFileRelation = require('./sls-api-file-relation');
const SlsApiFileDelete = require('./sls-api-file-delete');
const SlsApiFileDownload = require('./sls-api-file-download');
const SlsApiFileList = require('./sls-api-file-list');
const SlsApiFileRelationError = require('./sls-api-file-relation-error');
const SlsApiUploadError = require('./sls-api-upload-error');
const SlsApiFileDeleteError = require('./sls-api-file-delete-error');
const SlsApiFileDownloadError = require('./sls-api-file-download-error');

module.exports = {
	BaseFileModel,
	SlsApiUpload,
	SlsApiFileRelation,
	SlsApiFileDelete,
	SlsApiFileDownload,
	SlsApiFileList,
	SlsApiFileRelationError,
	SlsApiUploadError,
	SlsApiFileDeleteError,
	SlsApiFileDownloadError
};
