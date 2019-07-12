import { ACTION, INITIALIZE_RESOURCES, SEARCH_API, SEARCH, RECEIVE_RESULT } from './constants';

export function searchAPI(method) {
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return {
      type: SEARCH_API,
      payload: {
        method: method,
        args: args
      }
    };
  };
}
export var defineIndex = searchAPI('defineIndex');
export var indexResource = searchAPI('indexResource');
export var performSearch = searchAPI('performSearch');

export function search(resourceName) {
  return function searchResource(text) {
    return {
      type: ACTION,
      payload: {
        api: performSearch(resourceName, text),
        action: {
          type: SEARCH,
          payload: {
            resourceName: resourceName,
            text: text
          }
        }
      }
    };
  };
}

export function receiveResult(resourceName) {
  return function receiveResultForResource(result) {
    return {
      type: RECEIVE_RESULT,
      payload: {
        resourceName: resourceName,
        result: result
      }
    };
  };
}

export function initializeResources(resourceNames) {
  return {
    type: INITIALIZE_RESOURCES,
    payload: {
      resourceNames: resourceNames
    }
  };
}