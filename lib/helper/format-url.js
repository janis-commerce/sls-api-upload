'use strict';

const { Invoker } = require('@janiscommerce/lambda');

const getSignedFiles = async (clientCode, paths) => {

	if(!paths.length)
		return {};

	const { payload, statusCode } = await Invoker.serviceSafeClientCall('storage', 'GetSignedFiles', clientCode, { paths });

	return (statusCode === 200 && payload) || {};
};

const findSignedFile = (signedFiles, path) => {

	if(!path)
		return null;

	return signedFiles[path] || null;
};

module.exports = {
	getSignedFiles,
	findSignedFile
};
