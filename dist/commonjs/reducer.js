'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handlers = undefined;

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends4 = require('babel-runtime/helpers/extends');

var _extends5 = _interopRequireDefault(_extends4);

var _handlers;

exports.default = searchReducer;

var _constants = require('./constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The user must add this reducer to their app store/tree.
 * By default it is assumed that this reducer will be added at :search.
 * If you use another location you must pass a custom :searchStateSelector to reduxSearch().
 */
function searchReducer() {
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
var handlers = exports.handlers = (_handlers = {}, (0, _defineProperty3.default)(_handlers, _constants.INITIALIZE_RESOURCES, function (state, _ref2) {
  var resourceNames = _ref2.resourceNames;

  return resourceNames.reduce(function (result, resourceName) {
    result[resourceName] = {
      isSearching: false,
      result: [],
      text: ''
    };
    return result;
  }, (0, _extends5.default)({}, state));
}), (0, _defineProperty3.default)(_handlers, _constants.RECEIVE_RESULT, function (state, _ref3) {
  var resourceName = _ref3.resourceName,
      result = _ref3.result;

  return (0, _extends5.default)({}, state, (0, _defineProperty3.default)({}, resourceName, (0, _extends5.default)({}, state[resourceName], {
    isSearching: false,
    result: result
  })));
}), (0, _defineProperty3.default)(_handlers, _constants.SEARCH, function (state, _ref4) {
  var resourceName = _ref4.resourceName,
      text = _ref4.text;

  return (0, _extends5.default)({}, state, (0, _defineProperty3.default)({}, resourceName, (0, _extends5.default)({}, state[resourceName], {
    isSearching: true,
    text: text
  })));
}), _handlers);