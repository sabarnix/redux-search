'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.performSearch = exports.indexResource = exports.defineIndex = undefined;
exports.searchAPI = searchAPI;
exports.search = search;
exports.receiveResult = receiveResult;
exports.initializeResources = initializeResources;

var _constants = require('./constants');

function searchAPI(method) {
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return {
      type: _constants.SEARCH_API,
      payload: {
        method: method,
        args: args
      }
    };
  };
}
var defineIndex = exports.defineIndex = searchAPI('defineIndex');
var indexResource = exports.indexResource = searchAPI('indexResource');
var performSearch = exports.performSearch = searchAPI('performSearch');

function search(resourceName) {
  return function searchResource(text) {
    return {
      type: _constants.ACTION,
      payload: {
        api: performSearch(resourceName, text),
        action: {
          type: _constants.SEARCH,
          payload: {
            resourceName: resourceName,
            text: text
          }
        }
      }
    };
  };
}

function receiveResult(resourceName) {
  return function receiveResultForResource(result) {
    return {
      type: _constants.RECEIVE_RESULT,
      payload: {
        resourceName: resourceName,
        result: result
      }
    };
  };
}

function initializeResources(resourceNames) {
  return {
    type: _constants.INITIALIZE_RESOURCES,
    payload: {
      resourceNames: resourceNames
    }
  };
}