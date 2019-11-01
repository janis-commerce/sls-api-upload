'use strict';

const s3 = require('./s3');

exports.createPresignedPost = (...args) => {
	return new Promise(async (resolve, reject) => {
		s3.createPresignedPost(...args, (err, data) => {
			if(err)
				return reject(err);

			resolve(data);
		});
	});
};
