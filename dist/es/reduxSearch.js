import _Object$keys from 'babel-runtime/core-js/object/keys';
import { applyMiddleware } from 'redux';
import { defaultSearchStateSelector } from './selectors';
import * as actions from './actions';
import { SEARCH_STATE_SELECTOR } from './constants';
import searchMiddleware from './searchMiddleware';
import SearchApi from './SearchApi';

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
export default function reduxSearch() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$resourceIndexes = _ref.resourceIndexes,
      resourceIndexes = _ref$resourceIndexes === undefined ? {} : _ref$resourceIndexes,
      resourceSelector = _ref.resourceSelector,
      _ref$searchApi = _ref.searchApi,
      searchApi = _ref$searchApi === undefined ? new SearchApi() : _ref$searchApi,
      _ref$searchStateSelec = _ref.searchStateSelector,
      searchStateSelector = _ref$searchStateSelec === undefined ? defaultSearchStateSelector : _ref$searchStateSelec,
      _ref$autoInit = _ref.autoInit,
      autoInit = _ref$autoInit === undefined ? true : _ref$autoInit;

  return function (createStore) {
    return function (reducer, initialState) {
      var store = applyMiddleware(searchMiddleware(searchApi))(createStore)(reducer, initialState);

      store.search = searchApi;
      store[SEARCH_STATE_SELECTOR] = searchStateSelector;

      if (autoInit) {
        var resourceNames = _Object$keys(resourceIndexes);
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
          var searchState = store[SEARCH_STATE_SELECTOR](nextState);

          for (var resourceName in resourceIndexes) {
            var resource = resourceSelector(resourceName, nextState);

            // Only rebuild the search index for resources that have changed
            if (searchState && _Object$keys(searchState).length && resource && _Object$keys(resource).length && currentResources[resourceName] && _Object$keys(currentResources[resourceName]).length !== _Object$keys(resource).length) {
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