import * as _ from 'lodash';
import * as moment from 'moment/moment';
import * as Cookie from 'js-cookie';
import { EventEmitter2 } from 'eventemitter2';
import * as utils from './services/Utilities';
import { Cache, LocalStorageListCache } from 'jtils/dist/cache';
import * as jQuery from 'jquery';
import * as analytics from 'universal-analytics/index';

module tcp {
    const DEBUGGING: Boolean = (<any>window).DEBUGGING;
    const ERRORED: Boolean = (<any>window).ERRORED;

    var deps: Array<string> = ['ngRoute', 'ngAria', 'ngAnimate'];
    var Visitor = !DEBUGGING ? analytics(TCP_BUILD_CONFIG.analytics.gaid) :
        analytics(TCP_BUILD_CONFIG.analytics.gaid).debug();

    if (DEBUGGING) {
        deps.push('rector');
    }

    moment.locale(navigator.userLanguage || navigator.language);
    angular.module('tcp', deps);

    angular.module('tcp')
        .constant('CONFIG', TCP_BUILD_CONFIG)
        .constant('DEBUGGING', DEBUGGING)
        .constant('ERRORED', ERRORED);

    angular.module('tcp')
        .constant('RUNTIME', {
            locale: 'en-US',
        })
        .constant('DOMAIN', {
            model: {
                company: 'company',
                company_props: {
                    summary: 'summary',
                    wikipedia_url: 'wikipedia_url',
                    website_url: 'website_url',
                },

                tag: 'tag',

                event: 'event',
                event_props: {
                    sentiments: {
                        neutral: 'neutral',
                    },
                    type: {
                        company_created: 'company_created'
                    }
                },
            }
        });

    angular.module('tcp')
        .value('Cache', Cache)
        .value('Cookie', Cookie)
        .value('EventEmitter2', EventEmitter2)
        .value('RecentSearches', new LocalStorageListCache('tcp:searches', 5))
        .value('i18n', i18n) // global
        .value('jQuery', jQuery)
        .value('lodash', _)
        .value('moment', moment)
        .value('utils', utils)
        .value('Visitor', Visitor);

    angular.module('tcp').config([
        '$routeProvider',
        '$locationProvider',
        '$compileProvider',
        '$animateProvider',
        function ($routeProvider, $locationProvider, $compileProvider, $animateProvider) {
            $animateProvider.classNameFilter(/ng-animated/);
            $locationProvider.html5Mode(true);
            $compileProvider.debugInfoEnabled(DEBUGGING);

            let IdSetterController = ['$scope', '$routeParams', function ($scope, $routeParams) {
                $scope.id = $routeParams.id;
            }];

            let PropSetterController = (props: string[] = [], query: string[] = []) => ['$scope', '$routeParams', '$location', function ($scope, $routeParams, $location) {
                props.map(prop => $scope[prop] = $routeParams[prop]);
                query.map(prop => $scope[prop] = $location.search()[prop]);
            }];

            let UserCheck = ['Session', Session =>
                Session.refresh()];

            let PageView = ['Visitor', Visitor =>
                Visitor.pageview(window.location.pathname + window.location.search).send()];

            if (DEBUGGING) {
                $routeProvider.when('/guide', {
                    resolve: { PageView },
                    templateUrl: '/app/views/guide.html',
                });
            }

            $routeProvider.when('/', {
                resolve: { PageView },
                template:
                    '<div class="site-content page--home">' +
                    '    <search form="true"></search>' +
                    '    <p class="copy--large header-spacing--top" i18n="common/intro"></p>' +
                    '</div>'
            });

            $routeProvider.when('/search', {
                resolve: { PageView },
                reloadOnSearch: false,
                controller: PropSetterController([], ['q']),
                template:
                    '<div class="site-content">' +
                    '    <search query="{{q}}"></search>' +
                    '</div>'
            });

            $routeProvider.when('/user', {
                resolve: { PageView },
                redirectTo: '/user/me'
            });

            $routeProvider.when('/user/me', {
                template: '<user class="site-content" id="{{id}}"></user>',
                resolve: { UserCheck, PageView },
                controller: ['$scope', 'Session', function ($scope, Session) {
                    $scope.id = Session.USER.id;
                }]
            });

            $routeProvider.when('/user/notifications', {
                template: '<notifications class="site-content"></notifications>',
                resolve: { UserCheck, PageView }
            });

            $routeProvider.when('/user/:id', {
                resolve: { PageView },
                template: '<user class="site-content" id="{{id}}"></user>',
                controller: IdSetterController
            });

            $routeProvider.when('/company/id/:id', {
                template: '<company class="site-content" id="{{id}}"></company>',
                controller: PropSetterController(['id']),
                resolve: { UserCheck, PageView }
            });

            $routeProvider.when('/company/:guid?', {
                template: '<company class="site-content" guid="{{guid}}" create="{{create}}"></company>',
                controller: PropSetterController(['guid'], ['create']),
                resolve: { UserCheck, PageView }
            });

            $routeProvider.otherwise({
                resolve: { PageView },
                controller: ['$scope', 'ERRORED', function ($scope, ERRORED) { $scope.ERRORED = ERRORED; }],
                template:
                    '<div class="site-content">' +
                        '<message ng-if="!ERRORED" type="error" i18n="common/not_found"></message>' +
                        '<message ng-if="ERRORED" type="error" i18n="common/error_loading"></message>' +
                    '</div>'
            });
        }
    ]);
}