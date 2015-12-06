angular.module('tcp').controller('CompanyController', [
    '$scope',
    '$routeParams',
    'NavigationService',
    'Auth',
    'utils',
    'wikipedia',
    'companies',
    'logger',
    'lodash',
    function ($scope, $routeParams, NavigationService, Auth, utils, wikipedia, companies, logger, _) {
        'use strict';

        var log = logger('company');

        $scope.company = {};
        $scope.existing = !!$routeParams.guid;
        $scope.vm = { add_event: {} };

        function normalizeCompany() {
            if (!$scope.company) {
                return;
            }

            $scope.company.followedBy = $scope.company.followedBy || [];
            $scope.company.$summaryParts = !$scope.company.summary ? [] :
                $scope.company.summary.split('\n');
        }

        /**
         * @param {String} name of company
         * @return {Promise}
         */
        function fetchCompanySummary(name) {
            if (!name) {
                return;
            }

            $scope.vm.fetchingCompanySummary = true;

            // XXX error state
            wikipedia.extract(name).then(function (extract) {
                $scope.vm.fetchingCompanySummary = false;
                $scope.company.name = extract.title;
                $scope.company.summary = extract.extract_no_refs;
                normalizeCompany();
                $scope.$apply();
            });
        }

        /**
         * @param {String} id
         * @return {Promise}
         */
        function load(id) {
            return companies.get(id).then(function (company) {
                $scope.company = company;
                $scope.company.$loaded = true;
                normalizeCompany();

                if (!$scope.company) {
                    log.error('company not found');
                }

                $scope.$apply();
            });
        }

        function saveSuccessHandler() {
            var guid = $scope.company.guid;
            NavigationService.company(guid);
            $scope.$apply();
            log('saved', guid);
        }

        function saveErrorHandler(err) {
            log.error('save error', err);
        }

        $scope.onStopFollowing = function () {
            if (!Auth.USER) {
                log.error('you must be logged in to follow companies');
                return;
            }

            if (_.contains($scope.company.followedBy, Auth.USER.uid)) {
                $scope.company.followedBy = _.without($scope.company.followedBy, Auth.USER.uid);
                companies.store.child($scope.company.guid).child('followedBy')
                    .set($scope.company.followedBy);
            }
        };

        $scope.onStartFollowing = function () {
            if (!Auth.USER) {
                log.error('you must be logged in to follow companies');
                return;
            }

            if (!_.contains($scope.company.followedBy, Auth.USER.uid)) {
                $scope.company.followedBy.push(Auth.USER.uid);
                companies.store.child($scope.company.guid).child('followedBy')
                    .set($scope.company.followedBy);
            }
        };

        $scope.save = function () {
            if (!Auth.USER) {
                log.info('login required for action');
                return;
            }

            if (!$scope.company.name) {
                log.info('company name is required');
                return;
            }

            // first save
            if (!$scope.company.guid) {
                $scope.company.guid = utils.simplify($scope.company.name);
                $scope.company.createdBy = Auth.USER.guid;
                $scope.company.followedBy = [Auth.USER.guid];
            }

            companies.put($scope.company, ['name', 'summary', 'guid', 'createdBy', 'followedBy'])
                .then(saveSuccessHandler)
                .catch(saveErrorHandler);
        };

        $scope.companyPage = function () {
            if ($routeParams.guid) {
                load($routeParams.guid);
            } else {
                $scope.$watch('company.name', fetchCompanySummary);
            }
        };

        $scope.loadCompany = function (id) {
            load(id);
        };

        $scope.gotoCompany = function (id) {
            NavigationService.company(id);
        };
    }
]);
