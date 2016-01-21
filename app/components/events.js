angular.module('tcp').directive('events', [
    '$q',
    'lodash',
    'utils',
    'ServicesService',
    function ($q, lodash, utils, ServicesService) {
        'use strict';

        /**
         * @param {Event} ev
         * @return {Object}
         */
        function visible_event(ev) {
            return {
                id: ev.id,
                title: utils.ellipsis(ev.title, 100),
                date: new Date(ev.date).valueOf(),
                sentiment: ev.sentiment,
                source_count: ev.sources.length
            };
        }

        /**
         * @param {String} event_id
         * @return {Promise}
         */
        function get_event(event_id) {
            return ServicesService.query.events.retrieve(event_id, ['sources']);
        }

        /**
         * XXX should be one request
         * @param {String} company_id
         * @return {Promise}
         */
        function get_events(company_id) {
            return ServicesService.query.companies.events.retrieve(company_id).then(function (events) {
                return $q.all(
                    lodash
                        .chain(events)
                        .map('event_id')
                        .map(get_event)
                        .value()
                );
            });
        }

        /**
         * @param {String} label
         * @return {String}
         */
        function generate_template_event_content(label) {
            return [
                '<span class="events__event__content events__event__content--', label, '">',
                '    <table>',
                '        <tr>',
                '            <td>',
                '                <i18n class="events__event__date" date="{{::event.date}}" format="YYYY"></i18n>',
                '            </td>',
                '            <td>',
                '                <span class="events__event__title">',
                '                    <span>{{::event.title}}</span>',
                '                    (<span i18n="company/source_count" data="{count: event.source_count}"></span>)',
                '                </span>',
                '            </td>',
                '        </tr>',
                '    </table>',
                '</span>',
            ].join('');
        }

        function controller($scope) {
            $scope.vm = {
                loading: false
            };

            /**
             * @return {Promise}
             */
            $scope.load = function () {
                $scope.vm.loading = true;

                return get_events($scope.id)
                    .then(lodash.curryRight(lodash.map, 2)(visible_event))
                    .then(lodash.curryRight(lodash.sortBy, 2)('date'))
                    .then(utils.scope.set($scope, 'events'))
                    .then(function (evs) {
                        $scope.events.reverse();
                        $scope.vm.loading = false;
                        return evs;
                    });
            };

            $scope.api = $scope.api || {};
            $scope.api.refresh = $scope.load;
        }

        return {
            replace: true,
            controller: ['$scope', controller],
            scope: {
                api: '=',
                id: '@',
            },
            template: [
                '<div class="events can-load" ng-class="{loading: vm.loading}" ng-init="load()">',
                '    <div class="center-aligned loading__only padding-top-large" i18n="common/loading_events"></div>',
                '    <div ng-repeat="event in events track by event.id" ',
                '        class="events__event animated fadeInUp" ',
                '        style="animation-delay: {{$index * .1}}s">',

                generate_template_event_content('left'),
                '        <div style="background-image: url(/assets/images/avatar/avatar-white.svg)" ',
                '            class="events__event__icon events__event__icon--{{::event.sentiment}}"></div>',
                generate_template_event_content('right'),

                '    </div>',
                '    <div class="events__line animated fadeIn"></div>',
                '</div>'
            ].join('')
        };
    }
]);
