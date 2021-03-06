angular.module('tcp').directive('trending', [
    'Services',
    'Navigation',
    'utils',
    'lodash',
    function (Services, Navigation, utils, lodash) {
        'use strict';

        /**
         * @param {Object} obj
         * @return {Boolean}
         */
        function has_id(obj) {
            return !!obj.id;
        }

        /**
         * @param {Object} obj
         * @return {String}
         */
        function by_id(obj) {
            return obj.id;
        }

        /**
         * @param {Angular.Scope} $scope*
         */
        function controller($scope) {
            $scope.vm = {};
            $scope.nav = Navigation;

            $scope.nav_event = function (ev) {
                if (ev.companies && ev.companies[0]) {
                    Navigation.company_by_id_event(ev.companies[0].id, ev.id);
                } else if (ev.tags && ev.tags[0]) {
                    Navigation.tag_by_id_event(ev.tags[0].id, ev.id);
                }
            };

            Services.query.stats.trending()
                .then(utils.scope.set($scope, 'vm.trending'))
                .then(function (data) {
                    lodash.each(data, function (row) {
                        row.tags = lodash.filter(lodash.uniqBy(row.tags, by_id), has_id);
                        row.companies = lodash.filter(lodash.uniqBy(row.companies, by_id), has_id);
                    });

                    return data;
                });
        }

        return {
            replace: true,
            controller: ['$scope', controller],
            template: [
                '<div class="trending-component">',
                '    <ol>',
                '        <li class="trending--item" ng-repeat="item in vm.trending">',
                '            <p ng-click="nav_event(item)">{{item.title}}</p>',
                '            <tags show-hide="false">',
                '                <tag class="keyword" label="{{company.label}}"',
                '                    ng-click="nav.company_by_id(company.id)"',
                '                    ng-repeat="company in item.companies"></tag>',
                '                <tag class="keyword" label="{{tag.label}}"',
                '                    ng-click="nav.tag(tag.id)"',
                '                    ng-repeat="tag in item.tags"></tag>',
                '            <tags>',
                '        </li>',
                '    </ol>',
                '</div>',
            ].join('')
        };
    }
]);
