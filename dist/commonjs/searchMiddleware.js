'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

exports.default = searchMiddleware;

var _constants = require('./constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Middleware for interacting with the search API
 * @param {Search} Search object
 */
function searchMiddleware(search) {
  return function (_ref) {
    var dispatch = _ref.dispatch;
    return function (next) {
      return function (action) {
        var payload = action.payload;

        if (action.type === _constants.SEARCH_API) {
          var method = payload.method,
              args = payload.args;

          return search[method].apply(search, (0, _toConsumableArray3.default)(args));
        } else if (action.type === _constants.ACTION) {
          next(payload.action);
          return dispatch(payload.api);
        } else {
          return next(action);
        }
      };
    };
  };
}