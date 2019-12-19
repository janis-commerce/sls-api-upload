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

	get availableTypes() {
		return ['image/jpg', 'image/jpeg', 'image/png']
	}

	get expiration() {
		return 300;
	}

	get sizeRange() {
		return [1, 1024 * 1024 * 5]; // 1byte - 5mb
	}
}

module.exports = MyApiUpload;

```

Request data example;

```js
{
	fileName: 'my-file.jpg'
}
```

The following getters can be used to customize and validate your SlsApiUpload.


### get bucket()

*Required*

This is used to indicate the bucket where the file should be saved

```js
get bucket() {
	return 'bucket-name';
}
```

### get path()

*Optional*

*Default=""*

This is used to indicate the path where the file should be saved

```js
get path() {
	return 'files/pdf/';
}
```

### get availableTypes()

*Optional*

*Default=[]*

This is used to indicate the accepted file types to be uploaded. If you not define them, all types will be valid. Example:

```js
get availableTypes() {
	return ['application/pdf']
}
```

### get expiration()

*Optional*

*Default=60*

This is used to indicate the expiration time in seconds of the generated URL

```js
get expiration() {
	return 120;
}
```

### get sizeRange()

*Optional*

*Default=[1,10485760] // 1B to 10MB*

This is used to indicate the valid file size range to be uploaded

```js
get sizeRange() {
	return [1, 20 * 1024 * 1024]; // 1byte - 20mb
}
```

## Usage SlsApiFileRelation Module

```js
'use strict';

const { SlsApiFileRelation } = require('@janiscommerce/sls-api-upload');
const FileModel = require('../models/your-file-model');

class MyApiRelation extends SlsApiFileRelation {
	get bucket() {
		return 'bucket-name';
	}

	get model() {
		return FileModel;
	}

	get entityIdField() {
		return 'productId';
	}
}
```

This API has the following required request data:

- **filename**: (string) The name and extension of the file.
- **filesSource**: (string) The full key of the file stored in S3.

Request data example;

```json
{
	"fileName": "image.png",
	"fileSource": "files/images/1f368ddd-97b6-4076-ba63-9e0a71273aac.png"
}
```

The following getters can be used to customize and validate your API:

### get bucket()

*Required*

This is used to indicate the bucket where the file was saved

```js
get bucket() {
	return 'bucket-name';
}
```

### get model()

*Required*

This is used to indicate the Model class that should be used to save the file relationship

```js
const FileModel = require('../models/your-file-model');

get model() {
	return FileModel;
}
```

### get entityIdField()

*Required*

This is used to indicate the field name where the related entity ID should be saved

```js
	...
	get entityIdField() {
		return 'productId';
	}
	...
```

### get customFieldsStruct()

*Optional*

This is used to indicate more fields to be validated from the request and saved with the relationship.

```js
get customFieldsStruct() {
	return {
		myRelationshipCustomField: 'string',
		myOptionalRelationshipCustomField: 'string?'
	};
}
```

Request data example;

```json
{
	"fileName": "image.png",
	"fileSource": "files/images/1f368ddd-97b6-4076-ba63-9e0a71273aac.png",
	"myRelationshipCustomField": "theValue"
}
```

## Usage SlsApiFileDelete Module

```js
'use strict';

const { SlsApiFileDelete } = require('@janiscommerce/sls-api-upload');
const FileModel = require('../models/your-file-model');

class MyApiDelete extends SlsApiFileDelete {
	get bucket() {
		return 'bucket-name';
	}

	get model() {
		return FileModel;
	}

	get entityIdField() {
		return 'productId';
	}
}
```

The following getters can be used to customize and validate your SlsApiFileDelete.

### get bucket()

*Required*

This is used to indicate the bucket where the file is.

```js
get bucket() {
	return 'bucket-name';
}
```
### get model()

*Required*

This is used to indicate the Model class that should be used to remove the file relationship

```js
const FileModel = require('../models/your-file-model');

get model() {
	return FileModel;
}
```

### get entityIdField()

*Required*

This is used to indicate the field name where the related entity ID was saved

```js
get entityIdField() {
	return 'productId';
}
```

## Usage SlsApiFileList Module

```js
'use strict';

const { SlsApiFileDelete } = require('@janiscommerce/sls-api-upload');

class MyApiList extends SlsApiFileList {}

```

Usually, this API has a parent entity and when the API finds records in the model, it filters by parent entity name indicated in the API path.
To change this name, you can set it in the availableFilters getter.

Here is an example for an API `/product/10/file`, with a field `productId` in the DB:

```js
get availableFilters() {
	return [
		...super.availableFilters,
		{
			name: 'product',
			internalName: 'productId'
		}
	];
}
```

If you dont have this problem, just add the entity name in availableFilters getter:

```js
get availableFilters() {
	return [
		...super.availableFilters,
		'product'
	];
}
```

This API extends from [@janiscommerce/api-list](https://www.npmjs.com/package/@janiscommerce/api-list)

## Usage SlsApiFileGet Module

```js
'use strict';

const { SlsApiFileGet } = require('@janiscommerce/sls-api-upload');

class MyApiGet extends SlsApiFileGet {}
```

The following getters can be used to customize and validate your SlsApiFileGet.

### get bucket()

*Required*

This is used to indicate the bucket where the file is.

```js
get bucket() {
	return 'bucket-name';
}
```

This API extends from [@janiscommerce/api-get](https://www.npmjs.com/package/@janiscommerce/api-get)

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
			productId: true
		};
	}
}

```

The following getters can be used to customize and validate your BaseFileModel.

### static get table()

*Required*

*Default="files"*

This is used to indicate the name of the files table/collection

```js
static get table() {
	return 'your_table_files';
}
```

### static get fields()

*Required*

*Default={ id: true, path: true, size: true, name: true, type: true, dateCreated: true }*

This is used to indicate the fields of the files table/collection

```js
static get fields() {
	return {
		...super.fields,
		productId: true
	};
}
```

This Class extends from [@janiscommerce/model](https://www.npmjs.com/package/@janiscommerce/model)
