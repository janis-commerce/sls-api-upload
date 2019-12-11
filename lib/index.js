'use strict';

const SlsApiUpload = require('./sls-api-upload');
const SlsApiFileRelation = require('./sls-api-file-relation');
const SlsApiFileRelationError = require('./sls-api-file-relation-error');
const SlsApiUploadError = require('./sls-api-upload-error');

module.exports = {
	SlsApiUpload,
	SlsApiFileRelation,
	SlsApiFileRelationError,
	SlsApiUploadError
};
