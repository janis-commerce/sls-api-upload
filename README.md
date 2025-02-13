# sls-api-upload

![Build Status](https://github.com/janis-commerce/sls-api-upload/workflows/Build%20Status/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/janis-commerce/sls-api-upload/badge.svg?branch=master)](https://coveralls.io/github/janis-commerce/sls-api-upload?branch=master)
[![npm version](https://badge.fury.io/js/%40janiscommerce%2Fsls-api-upload.svg)](https://www.npmjs.com/package/@janiscommerce/sls-api-upload)

This package contains several modules to handle upload files, list it, or delete it for **Janis** APIs.

## Installation
```sh
npm install @janiscommerce/sls-api-upload
```

## 🔧 Configuration
### ENV variables
**`JANIS_SERVICE_NAME`** (required): The name of the service that will be use to create the path when saving the file into the S3 through the Storage Microservice.

### Own bucket usage

For Own Bucket usage is required to add the following configuration.

#### get bucket()

*Required*

This getter must be used in all APIs to indicate the bucket where files are uploaded, listed, retrieved individually, or deleted.

```js
get bucket() {
	return 'bucket-name';
}
```

## Content

In this package, you can found several modules to create APIs to manage files, uploads, delete or get them.

* A [Basic Model](#BaseFileModel)
* API for **Get Credentials** to upload a File
	* [SLS-API-File-Get-Credentials](#SlsApiFileGetCredentials)
* API for **Relate** File to a entity
	* [SLS-API-File-Relation](#SlsApiFileRelation)
* APIs for **List** and **Get** Files
	* [SLS-API-List](#SlsApiFileList)
	* [SLS-API-Get](#SlsApiFileGet)
* API for **Delete** Files
	* [SLS-API-Delete](#SlsApiFileDelete)
* APIs for **Upload** and **Save** Files
	* [SLS-API-Upload](#SlsApiUpload) (Own bucket exclusive)
	* [SLS-API-File-Relation](#SlsApiFileRelation)

Every Module can be customize.

## Common Validation

Some APIs Modules offers some custom validation for specfics features such as file size, or file type, but everyone has a common validation hook.

### postValidateHook()

In order to add some custom validations you can use re-write this method, can be async, if fails the status-code is setted to `400` by default. If it exist, executes after `validate()` and before `process()`.

```js
class MyApiUpload extends SlsApiUpload {

	// ... other code
	postValidateHook() {

		if(!Controller.isValidData(this.data))
			throw new Error('Invalid Data');
	}
};
```

## BaseFileModel

<details>
	<summary>This Module allows you to create a Model for file-data document.</summary>

> This Class extends from [@janiscommerce/model](https://www.npmjs.com/package/@janiscommerce/model)

### Model Example

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

### Getters

The following getters can be used to customize and validate your BaseFileModel.

#### static get table()

*Optional*

*Default*: `"files"`

This is used to indicate the name of the files table/collection

```js
static get table() {
	return 'your_table_files';
}
```

#### static get fields()

*Optional*

*Default*:

```js
{
	id: true,
	path: true,
	size: true,
	name: true,
	type: true,
	dateCreated: true
}
```

This is used to indicate the fields of the files table/collection

```js
static get fields() {
	return {
		...super.fields,
		productId: true
	};
}
```

</details>

## SlsApiFileGetCredentials

<details>
	<summary>This Module allows you to create an API to get the credentials to upload multiples Document.</summary>

> This Class extends from [@janiscommerce/api](https://www.npmjs.com/package/@janiscommerce/api)

### API Example

```js
// in src/api/{entity}/file-get-credentials/list.js
'use strict';

const { SlsApiFileGetCredentials } = require('@janiscommerce/sls-api-upload');

class MyApiRelation extends SlsApiFileGetCredentials {

	get entity() {
		return 'entityName';
	}
}
```

#### get entity()

*Required*

This is used to indicate the entity name, it will be use in the file path when it's saved

```js
get entity() {
	return 'entityName';
}
```

#### get fileExpiration()

*Optional*

Allows you to set a custom expiration for the file.
**Possible values**: `oneDay` | `tendays` | `month` | `never`

```js
get fileExpiration() {
	return 'oneDay';
}
```

### Request Data

This API has the following required request data:

- **fileName**: (string) The file name to upload to S3. **It's required if fileNames its not sended.**
- **fileNames**: (array) List of file names to upload to S3. **It's required if fileName its not sended.**
- **expiration**: (string) The name and extension of the file.

#### Request filenames data example

```json
{
	"fileNames": ["front-image.png"],
	"expiration": 120
}
```

### Response

This API response with status-code `201` and `id` if success to Save the file data Document.

```json
// status-code 201
{
	"fileNames": {
		"front-image.png": {
			"url": "https://s3.amazonaws.com/janis-storage-service-prod",
			"fields": {
				"Content-Type": "image/png",
				"key": "cdn/files/defaultClient/9ea2lbLalrQrjkoWqyJ5gOsJGBtzbml1.png",
				"bucket": "janis-storage-service-beta",
				"X-Amz-Algorithm": "AWS4-HMAC-SHA256",
				"X-Amz-Credential": "ASIASJHJMNZZ5MVD5YHU/20230112/us-east-1/s3/aws4_request",
				"X-Amz-Date": "20230112T114452Z",
				"X-Amz-Security-Token": "IQoJb3JpZ2luX2VjEGQaCXVzLWVhc3QtMSJGMEQCIHJFEKy124C1P0svU5z3M/szk8tN92pSnn5uR=",
				"Policy": "eyJleHBpcmF0aW9uIjoiMjAyMy0wMS0xMlQxMTo0NTo1MloiLCJjb25kaXRpb124IjpbWyJjb250ZW50LWxlbmd0aC1y",
				"X-Amz-Signature": "c9b0e78d8b166847c2583383ac5da48e92e95501ed2991058e5a1244c1514aba"
			}
		}
	}
}
```

#### Request filename data example

```json
{
	"fileName": "front-image.png",
	"expiration": 120
}
```

### Response

This API response with status-code `201` and `id` if success to Save the file data Document.

```json
// status-code 201
{
	"url": "https://s3.amazonaws.com/janis-storage-service-prod",
	"fields": {
		"Content-Type": "image/png",
		"key": "cdn/files/defaultClient/9ea2lbLalrQrjkoWqyJ5gOsJGBtzbml1.png",
		"bucket": "janis-storage-service-beta",
		"X-Amz-Algorithm": "AWS4-HMAC-SHA256",
		"X-Amz-Credential": "ASIASJHJMNZZ5MVD5YHU/20230112/us-east-1/s3/aws4_request",
		"X-Amz-Date": "20230112T114452Z",
		"X-Amz-Security-Token": "IQoJb3JpZ2luX2VjEGQaCXVzLWVhc3QtMSJGMEQCIHJFEKy124C1P0svU5z3M/szk8tN92pSnn5uR=",
		"Policy": "eyJleHBpcmF0aW9uIjoiMjAyMy0wMS0xMlQxMTo0NTo1MloiLCJjb25kaXRpb124IjpbWyJjb250ZW50LWxlbmd0aC1y",
		"X-Amz-Signature": "c9b0e78d8b166847c2583383ac5da48e92e95501ed2991058e5a1244c1514aba"
	}
}
```

#### get model()

*Optional*

This is used to indicate the Model class that should be used to save the file relationship

```js
const FileModel = require('../models/your-file-model');

get model() {
	return FileModel;
}
```

</details>

## SlsApiFileRelation

<details>
	<summary>This Module allows you to create an API to create a Document with the file data in the Database Collection.</summary>

> This Class extends from [@janiscommerce/api](https://www.npmjs.com/package/@janiscommerce/api)

### API Example

```js
// in src/api/{entity}/file/post.js
'use strict';

const { SlsApiFileRelation } = require('@janiscommerce/sls-api-upload');

class MyApiRelation extends SlsApiFileRelation {

	get entityIdField() {
		return 'productId';
	}
}
```

### Request Data

This API has the following required request data:

- **filename**: (string) The name and extension of the file.
- **filesSource**: (string) The full key of the file stored in S3.
- **fileExpiration**: (string) The expiration of the file stored in S3.

#### Request data example

```json
{
	"fileName": "front-image.png",
	"fileSource": "files/images/1f368ddd-97b6-4076-ba63-9e0a71273aac.png",
	"fileExpiration": "month"
}
```

### Response

This API response with status-code `201` and `id` if success to Save the file data Document.

```json
// status-code 201
{
	"id": "5e866d89fc33220011108188"
}
```

#### get model()

*Optional*

This is used to indicate the Model class that should be used to save the file relationship

```js
const FileModel = require('../models/your-file-model');

get model() {
	return FileModel;
}
```

#### get entityIdField()

*Required*

This is used to indicate the field name where the related entity ID should be saved

```js
	...
	get entityIdField() {
		return 'productId';
	}
	...
```

#### get customFieldsStruct()

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

#### get fileExpiration()

*Optional*

Allows you to set a custom expiration for the file.
**Possible values**: `oneDay` | `tendays` | `month` | `never`

```js
get fileExpiration() {
	return 'oneDay';
}
```

### Hooks

This module has 2 Hooks:

* [postValidateHook](#Common-Validation)
* [postSaveHook](####postSaveHook)

#### postSaveHook(id, dataFormatted)

This hooks is async and execute after save the document. You can used it to emit an Event, invoke a Lambda function, create an extra Log, make a Request or whatever you need to the do after save.

```js
 postSaveHook(id, itemFormatted) {
	return Invoker.call('ItemNotify', { id, ...itemFormatted});
}
```

### Format

The object is created with the following fields:

* `name`: the filename, example: `front-image.png`
* `path`: the relative path in S3 Bucket, example `files/images/1f368ddd-97b6-4076-ba63-9e0a71273aac.png`
* `mimeType`: the file full type, example: `ìmage/png`
* `type`: the simplified type, example `image`
* `size`: the file size in Bytes, example: `1000`

But if you have more fields, or you can add any others, you can use a custom Format method

#### format(extraFileData)

It's async and received the extra file data (if you added `customFieldsStruct`).

```js
format({ myRelationshipCustomField, myOptionalRelationshipCustomField }) {
	return {
		relations: {
			default: myRelationshipCustomField,
			optional: myOptionalRelationshipCustomField
		},
		lucky: Math.random() * 1000
	};
}
```

And final document saved in database would be:

```js
{
	path: 'files/images/1f368ddd-97b6-4076-ba63-9e0a71273aac.png',
	name: 'front-image.png',
	mimeType: 'image/png',
	type: 'image',
	size: 10000,
	relations: {
		default: 'stuff',
		optional: 'accesory'
	},
	lucky: 667
}
```

</details>

## SlsApiFileList

<details>
	<summary>This Module allows you to create an API to List file-data documents.</summary>

> This API extends from [@janiscommerce/api-list](https://www.npmjs.com/package/@janiscommerce/api-list)

### API Example

```js
// in src/api/item/file/list.js
'use strict';

const { SlsApiFileDelete } = require('@janiscommerce/sls-api-upload');

class MyApiList extends SlsApiFileList {}

```

In this example, the List API only can
* **sort** and **filter** by
	* `id` : file-data document internal ID
	* `name` : filename
	* `dateCreated` : *strict mode* only search by exact Date

Also, every file-data document will NOT have a URL to use it for show it, download it, etc..

### Custom Sorting and Filtering

If you need more fields to sort or filter exist 2 *optionals* getters.

#### get customSortableFields()

To add more fields to be sortable. Must return an *Array* of *Strings*

```js
get customSortableFields() {
	return ['type', 'order'];
}
```

#### get customAvailableFilters()

To add more fields to be sortable. Must return an *Array* of *Strings* or *Object*, see more in [@janiscommerce/api-list filters](https://www.npmjs.com/package/@janiscommerce/api-list#get-availablefilters).

```js
get customAvailableFilters() {
	return [
		'type',
		{
			name: 'order',
			valueMapper: Number
		}
	];
}
```

### Format

You can format each file-data document and/or the file's URL.

#### formatFileData(fileData)

To format the file data except file-path

```js
formatFileData({ order, ...fileData }) {
	return {
		...fileData,
		order: `#${order}`
	};
}
```

### Hooks

This module has only one Hook:

* [postValidateHook](#Common-Validation)

</details>

## SlsApiFileGet

<details>
	<summary>This Module allows you to create an API to get a single file-data document.</summary>

> This API extends from [@janiscommerce/api-get](https://www.npmjs.com/package/@janiscommerce/api-get)

### API Example

```js
// in src/api/item/file/get.js
'use strict';

const { SlsApiFileGet } = require('@janiscommerce/sls-api-upload');

class MyApiGet extends SlsApiFileGet {

}
```

### URL field

This API module always return the file-data document with the `url` field.


### Format

The File-Document can be formatted in the same way as in the [SLS-API-List](#SlsApiFileList) using
* [formatFileData](#formatfiledatafiledata)

### Hooks

This module has only one Hook:

* [postValidateHook](#Common-Validation)

</details>

## SlsApiFileDelete

<details>
	<summary>This Module allows you to create an API to delete a file from S3 Bucket and Database Collection.</summary>

> This Class extends from [@janiscommerce/api](https://www.npmjs.com/package/@janiscommerce/api)

### API Example

```js
// in src/api/item/file/delete.js
'use strict';

const { SlsApiFileDelete } = require('@janiscommerce/sls-api-upload');

class MyApiDelete extends SlsApiFileDelete {

	get entityIdField() {
		return 'productId';
	}
}
```

### Getters

The following getters can be used to customize and validate your SlsApiFileDelete.

#### get model()

*Optional*

This is used to indicate the Model class that should be used to remove the file relationship

```js
const FileModel = require('../models/your-file-model');

get model() {
	return FileModel;
}
```

#### get entityIdField()

*Required*

This is used to indicate the field name where the related entity ID was saved

```js
get entityIdField() {
	return 'productId';
}
```

### Hooks

This module has two Hooks:

* [postValidateHook](#Common-Validation)
* postDeleteHook

#### postDeleteHook(itemDeleted)

This hooks is async and execute after delete the document from S3 Bucket. You can used it to emit an Event, invoke a Lambda function, create an extra Log, make a Request or whatever you need to the do after delete it.

```js
 postDeleteHook(itemDeleted) {
	return EventEmitter.emit({
		entity: 'item',
		event: 'deleted',
		client: this.session.clientCode,
		id: itemDeleted.id
	});
}
```

</details>

## Serverless Example

<details>
	<summary>This is an example to implement in the serverless configuration.</summary>

> This Configuration file use this packages [@sls-helper](https://www.npmjs.com/package/sls-helper) and [@sls-helper-plugin-janis](https://www.npmjs.com/package/sls-helper-plugin-janis)

```json
[
	[
		"janis.api",
		{
			"path": "/{entityName}/{id}/file",
			"method": "get",
			"methodName": "list",
			"authorizer": "FullAuthorizer",
			"cors": true
		}
	],
	[
		"janis.api",
		{
			"path": "/{entityName}/{id}/file/{fileId}",
			"method": "get",
			"authorizer": "FullAuthorizer",
			"cors": true
		}
	],
	[
		"janis.api",
		{
			"path": "/{entityName}/{id}/file/{fileId}",
			"method": "delete",
			"authorizer": "FullAuthorizer",
			"cors": true
		}
	],
	[
		"janis.api",
		{
			"path": "/{entityName}/{id}/file",
			"method": "post",
			"authorizer": "FullAuthorizer",
			"cors": true,
			"package": {
                "include": ["src/models/file.js", "src/api/{entityName}/file-related/post.js"]
            }
		}
	],
	[
		"janis.api",
		{
			"path": "/{entityName}/{id}/file-get-credentials",
			"method": "get",
			"methodName": "list",
			"authorizer": "FullAuthorizer",
			"cors": true,
			"package": {
                "include": ["src/models/file.js", "src/api/{entityName}/file-related/post.js"]
            }
		}
	]
]
```

</details>



## SlsApiUpload

<details>
	<summary>This Module allows you to create an API to get a valid pre-signed URL and headers in order to upload a file to a S3 Bucket (Own Bucket exclusive).</summary>

> This Class extends from [@janiscommerce/api](https://www.npmjs.com/package/@janiscommerce/api)

:warning: **IMPORTANT**: When you get the response you can use it to make the request with the file.

If you want to see more about it:
* [AWS preSigned URL](https://docs.aws.amazon.com/AmazonS3/latest/dev/PresignedUrlUploadObject.html)
* [Upload an Image using Postman and S3 preSigned URL](https://medium.com/@lakshmanLD/upload-file-to-s3-using-lambda-the-pre-signed-url-way-158f074cda6c), see Step 2.

### API Example

```js
// in src/api/item/file-upload/list.js
'use strict';

const { SlsApiUpload } = require('@janiscommerce/sls-api-upload');

module.exports = class MyApiUpload extends SlsApiUpload {
	get bucket() {
		return 'bucket-name';
	}

	get path() {
		return 'files/';
	}

	get availableTypes() {
		return ['application/pdf']
	}

	get expiration() {
		return 300;
	}

	get sizeRange() {
		return [1, 1024 * 1024 * 5]; // 1byte - 5mb
	}
};

```

### Request Example

```js
{
	fileName: 'my-file.jpg'
}
```

### Response Example

```js
{
	url: 'https://s3.amazonaws.com/bucket-name',
	fields: {
		'Content-Type': 'image/jpg',
		key: 'files/06311e0c-6f32-4a13-93e4-c89a7765e571.jpg',
		bucket: 'bucket-name',
		'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
		'X-Amz-Credential': 'AAAAAAA99BB0BOCCCCCC/10000000/us-east-2/s3/aws4_request',
		'X-Amz-Date': '20200406T185857Z',
		Policy: 'eyJleHBpcmF0aW9uIjoiMjAyMC0wNC0wNlQxODo1OTo1N1oiLCJjb25kaXRpb25zIjpbWyJjb250ZW5=',
		'X-Amz-Signature': '4e99b9e991df4aa4370e88aa3390000d1a543527fcc1cdb6583b193aed00bf00'
	}
}
```

### Getters

The following getters can be used to customize and validate your `SlsApiUpload`.


#### get bucket()

*Required*

This is used to indicate the bucket where the file should be saved

```js
get bucket() {
	return 'bucket-name';
}
```

#### get path()

*Optional*

*Default*: `""`

This is used to indicate the path where the file should be saved

```js
get path() {
	return 'files/pdf/';
}
```

#### get availableTypes()

*Optional*

*Default*: `[]`

This is used to indicate the accepted file types to be uploaded. If you not define them, all types will be valid. Example:

```js
get availableTypes() {
	return ['image/jpg', 'image/jpeg', 'image/png']
}
```

#### get expiration()

*Optional*

*Default*: `60`

This is used to indicate the expiration time in seconds of the generated URL

```js
get expiration() {
	return 120;
}
```

#### get sizeRange()

*Optional*

*Default*: `[1,10485760] // 1B to 10MB`

This is used to indicate the valid file size range to be uploaded

```js
get sizeRange() {
	return [1, 20 * 1024 * 1024]; // 1byte - 20mb
}
```

### Hooks

This module has only one Hook:

* [postValidateHook](#Common-Validation)

</details>