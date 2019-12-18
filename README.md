# sls-api-upload

[![Build Status](https://travis-ci.org/janis-commerce/sls-api-upload.svg?branch=master)](https://travis-ci.org/janis-commerce/sls-api-upload)
[![Coverage Status](https://coveralls.io/repos/github/janis-commerce/sls-api-upload/badge.svg?branch=master)](https://coveralls.io/github/janis-commerce/sls-api-upload?branch=master)

A package to handle JANIS file upload APIs.

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

Request data example;

```js
{
	fileName: 'string' // file.JSON, file.png, etc
}
```

The following getters can be used to customize and validate your SlsApiUpload.


### get bucket()

*Required*

This is used to indicate bucket where save the file.

```js
	...
	get bucket() {
		return 'bucket-name';
	}
	...
```

### get path()

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

### get availableTypes()

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

### get expiration()

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

### get sizeRange()

*Optional*

*Default=[1,10000000]*

This is used to indicate range of size for the files to upload to s3 in bytes.

```js
	...
	get sizeRange() {
		return [1, 20000000]; // 1byte - 20mb
	}
	...
```

## Usage SlsApiFileRelation Module

```js
'use strict';

const { SlsApiFileRelation } = require('@janiscommerce/sls-api-upload');
const FileModel = require('../models/your-file-model');

class MyApiRelation extends SlsApiFileRelation {
	get bucket() {
		return process.env.S3_BUCKET;
	}

	get model() {
		return FileModel;
	}

	get entityIdField() {
		return 'idField';
	}
}
```

The api relation require data:

filename: is a name and extension file. Example: `image.png`

filesSource: is a key generated in s3 for file uploaded. Example: `files/images/1f368ddd-97b6-4076-ba63-9e0a71273aac.png`

Request data example;

```js
{
	fileName: 'string',
	fileSource: 'string'
}
```

The following getters can be used to customize and validate your SlsApiFileRelation.

### get bucket()

*Required*

This is used to indicate bucket where find the file.

```js
	...
	get bucket() {
		return 'bucket-name';
	}
	...
```
### get model()

*Required*

This is used to pass a Files Model Class for update and relationate file with entityId

```js
	const FileModel = require('../models/your-file-model');

	...
	get model() {
		return FileModel';
	}
	...
```

### get entityIdField()

*Required*

This is used to indicate field name where filter by entityId in database

```js
	...
	get entityIdField() {
		return 'entityId';
	}
	...
```

### get customFieldsStruct()

*Optional*

This is used to indicate others fields to save for send in data

```js
	...
	get customFieldsStruct() {
		return {
			newField: 'string'
		};
	}
	...
```

Request data example;

```js
{
	fileName: 'string',
	fileSource: 'string',
	newField: 'string'
}
```

## Usage SlsApiFileDelete Module

```js
'use strict';

const { SlsApiFileDelete } = require('@janiscommerce/sls-api-upload');
const FileModel = require('../models/your-file-model');

class MyApiDelete extends SlsApiFileDelete {
	get bucket() {
		return process.env.S3_BUCKET;
	}

	get model() {
		return FileModel;
	}

	get entityIdField() {
		return 'idField';
	}
}
```

The following getters can be used to customize and validate your SlsApiFileDelete.

### get bucket()

*Required*

This is used to indicate bucket where delete the file.

```js
	...
	get bucket() {
		return 'bucket-name';
	}
	...
```
### get model()

*Required*

This is used to pass a Files Model Class for remove a file record

```js
	const FileModel = require('../models/your-file-model');

	...
	get model() {
		return FileModel';
	}
	...
```

### get entityIdField()

*Required*

This is used to indicate field name where filter by entityId in database

```js
	...
	get entityIdField() {
		return 'entityId';
	}
	...
```

## Usage SlsApiFileList Module

```js
'use strict';

const { SlsApiFileDelete } = require('@janiscommerce/sls-api-upload');

class MyApiList extends SlsApiFileList {}

```

Usually, this API has a parent entity and when the API finds records in the model, it filters by parent entity name.
To change this you must add available filters

```js
	...
	get availableFilters() {
		return [
			...super.availableFilters,
			{
				name: 'entityName',
				internalName: 'entityId'
			}
		];
	}
	...
```


If you dont have this problem only add the entity name in availableFilters


```js
	...
	get availableFilters() {
		return [
			...super.availableFilters,
			'entityName'
		];
	}
	...
```

## Usage SlsApiFileGet Module

```js
'use strict';

const { SlsApiFileGet } = require('@janiscommerce/sls-api-upload');

class MyApiGet extends SlsApiFileGet {}

```

The following getters can be used to customize and validate your SlsApiFileGet.

### get bucket()

*Required*

This is used to indicate bucket where find temporal public url of file.

```js
	...
	get bucket() {
		return 'bucket-name';
	}
	...
```

## Usage BaseFileModel Module

```js
'use strict';

const { BaseFileModel } = require('@janiscommerce/sls-api-upload');

class FileModel extends BaseFileModel {
	static get table() {
		return 'your_table_files';
	}

	static get fields() {
		return {
			...super.fields,
			entityId: true
		};
	}
}

```

The following getters can be used to customize and validate your BaseFileModel.

### static get table()

*Required*

*Default="files"*

This is used to indicate table files name.

```js
	...
	static get table() {
		return 'your_table_files';
	}
	...
```

### static get fields()

*Required*

*Default={ id: true, path: true, size: true, name: true, type: true, dateCreated: true };*

This is used to indicate fields for get in database.

```js
	...
	static get fields() {
		return {
			...super.fields,
			entityId: true
		};
	}
	...
```