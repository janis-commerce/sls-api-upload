# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [6.1.0] - 2024-02-13
### Added
- Reintroduced support for using a _custom_ **S3 Bucket** alongside the **Storage** service

## [6.0.0] - 2023-09-18
### Changed
- Update [@janiscommerce/api](https://www.npmjs.com/package/@janiscommerce/api) to version 8xx
- Update [@janiscommerce/api-get](https://www.npmjs.com/package/@janiscommerce/api-get) to version 6xx
- Update [@janiscommerce/api-list](https://www.npmjs.com/package/@janiscommerce/api-list) to version 7xx
- Update [@janiscommerce/api-test](https://www.npmjs.com/package/@janiscommerce/api-test) to version 6xx
- Update [@janiscommerce/model](https://www.npmjs.com/package/@janiscommerce/model) to version 8xx

## [5.0.0] - 2023-04-19
### Changed
- Update [@janiscommerce/api](https://www.npmjs.com/package/@janiscommerce/api) to version 7xx
- Update [@janiscommerce/api-get](https://www.npmjs.com/package/@janiscommerce/api-get) to version 5xx
- Update [@janiscommerce/api-list](https://www.npmjs.com/package/@janiscommerce/api-list) to version 6xx
- Update [@janiscommerce/api-test](https://www.npmjs.com/package/@janiscommerce/api-test) to version 5xx
- Update [@janiscommerce/model](https://www.npmjs.com/package/@janiscommerce/model) to version 7xx

## [4.1.0] - 2023-03-31
### Added
- New getter option `fileExpiration` on api `getCredentials` and `fileRelation`. It will be use to determinate del expiration of the file.
- New index in BaseModel to expire files after specific time

## [4.0.3] - 2023-03-14
### Fixed
- Update dependency `@janiscommerce/lambda` to version `6.0.2`

## [4.0.2] - 2023-03-14
### Fixed
- Fix getting info when saving the relationship with the file

## [4.0.1] - 2023-03-10
### Changed
- Update dependency `@janiscommerce/lambda` to version `6.0.1`

## [4.0.0] - 2023-02-27
### Fixed
- Now you have to declare the model in `delete` and `relation` Apis to avoid errors saving the relationship

## [3.2.0] - 2023-01-23
### Added
- New property `fileName` it make retro compatible the api get credentials

## [3.1.2] - 2023-01-18
### Fixed
- Fix returning the response in the api get credentials. Now return's an object with the fileNames key

## [3.1.1] - 2023-01-18
### Fixed
- Fix getting `serviceName` to invoke `GetCredentials` lambda

## [3.1.0] - 2023-01-17
### Added
- New api to get credentials to upload a file into S3

## [3.0.1] - 2023-01-16
### Changed
- Now the api `List`, `Get` and `Delete` it will be user de `Storage` Microservice lambda's

### Removed
- Remove the sls api upload

## [2.1.3] - 2022-07-07
### Changed
- Updated `@janiscommerce/model` up to `6.x.x` dependency and other dependencies were updated

## [2.1.2] - 2022-01-04
### Changed
- ApiList and ApiGet - Not making any S3 Request when `path` is missing

## [2.1.1] - 2021-10-26
### Changed
- Updated dependencies

### Removed
- Useless `fields` getter for models

## [2.1.0] - 2020-11-10
### Added
- Every API Module, method `postValidateHook`
- SLS-API-Relation, method `postSaveHook` and `format`
- SLS-API-Delete, method `postDeleteHook`
- SLS-API-List and SLS-API-Get, method `formatUrl` and `formatFileData`
- SLS-API-List, method `customSortableFields` and `customAvailableFilters`

### Changed
- Every API Module, validates Bucket in `validate()` method. Now If validation fails it sets status code `400`
- SLS-API-List changed `shouldAddUrl` not check `type: "image"` anymore, now only returns `false` as default (must overwrite to change to `true`)

## [2.0.0] - 2020-09-09
### Added
- GitHub Actions for build, coverage and publish

### Changed
- Updated `@janiscommerce/api` to `6.x.x`
- Updated `@janiscommerce/api-get` to `4.x.x`
- Updated `@janiscommerce/api-list` to `5.x.x`
- Updated `@janiscommerce/model` to `5.x.x`

## [1.3.0] - 2020-05-19
### Removed
- `package-lock.json` file

## [1.2.0] - 2020-04-24
### Added
- `url` field in API list when file type is 'image'

## [1.1.1] - 2020-02-13
### Fixed
- File removal fixed for mongodb

## [1.1.0] - 2019-12-19
### Added
- API to relate files now has a default behaviour
- API to list files
- API to get a file
- API to remove a file
- Base model to extend for file handling

## [1.0.0] - 2019-11-08
### Added
- Package first version with Upload an Relate APIs
