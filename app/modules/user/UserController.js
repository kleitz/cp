angular.module('tcp').controller('UserController', [
    '$scope',
    '$routeParams',
    'NavigationService',
    'ServicesService',
    'utils',
    'i18n',
    function ($scope, $routeParams, NavigationService, ServicesService, utils, i18n) {
        'use strict';

        $scope.user = {};
        $scope.i18n = i18n;

        /**
         * @param {String} id
         * @return {Promise}
         */
        function load(id) {
            return ServicesService.query.users.retrieve(id).then(function (user) {
                window.user=
                $scope.user = user;
                $scope.user.$summary = utils.summaryze(user.summary);
                $scope.user.$followers_count = 0;
                $scope.user.$following_count = 0;
            });
        }

        $scope.userPage = function () {
            load($routeParams.guid);
        };

        $scope.loadUser = function (id) {
            load(id);
        };

        $scope.gotoUser = function (id) {
            NavigationService.user(id);
        };

        if ($routeParams.guid) {
            $scope.userPage();
        }
    }
]);
