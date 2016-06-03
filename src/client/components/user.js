angular.module('tcp').directive('user', [
    'Services',
    'Session',
    'utils',
    '$q',
    function (Services, Session, utils, $q) {
        'use strict';

        var STAT_MAP = {},
            STAT_CHILD_MAP = {};

        var STAT_CONTRIBUTIONS = 1,
            STAT_FOLLOWING = 2,
            STAT_FOLLOWERS = 3,
            STAT_FAVORITES = 4;

        var STAT_CONTRIBUTIONS_EVENTS = 5,
            STAT_CONTRIBUTIONS_QUESTIONS = 6,
            STAT_CONTRIBUTIONS_COMPANIES = 7,
            STAT_CONTRIBUTIONS_SOURCES = 8,
            STAT_CONTRIBUTIONS_REVIEWS = 9;

        var STAT_FOLLOWING_COMPANIES = 10,
            STAT_FOLLOWING_USERS = 11,
            STAT_FOLLOWING_TAGS = 12;

        STAT_MAP[STAT_CONTRIBUTIONS] = STAT_CONTRIBUTIONS;
        STAT_MAP[STAT_CONTRIBUTIONS_COMPANIES] = STAT_CONTRIBUTIONS;
        STAT_MAP[STAT_CONTRIBUTIONS_EVENTS] = STAT_CONTRIBUTIONS;
        STAT_MAP[STAT_CONTRIBUTIONS_QUESTIONS] = STAT_CONTRIBUTIONS;
        STAT_MAP[STAT_CONTRIBUTIONS_REVIEWS] = STAT_CONTRIBUTIONS;
        STAT_MAP[STAT_CONTRIBUTIONS_SOURCES] = STAT_CONTRIBUTIONS;
        STAT_MAP[STAT_FOLLOWING] = STAT_FOLLOWING;
        STAT_MAP[STAT_FOLLOWING_COMPANIES] = STAT_FOLLOWING;
        STAT_MAP[STAT_FOLLOWING_TAGS] = STAT_FOLLOWING;
        STAT_MAP[STAT_FOLLOWING_USERS] = STAT_FOLLOWING;
        STAT_MAP[STAT_FAVORITES] = STAT_FAVORITES;
        STAT_MAP[STAT_FOLLOWERS] = STAT_FOLLOWERS;

        STAT_CHILD_MAP[STAT_CONTRIBUTIONS] = STAT_CONTRIBUTIONS_EVENTS;
        STAT_CHILD_MAP[STAT_CONTRIBUTIONS_COMPANIES] = STAT_CONTRIBUTIONS_COMPANIES;
        STAT_CHILD_MAP[STAT_CONTRIBUTIONS_EVENTS] = STAT_CONTRIBUTIONS_EVENTS;
        STAT_CHILD_MAP[STAT_CONTRIBUTIONS_QUESTIONS] = STAT_CONTRIBUTIONS_QUESTIONS;
        STAT_CHILD_MAP[STAT_CONTRIBUTIONS_REVIEWS] = STAT_CONTRIBUTIONS_REVIEWS;
        STAT_CHILD_MAP[STAT_CONTRIBUTIONS_SOURCES] = STAT_CONTRIBUTIONS_SOURCES;
        STAT_CHILD_MAP[STAT_FOLLOWING] = STAT_FOLLOWING_COMPANIES;
        STAT_CHILD_MAP[STAT_FOLLOWING_COMPANIES] = STAT_FOLLOWING_COMPANIES;
        STAT_CHILD_MAP[STAT_FOLLOWING_TAGS] = STAT_FOLLOWING_TAGS;
        STAT_CHILD_MAP[STAT_FOLLOWING_USERS] = STAT_FOLLOWING_USERS;
        STAT_CHILD_MAP[STAT_FAVORITES] = STAT_FAVORITES;
        STAT_CHILD_MAP[STAT_FOLLOWERS] = STAT_FOLLOWERS;

        function controller($scope) {
            $scope.S_EMPTY = '';

            $scope.STAT_CONTRIBUTIONS = STAT_CONTRIBUTIONS;
            $scope.STAT_FAVORITES = STAT_FAVORITES;
            $scope.STAT_FOLLOWERS = STAT_FOLLOWERS;
            $scope.STAT_FOLLOWING = STAT_FOLLOWING;

            $scope.STAT_CONTRIBUTIONS_EVENTS = STAT_CONTRIBUTIONS_EVENTS;
            $scope.STAT_CONTRIBUTIONS_QUESTIONS = STAT_CONTRIBUTIONS_QUESTIONS;
            $scope.STAT_CONTRIBUTIONS_COMPANIES = STAT_CONTRIBUTIONS_COMPANIES;
            $scope.STAT_CONTRIBUTIONS_SOURCES = STAT_CONTRIBUTIONS_SOURCES;
            $scope.STAT_CONTRIBUTIONS_REVIEWS = STAT_CONTRIBUTIONS_REVIEWS;

            $scope.STAT_FOLLOWING_COMPANIES = STAT_FOLLOWING_COMPANIES;
            $scope.STAT_FOLLOWING_USERS = STAT_FOLLOWING_USERS;
            $scope.STAT_FOLLOWING_TAGS = STAT_FOLLOWING_TAGS;

            $scope.vm = {
                stats: null,
                cur_stat: null,
                exp_stat: null,
                stats_data: [],
                followed_by_me: null,
            };

            /**
             * @param {String} id
             * @return {Promise}
             */
            function load(id) {
                return Services.query.users.retrieve(id, ['followers']).then(function (user) {
                    $scope.vm.user = user;
                    $scope.vm.followed_by_me = user.followers['@meta'].instead.includes_me;

                    Services.query.users.stats(id)
                        .then(utils.scope.set($scope, 'vm.stats'))
                        .then(utils.scope.set($scope, 'vm.cur_stat', STAT_CONTRIBUTIONS))
                        .then($scope.load_stat.bind(null, STAT_CONTRIBUTIONS_EVENTS));
                });
            }

            /**
             * what can be done in this page?
             */
            function update_actionable_items() {
                $scope.vm.loggedin = !!Session.USER.id;
                $scope.vm.myself = $scope.id === Session.USER.id;
            }

            /**
             * @param {String} user_id
             * @return {Promise}
             */
            $scope.on_start_following = function (user_id) {
                utils.assert(user_id);
                utils.assert(Session.USER, 'must be logged in');
                utils.assert(Session.USER.id, 'must be logged in');

                return Services.query.users.followers.upsert(user_id, {
                    user_id: Session.USER.id
                }).then(utils.scope.set($scope, 'vm.followed_by_me', true));
            };

            /**
             * @param {String} user_id
             * @return {Promise}
             */
            $scope.on_stop_following = function (user_id) {
                utils.assert(user_id);
                utils.assert(Session.USER, 'must be logged in');
                utils.assert(Session.USER.id, 'must be logged in');

                return Services.query.users.followers.delete(user_id, Session.USER.id)
                    .then(utils.scope.set($scope, 'vm.followed_by_me', false));
            };

            $scope.load_stat = function (stat) {
                var req = $q.when([]);

                $scope.vm.cur_stat = STAT_MAP[stat];
                $scope.vm.exp_stat = STAT_CHILD_MAP[stat];

                switch (STAT_CHILD_MAP[stat]) {
                    case STAT_CONTRIBUTIONS_EVENTS:
                        req = Services.query.users.stats.contributions.events($scope.id);
                        break;
                }

                req.then(utils.scope.set($scope, 'vm.stats_data'));
            };

            if ($scope.id) {
                update_actionable_items();
                load($scope.id);
            }

            Session.on(Session.EVENT.LOGIN, update_actionable_items);
            Session.on(Session.EVENT.LOGOUT, update_actionable_items);
        }

        return {
            replace: true,
            controller: ['$scope', controller],
            scope: {
                id: '@'
            },
            template: [
                '<div>',
                '    <center ng-if="vm.user.id" class="margin-top-large">',
                '        <avatar class="avatar--block"',
                '            title="{{::vm.user.title}}" name="{{::vm.user.name}}"',
                '            email="{{::vm.user.email}}"></avatar>',

                '        <p class="uppercase" i18n="user/member_number"',
                '            data="{num: vm.user.member_number}"></p>',

                '        <div ng-invisible="vm.myself || !vm.loggedin"',
                '            class="block margin-top-xlarge margin-bottom-xlarge">',
                '            <button class="button--unselected"',
                '                ng-click="on_start_following(vm.user.id)"',
                '                ng-if="vm.followed_by_me === false"',
                '                i18n="admin/follow"></button>',
                '            <button',
                '                ng-click="on_stop_following(vm.user.id)"',
                '                ng-if="vm.followed_by_me === true"',
                '                i18n="admin/unfollow"></button>',
                '        </div>',

                '        <section ng-if="vm.stats">',
                '            <div class="snav">',
                '                <div class="snav__item" ng-click="load_stat(STAT_CONTRIBUTIONS)" i18n="user/contributions" data="{count: vm.stats.contributions || S_EMPTY}"></div>',
                '                <div class="snav__item" ng-click="load_stat(STAT_FOLLOWING)" i18n="user/following" data="{count: vm.stats.following || S_EMPTY}"></div>',
                '                <div class="snav__item" ng-click="load_stat(STAT_FOLLOWERS)" i18n="user/followers" data="{count: vm.stats.followers || S_EMPTY}"></div>',
                '                <div class="snav__item" ng-click="load_stat(STAT_FAVORITES)" i18n="user/favorites" data="{count: vm.stats.favorites || S_EMPTY}"></div>',
                '            </div>',

                '            <div class="snav" ng-show="vm.cur_stat === STAT_CONTRIBUTIONS">',
                '                <div class="snav__item" ng-click="load_stat(STAT_CONTRIBUTIONS_EVENTS)" i18n="user/contributions_events" data="{count: vm.stats.contributions_events || S_EMPTY}"></div>',
                '                <div class="snav__item" ng-click="load_stat(STAT_CONTRIBUTIONS_QUESTIONS)" i18n="user/contributions_questions" data="{count: vm.stats.contributions_questions || S_EMPTY}"></div>',
                '                <div class="snav__item" ng-click="load_stat(STAT_CONTRIBUTIONS_COMPANIES)" i18n="user/contributions_companies" data="{count: vm.stats.contributions_companies || S_EMPTY}"></div>',
                '                <div class="snav__item" ng-click="load_stat(STAT_CONTRIBUTIONS_REVIEWS)" i18n="user/contributions_reviews" data="{count: vm.stats.contributions_reviews || S_EMPTY}"></div>',
                '                <div class="snav__item" ng-click="load_stat(STAT_CONTRIBUTIONS_SOURCES)" i18n="user/contributions_sources" data="{count: vm.stats.contributions_sources || S_EMPTY}"></div>',
                '            </div>',

                '            <div class="snav" ng-show="vm.cur_stat === STAT_FOLLOWING">',
                '                <div class="snav__item" ng-click="load_stat(STAT_FOLLOWING_COMPANIES)" i18n="user/following_companies" data="{count: vm.stats.following_companies || S_EMPTY}"></div>',
                '                <div class="snav__item" ng-click="load_stat(STAT_FOLLOWING_USERS)" i18n="user/following_users" data="{count: vm.stats.following_users || S_EMPTY}"></div>',
                '                <div class="snav__item" ng-click="load_stat(STAT_FOLLOWING_TAGS)" i18n="user/following_tags" data="{count: vm.stats.following_tags || S_EMPTY}"></div>',
                '            </div>',

                '        </section>',
                '    </center>',

                '    <section class="margin-top-large">',
                '        <div ng-if="vm.exp_stat === STAT_CONTRIBUTIONS_EVENTS" ng-repeat="ev in vm.stats_data">',
                '            <span class="right margin-left-xsmall font-size-small imgview imgview--with-content imgview--bookmarks">{{::ev.bookmark_count | number}}</span>',
                '            <span class="right font-size-small imgview imgview--with-content imgview--sources">{{::ev.source_count | number}}</span>',
                '            <h2 class="margin-top-medium">{{::ev.title}}</h2>',
                '            <i18n date="{{::ev.date}}" format="D MMM, YYYY"></i18n>',
                '        </div>',
                '    </section>',
                '</div>'
            ].join('')
        };
    }
]);
