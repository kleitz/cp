angular.module('tcp').config([
    '$routeProvider',
    '$locationProvider',
    function ($routeProvider, $locationProvider) {
        'use strict';

        $routeProvider.when('/dev/guide', {
            templateUrl: '/app/modules/dev/guide.html',
            controller: 'devController'
        });

        $routeProvider.when('/', {
            templateUrl: '/app/modules/search/search.html',
            controller: 'searchController'
        });

        $routeProvider.when('/search', {
            templateUrl: '/app/modules/search/search.html',
            controller: 'searchController'
        });

        $routeProvider.when('/company/:guid?', {
            templateUrl: '/app/modules/company/company.html',
            controller: 'companyController'
        });

        $routeProvider.when('/company/:companyGuid/post/:guid?', {
            templateUrl: '/app/modules/post/post.html',
            controller: 'postController'
        });

        $routeProvider.otherwise({
            templateUrl: '/app/modules/base/404.html',
        });

        $locationProvider.html5Mode(true);
    }
]);
