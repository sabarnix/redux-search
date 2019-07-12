'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

exports.default = reduxSearch;

var _redux = require('redux');

var _selectors = require('./selectors');

var _actions = require('./actions');

var actions = _interopRequireWildcard(_actions);

var _constants = require('./constants');

var _searchMiddleware = require('./searchMiddleware');

var _searchMiddleware2 = _interopRequireDefault(_searchMiddleware);

var _SearchApi = require('./SearchApi');

var _SearchApi2 = _interopRequireDefault(_SearchApi);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Creates higher-order search store to be composed with other store enhancers.
 * This function accepts the following, optional parameters (via a params Object):
 * • resourceIndexes:
 *     Maps searchable resources to search configurations.
 *     Configurations must be one of the following types:
 *     (1) an array of searchable field names (eg. ["name", "description"])
 *     (2) a custom indexing function (eg. ({ resources: Iterable<Object>, indexDocument: Function }))
 * • resourceSelector:
 *     Selector responsible for returning an iterable resource map for a given, searchable resource.
 *     This function should be capable of returning a map for each resource listed in :resourceIndexes.
 *     Its signature should look like this: (resourceName: string, state: Object): Iterable<Object>
 *     If this value is specified then the search index will be automatically built/updated whenever resources change.
 *     Ommit this property if you wish to manage the search index manually.
 * • Search:
 *     Observable Search API.
 *     Defaults to redux-search-supplied SearchApi but can be overriden for testing purposes.
 *     Refer to SearchApi.js for more information if you choose to override this.
 * • searchStateSelector:
 *     Selects the search sub-state within the state store.
 *     Default implementation provided; override if you add searchReducer() to a node other than :search.
 */
function reduxSearch() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$resourceIndexes = _ref.resourceIndexes,
      resourceIndexes = _ref$resourceIndexes === undefined ? {} : _ref$resourceIndexes,
      resourceSelector = _ref.resourceSelector,
      _ref$searchApi = _ref.searchApi,
      searchApi = _ref$searchApi === undefined ? new _SearchApi2.default() : _ref$searchApi,
      _ref$searchStateSelec = _ref.searchStateSelector,
      searchStateSelector = _ref$searchStateSelec === undefined ? _selectors.defaultSearchStateSelector : _ref$searchStateSelec,
      _ref$autoInit = _ref.autoInit,
      autoInit = _ref$autoInit === undefined ? true : _ref$autoInit;

  return function (createStore) {
    return function (reducer, initialState) {
      var store = (0, _redux.applyMiddleware)((0, _searchMiddleware2.default)(searchApi))(createStore)(reducer, initialState);

      store.search = searchApi;
      store[_constants.SEARCH_STATE_SELECTOR] = searchStateSelector;

      if (autoInit) {
        var resourceNames = (0, _keys2.default)(resourceIndexes);
        store.dispatch(actions.initializeResources(resourceNames));
      }

      searchApi.subscribe(function (_ref2) {
        var result = _ref2.result,
            resourceName = _ref2.resourceName,
            text = _ref2.text;

        // Here we handle item responses
        // It can be fancier, but at its core this is all it is
        store.dispatch(actions.receiveResult(resourceName)(result));
      }, function (error) {
        // TODO: Somehow handle error; redux-router lets you pass a callback
        throw error;
      });

      // Auto-index if a :resourceSelector has been provided
      if (resourceSelector) {
        var currentResources = {};

        store.subscribe(function () {
          var nextState = store.getState();
          var searchState = store[_constants.SEARCH_STATE_SELECTOR](nextState);

          for (var resourceName in resourceIndexes) {
            var resource = resourceSelector(resourceName, nextState);

            // Only rebuild the search index for resources that have changed
            if (searchState && (0, _keys2.default)(searchState).length && resource && (0, _keys2.default)(resource).length && currentResources[resourceName] && (0, _keys2.default)(currentResources[resourceName]).length !== (0, _keys2.default)(resource).length) {
              currentResources[resourceName] = resource;

              var resourceIndex = resourceIndexes[resourceName];
              var searchString = searchState[resourceName].text;

              store.dispatch(actions.indexResource({
                fieldNamesOrIndexFunction: resourceIndex,
                resourceName: resourceName,
                resources: resource,
                state: nextState
              }));
              store.dispatch(actions.search(resourceName)(searchString));
            }
          }
        });
      }

      return store;
    };
  };
}