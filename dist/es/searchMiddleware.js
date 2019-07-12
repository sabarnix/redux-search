import _toConsumableArray from 'babel-runtime/helpers/toConsumableArray';
import { ACTION, SEARCH_API } from './constants';

/**
 * Middleware for interacting with the search API
 * @param {Search} Search object
 */
export default function searchMiddleware(search) {
  return function (_ref) {
    var dispatch = _ref.dispatch;
    return function (next) {
      return function (action) {
        var payload = action.payload;

        if (action.type === SEARCH_API) {
          var method = payload.method,
              args = payload.args;

          return search[method].apply(search, _toConsumableArray(args));
        } else if (action.type === ACTION) {
          next(payload.action);
          return dispatch(payload.api);
        } else {
          return next(action);
        }
      };
    };
  };
}