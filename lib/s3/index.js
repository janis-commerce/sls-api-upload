'use strict';

const s3 = require('./s3Wrapper');

exports.createPresignedPost = params => {
	return new Promise(async (resolve, reject) => {
		s3.createPresignedPost(params, (err, data) => {
			if(err)
				return reject(err);

			resolve(data);
		});
	});
};
