# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Every API Module, method `postValidateHook`
- SLS-API-Relation, method `postSaveHook` and `format`
- SLS-API-Delete, method `postDeleteHook`
- SLS-API-List and SLS-API-Get, method `formatUrl` and `formatFileData`
- SLS-API-List, method `customSortableFields` and `customAvailableFilters`

### Changed
- Every API Module, validates Bucket in `validate()` method. Now if fails finsh with `status-code: 400`
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
