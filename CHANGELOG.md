# Changelog

Aws api router almost completed.

## [1.5.16] - 2023-04-18

### Added

- Added a util script to generate a JSON with a structure of paths. It will allow us to get more accurate statistics about the performance on complex trees. Router is still able to find routes in less than 2ms
- Adding mocks to test complex route trees.
- Instead of using fixed http methods, now it uses native http.METHODS

## [1.5.4] - 2023-04-11

### Added

- CHANGELOG.md file

## [1.5.3] - 2019-04-11

### Changed

- AWS proxy router pass down the pathParameters to event.pathParameters

## [1.5] - 2017-06-20

### Added

- Router state based in a N-Tree to enhance the lookup time
