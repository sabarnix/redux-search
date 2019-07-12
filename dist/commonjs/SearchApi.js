'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _jsWorkerSearch = require('js-worker-search');

var _jsWorkerSearch2 = _interopRequireDefault(_jsWorkerSearch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Observable that manages communication between redux-search middleware and the Search utility.
 * This class maps resource names to search indicies and manages subscribers.
 */
var SubscribableSearchApi = function () {

  /**
   * Constructor.
   */
  function SubscribableSearchApi() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        caseSensitive = _ref.caseSensitive,
        indexMode = _ref.indexMode,
        matchAnyToken = _ref.matchAnyToken,
        tokenizePattern = _ref.tokenizePattern;

    (0, _classCallCheck3.default)(this, SubscribableSearchApi);

    this._caseSensitive = caseSensitive;
    this._indexMode = indexMode;
    this._matchAnyToken = matchAnyToken;
    this._tokenizePattern = tokenizePattern;

    this._resourceToSearchMap = {};

    // Subscribers
    this._onErrorSubscribers = [];
    this._onNextSubscribers = [];
  }

  /**
   * Subscribe to Search events.
   * Subscribers will be notified each time a Search is performed.
   *
   * Successful searches will call :onNext with the following parameters:
   * >result: An array of uids matching the search
   * >text: Search string
   * >resourceName: Identifies the resource that was searched
   *
   * Failed searches (searches that result in an Error) will call :onError with an Error parameter.
   *
   * This method returns a callback that can be used to unsubscribe from Search events.
   * Just invoke the function without any parameters to unsubscribe.
   */


  (0, _createClass3.default)(SubscribableSearchApi, [{
    key: 'subscribe',
    value: function subscribe(onNext, onError) {
      this._onNextSubscribers.push(onNext);
      this._onErrorSubscribers.push(onError);

      return function dispose() {
        this._onNextSubscribers = this._onNextSubscribers.filter(function (subscriber) {
          return subscriber !== onNext;
        });
        this._onErrorSubscribers = this._onErrorSubscribers.filter(function (subscriber) {
          return subscriber !== onError;
        });
      };
    }

    /**
     * Builds a searchable index of a set of resources.
     *
     * @param fieldNamesOrIndexFunction This value is passed to reduxSearch() factory during initialization
     *   It is either an Array of searchable fields (to be auto-indexed)
     *   Or a custom index function to be called with a :resources object and an :indexDocument callback
     * @param resourceName Uniquely identifies the resource (eg. "databases")
     * @param resources Map of resource uid to resource (Object)
     * @param state State object to be passed to custom resource-indexing functions
     */

  }, {
    key: 'indexResource',
    value: function indexResource(_ref2) {
      var fieldNamesOrIndexFunction = _ref2.fieldNamesOrIndexFunction,
          resourceName = _ref2.resourceName,
          resources = _ref2.resources,
          state = _ref2.state;

      // If this resource has already been indexed,
      // Terminate the web worker before re-indexing.
      // This prevents a memory leak (see issue #70).
      var previousSearch = this._resourceToSearchMap[resourceName];
      if (previousSearch !== undefined) {
        previousSearch.terminate();
      }

      var search = new _jsWorkerSearch2.default({
        caseSensitive: this._caseSensitive,
        indexMode: this._indexMode,
        matchAnyToken: this._matchAnyToken,
        tokenizePattern: this._tokenizePattern
      });

      if (Array.isArray(fieldNamesOrIndexFunction)) {
        if (resources.forEach instanceof Function) {
          resources.forEach(function (resource) {
            fieldNamesOrIndexFunction.forEach(function (field) {
              search.indexDocument(resource.id, resource[field] || '');
            });
          });
        } else {
          var _loop = function _loop() {
            var resource = resources[key];
            fieldNamesOrIndexFunction.forEach(function (field) {
              search.indexDocument(resource.id, resource[field] || '');
            });
          };

          for (var key in resources) {
            _loop();
          }
        }
      } else if (fieldNamesOrIndexFunction instanceof Function) {
        fieldNamesOrIndexFunction({
          indexDocument: search.indexDocument,
          resources: resources,
          state: state
        });
      } else {
        throw Error('Expected resource index to be either an Array of fields or an index function');
      }

      this._resourceToSearchMap[resourceName] = search;
    }

    /**
     * Searches a resource and returns a Promise to be resolved with an array of uids that match the search string.
     * Upon completion (or failure) this method also notifies all current subscribers.
     *
     * @param resourceName Uniquely identifies the resource (eg. "databases")
     * @param text Search string
     */

  }, {
    key: 'performSearch',
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(resourceName, text) {
        var search, result;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                search = this._resourceToSearchMap[resourceName];
                _context.next = 4;
                return search.search(text);

              case 4:
                result = _context.sent;


                this._notifyNext({
                  result: result,
                  text: text,
                  resourceName: resourceName
                });

                return _context.abrupt('return', result);

              case 9:
                _context.prev = 9;
                _context.t0 = _context['catch'](0);

                this._notifyError(_context.t0);

                throw _context.t0;

              case 13:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[0, 9]]);
      }));

      function performSearch(_x2, _x3) {
        return _ref3.apply(this, arguments);
      }

      return performSearch;
    }()

    /** Notify all subscribes of :onError */

  }, {
    key: '_notifyError',
    value: function _notifyError(error) {
      this._onErrorSubscribers.forEach(function (subscriber) {
        return subscriber(error);
      });
    }

    /** Notify all subscribes of :onNext */

  }, {
    key: '_notifyNext',
    value: function _notifyNext(data) {
      this._onNextSubscribers.forEach(function (subscriber) {
        return subscriber(data);
      });
    }
  }]);
  return SubscribableSearchApi;
}();

exports.default = SubscribableSearchApi;