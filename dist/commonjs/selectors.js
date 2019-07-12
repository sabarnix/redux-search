"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultSearchStateSelector = defaultSearchStateSelector;
exports.getSearchSelectors = getSearchSelectors;
exports.getTextSelector = getTextSelector;
exports.getResultSelector = getResultSelector;
exports.getUnfilteredResultSelector = getUnfilteredResultSelector;


/** Default state selector */
function defaultSearchStateSelector(state) {
  return state.search;
}

/**
 * Creates convenience selectors for the specified resource.
 *
 * @param filterFunction Custom filter function for resources that are computed (not basic maps)
 * @param resourceName eg "databases"
 * @param resourceSelector Returns an iterable resouce map for a given, searchable resource.
 * @param searchStateSelector Returns the Search sub-state of the store; (state: Object): Object
 */
function getSearchSelectors(_ref) {
  var filterFunction = _ref.filterFunction,
      resourceName = _ref.resourceName,
      resourceSelector = _ref.resourceSelector,
      _ref$searchStateSelec = _ref.searchStateSelector,
      searchStateSelector = _ref$searchStateSelec === undefined ? defaultSearchStateSelector : _ref$searchStateSelec;

  return {
    text: getTextSelector({ resourceName: resourceName, searchStateSelector: searchStateSelector }),
    result: getResultSelector({ filterFunction: filterFunction, resourceName: resourceName, resourceSelector: resourceSelector, searchStateSelector: searchStateSelector }),
    unfilteredResult: getUnfilteredResultSelector({ resourceName: resourceName, searchStateSelector: searchStateSelector })
  };
}

/**
 * Returns the current search text for a given searchable resource.
 *
 * @param resourceName eg "databases"
 * @param searchStateSelector Returns the Search sub-state of the store; (state: Object): Object
 */
function getTextSelector(_ref2) {
  var resourceName = _ref2.resourceName,
      _ref2$searchStateSele = _ref2.searchStateSelector,
      searchStateSelector = _ref2$searchStateSele === undefined ? defaultSearchStateSelector : _ref2$searchStateSele;

  return function textSelector(state) {
    return searchStateSelector(state)[resourceName].text;
  };
}

/**
 * Creates a default filter function capable of handling Maps and Objects.
 */
function createFilterFunction(resource) {
  return resource.has instanceof Function ? function (id) {
    return resource.has(id);
  } : function (id) {
    return resource[id];
  };
}

/**
 * Returns the current result list for a given searchable resource.
 * This list is pre-filtered to ensure that all ids exist within the current resource collection.
 *
 * @param filterFunction Custom filter function for resources that are computed (not basic maps)
 * @param resourceName eg "databases"
 * @param resourceSelector Returns an iterable resouce map for a given, searchable resource.
 * @param searchStateSelector Returns the Search sub-state of the store; (state: Object): Object
 */
function getResultSelector(_ref3) {
  var filterFunction = _ref3.filterFunction,
      resourceName = _ref3.resourceName,
      resourceSelector = _ref3.resourceSelector,
      _ref3$searchStateSele = _ref3.searchStateSelector,
      searchStateSelector = _ref3$searchStateSele === undefined ? defaultSearchStateSelector : _ref3$searchStateSele;

  var unfilteredResultSelector = getUnfilteredResultSelector({ resourceName: resourceName, searchStateSelector: searchStateSelector });

  return function resultSelector(state) {
    var result = unfilteredResultSelector(state);
    var resource = resourceSelector(resourceName, state);

    return result.filter(filterFunction || createFilterFunction(resource));
  };
}

/**
 * Returns the current result list for a given searchable resource.
 * This list is not pre-filtered; see issue #29 for more backstory.
 *
 * @param resourceName eg "databases"
 * @param searchStateSelector Returns the Search sub-state of the store; (state: Object): Object
 */
function getUnfilteredResultSelector(_ref4) {
  var resourceName = _ref4.resourceName,
      _ref4$searchStateSele = _ref4.searchStateSelector,
      searchStateSelector = _ref4$searchStateSele === undefined ? defaultSearchStateSelector : _ref4$searchStateSele;

  return function resultSelector(state) {
    return searchStateSelector(state)[resourceName].result;
  };
}