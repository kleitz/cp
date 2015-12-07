angular.module('tcp').service('ServicesService', ['$http', 'lodash', function ($http, lodash) {
    'use strict';

    var extractService = {},
        searchService = {},
        queryService = {};

    /**
     * @param {String} model
     * @param {String} id
     * @return {String}
     */
    function url(model, id) {
        return '/service/query/' + lodash.filter(arguments).join('/');
    }

    /**
     * @param {String} model
     * @param {Array} [associataions]
     * @return {Object}
     */
    function crud(model, associations) {
        return lodash.reduce(associations, function (methods, assoc) {
            methods[assoc] = {
                create: function (parent_id, data) {
                    return $http.post(url(model, parent_id, assoc), data);
                },
                retrieve: function (parent_id, id) {
                    return $http.get(url(model, parent_id, assoc, id));
                },
                update: function (parent_id, id, data) {
                    return $http.put(url(model, parent_id, assoc, id), data);
                },
                delete: function (parent_id, id) {
                    return $http.delete(url(model, parent_id, assoc, id));
                }
            };
            return methods;
        }, {
            create: function (data) {
                return $http.post(url(model), data);
            },
            retrieve: function (id) {
                return $http.get(url(model, id));
            },
            update: function (id, data) {
                return $http.put(url(model, id), data);
            },
            delete: function (id) {
                return $http.delete(url(model, id));
            },
        });
    }

    queryService = {
        UUID: '$UUID',
        companies: crud('companies', ['followers'])
    };

    /**
     * @param {String} url
     * @return {Promise}
     */
    extractService.page = function (url) {
        return $http.get('/service/extract/page?url=' + encodeURIComponent(url));
    };

    /**
     * interface SearchConfiguration {
     *     index: String (default: entity)
     *     type: String (default: undefined)
     *     size: Number (default: 50)
     *     from: Number (default: 0)
     * }
     *
     * @param {String} str
     * @param {SearchConfiguration} [config]
     * @return {Promise}
     */
    searchService.fuzzy = function (str, config) {
        config = config || {};
        return $http.get('/service/search/fuzzy', {
            params: {
                query: str,
                index: config.index || 'entity',
                type: config.type,
                size: config.size || 50,
                from: config.from || 0
            }
        });
    };

    return {
        extract: extractService,
        search: searchService,
        query: queryService
    };
}]);
