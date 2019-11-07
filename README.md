# sls-api-upload

[![Build Status](https://travis-ci.org/janis-commerce/sls-api-upload.svg?branch=master)](https://travis-ci.org/janis-commerce/sls-api-upload)
[![Coverage Status](https://coveralls.io/repos/github/janis-commerce/sls-api-upload/badge.svg?branch=master)](https://coveralls.io/github/janis-commerce/sls-api-upload?branch=master)

A package to handle JANIS FILE UPLOAD APIs.

## Installation
```sh
npm install @janiscommerce/sls-api-upload
```

## Usage SlsApiUpload Module
```js
'use strict';

const { SlsApiUpload } = require('@janiscommerce/sls-api-upload');

class MyApiUpload extends SlsApiUpload {
	get bucket() {
		return 'bucket-name';
	}

	get path() {
		return 'files/';
	}
}

module.exports = MyApiUpload;

```

### MyApiUpload

Request data example;

```js
{
	fileName: 'string' // file.JSON, file.png, etc
}
```

The following getters can be used to customize and validate your ApiUpload.


#### get bucket()

*Required*

This is used to indicate bucket where save the file.

```js
	...
	get bucket() {
		return 'bucket-name';
	}
	...
```

#### get path()

*Optional*

*Default=""*

This is used to indicate path where save the file

```js
	...
	get path() {
		return 'files/pdf/';
	}
	...
```

#### get availableTypes()

*Optional*

*Default=[]*

This is used to indicate accepted types for upload to s3. If you not define availableTypes, all types are valid. Example:

```js
	...
	get availableTypes() {
		return ['application/json']
	}
	...
```

#### get expiration()

*Optional*

*Default=60*

This is used to indicate expiration time for upload file in s3 (in seconds)

```js
	...
	get expiration() {
		return 120;
	}
	...
```

#### get sizeRange()

*Optional*

*Default=[1,10000000]*

This is use to indicate range of size for the files to upload to s3 in bytes.

```js
	...
	get sizeRange() {
		return [1, 20000000]; // 1byte - 20mb
	}
	...
```

## Usage SlsApiFileRelation Module

Build your API to relate an uploaded file with some record.
This module validate data automatically. For implement this api is required use `async process()`.


```js
'use strict';

const { SlsApiFileRelation } = require('@janiscommerce/sls-api-upload');

class MyApiRelation extends SlsApiFileRelation {
	...
}
```

Request data example;

```js
{
	fileName: 'string',
	fileSource: 'string'
}
```

filename: is a name and extension file. Example: `image.png`

filesSource: is a key generated in s3 for file uploaded. Example: `files/images/adasd5a6sd456.png`