import _defineProperty from 'babel-runtime/helpers/defineProperty';
import _extends from 'babel-runtime/helpers/extends';

var _handlers;

import { INITIALIZE_RESOURCES, RECEIVE_RESULT, SEARCH } from './constants';

/**
 * The user must add this reducer to their app store/tree.
 * By default it is assumed that this reducer will be added at :search.
 * If you use another location you must pass a custom :searchStateSelector to reduxSearch().
 */
export default function searchReducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      payload = _ref.payload,
      type = _ref.type;

  if (handlers.hasOwnProperty(type)) {
    return handlers[type](state, payload);
  } else {
    return state;
  }
}

/**
 * Search state reducers.
 */
export var handlers = (_handlers = {}, _defineProperty(_handlers, INITIALIZE_RESOURCES, function (state, _ref2) {
  var resourceNames = _ref2.resourceNames;

  return resourceNames.reduce(function (result, resourceName) {
    result[resourceName] = {
      isSearching: false,
      result: [],
      text: ''
    };
    return result;
  }, _extends({}, state));
}), _defineProperty(_handlers, RECEIVE_RESULT, function (state, _ref3) {
  var resourceName = _ref3.resourceName,
      result = _ref3.result;

  return _extends({}, state, _defineProperty({}, resourceName, _extends({}, state[resourceName], {
    isSearching: false,
    result: result
  })));
}), _defineProperty(_handlers, SEARCH, function (state, _ref4) {
  var resourceName = _ref4.resourceName,
      text = _ref4.text;

  return _extends({}, state, _defineProperty({}, resourceName, _extends({}, state[resourceName], {
    isSearching: true,
    text: text
  })));
}), _handlers);