angular.module('tcp').directive('tcpTopmost', [
    '$interval',
    '$timeout',
    'Navigation',
    'Services',
    'Session',
    'utils',
    'Cookie',
    'lodash',
    function ($interval, $timeout, Navigation, Services, Session, utils, Cookie, _) {
        'use strict';

        var SYNC_INTERVAL = 300000;

        function link() {
            angular.element(document.body).on('mousemove', function () {
                link.active = true;
            });
        }

        function controller($rootScope, $scope) {
            $scope.user = null;
            $scope.session = get_session();

            $scope.notifications = {
                show: null,

                // from notifications component
                repaint: _.noop,
            };

            $scope.actions = {
                show: null
            };

            $scope.login = {
                // from popover
                hide: null,
                show: null
            };

            $scope.nav = {
                home: Navigation.home,
                search: Navigation.search,
                company: Navigation.company,
                profile: Navigation.user_me,
            };

            $scope.show_notifications = function () {
                $scope.notifications.show = true;
                $timeout($scope.notifications.repaint, 100);
            };

            $scope.with_linkedin = login_with_linkedin;
            $scope.login = login;
            $scope.logout = logout;

            $scope.$watchCollection('session', cache_session);
            Session.on(Session.EVENT.LOGIN, update_current_user);
            Session.on(Session.EVENT.LOGIN, get_notifications);
            Session.on(Session.EVENT.ERROR, clear_session);
            Session.on(Session.EVENT.LOGOUT, clear_session);
            Session.on(Session.EVENT.NOTIFY, get_notifications);

            sync();
            $interval(sync_if_active, SYNC_INTERVAL);
            $rootScope.$on('$locationChangeStart', update_page_view_status);

            function login_with_linkedin() {
                console.info('loggin in with linkedin');
                $scope.login.hide();
                Session.login(Session.PROVIDER.LINKEDIN);
            }

            function login() {
                $scope.login.show();
            }

            function logout() {
                console.info('logging out');
                Session.logout();
                $scope.actions.show = false;
            }

            /**
             * caches user information
             */
            function update_current_user() {
                $scope.session.email = Session.USER.email;
                $scope.session.logged_in = true;
            }

            /**
             * @return {Promise}
             */
            function get_notifications() {
                return Services.notification.get().then(function (items) {
                    $scope.session.notification_count = _.filter(items, { viewed: false }).length;
                    $scope.session.has_notifications = items.length;
                });
            }

            /**
             * @return {void}
             */
            function sync_if_active() {
                console.log('sync_if_active check');
                if (link.active) {
                console.log('sync_if_active running');
                    sync();
                    link.active = false;
                }
            }

            /**
             * @return {void}
             */
            function sync() {
                Session.refresh().then(function (user) {
                    $scope.user = user;

                    if (user && user.id) {
                        get_notifications();
                    }
                });
            }

            /**
             * resets session
             */
            function clear_session() {
                $scope.session = {};
            }

            /**
             * @param {Object} session (see $scope.session)
             */
            function cache_session(session) {
                console.info('caching %o in session', Object.keys(session));
                return Cookie.set('client:session', session);
            }

            /**
             * @return {Object}
             */
            function get_session() {
                return Cookie.getJSON('client:session') || {};
            }

            function update_page_view_status() {
                $scope.nav.search.active = Navigation.one_of([
                    Navigation.BASES.SEARCH,
                ]);

                $scope.nav.search.included = Navigation.one_of([
                    Navigation.BASES.HOME,
                    Navigation.BASES.SEARCH,
                ]);
            }
        }

        return {
            replace: true,
            link: link,
            controller: ['$rootScope', '$scope', controller],
            template: [
                '<div class="topmost">',
                '    <popover class="popover--fullscreen" api="login">',
                '        <div class="site-content site-content--no-header center-align">',
                '            <h2 i18n="common/welcome_beta"></h2>',
                '            <p class="margin-bottom-large" i18n="common/by_signing_in"></p>',

                '            <button class="button--social-linkedin" ng-click="with_linkedin()">',
                '                <img alt="" src="/assets/images/linkedin.png" />',
                '                <span i18n="admin/sing_in_with_service"',
                '                    data="{service: \'LinkedIn\'}"></span>',
                '            </button>',
                '            <button class="no-wrap button--link margin-left-small"',
                '                ng-click="login.hide()" i18n="admin/cancel"></button>',
                '        </div>',
                '    </popover>',

                '    <header class="site-content--span">',
                '        <img class="tcp-logo" alt="cp-logo" ng-click="nav.home()"',
                '            src="/assets/images/brand/consumrproject-black-stamp.png" />',
                '        <img class="tcp-long-logo" alt="consumrproject-logo"',
                '            src="/assets/images/brand/consumrproject-text.png" />',

                '        <button ng-if="!session.logged_in" ng-click="login()"',
                '            i18n="admin/sing_in_or_up" class="right animated fadeIn"></button>',

                '        <avatar',
                '            ng-if="session.logged_in"',
                '            class="right no-outline"',
                '            ng-click="actions.show = true"',
                '            email="{{session.email}}"',
                '            data-main-user-avatar',
                '        ></avatar>',

                '        <button class="right margin-right-small animated fadeIn button--circlular"',
                '            data-main-user-notifications-counter ng-click="show_notifications()"',
                '            ng-if="session.logged_in && session.notification_count">{{session.notification_count}}</button>',

                '        <button class="right margin-right-small animated fadeIn button--circlular button--unselected imgview imgview--bell"',
                '            data-main-user-notifications-counter',
                '            ng-if="session.logged_in && !session.has_notifications"></button>',

                '        <button class="right margin-right-small animated fadeIn button--circlular button--unselected imgview imgview--bell"',
                '            data-main-user-notifications-counter ng-click="show_notifications()"',
                '            ng-if="session.logged_in && session.has_notifications && !session.notification_count"></button>',

                '        <button class="search-button right margin-right-small animated fadeIn screen-small-only"',
                '            ng-click="nav.search()"></button>',

                '        <search class="desktop-only right margin-right-small"',
                '            form="true" ng-if="!nav.search.included"></search>',
                '    </header>',

                '    <popover',
                '        anchored',
                '        anchored-element="\'[data-main-user-notifications-counter]\'"',
                '        anchored-show="notifications.show"',
                '        anchored-placement="bottom-right"',
                '        anchored-top-offset="10"',
                '        anchored-arrow="true"',
                '        anchored-auto-hide="true"',
                '    >',
                '        <notifications ng-if="user.id && session.logged_in" api="notifications"></notifications>',
                '    </popover>',

                '    <popover',
                '        anchored',
                '        anchored-element="\'[data-main-user-avatar]\'"',
                '        anchored-show="actions.show"',
                '        anchored-placement="bottom-right"',
                '        anchored-top-offset="10"',
                '        anchored-arrow="true"',
                '        anchored-auto-hide="true"',
                '    >',
                '        <popover-item ng-click="nav.company(); actions.show = false;" i18n="admin/add_company"></popover-item>',
                '        <popover-separator></popover-separator>',
                '        <popover-item ng-click="nav.profile(); actions.show = false;" i18n="pages/profile"></popover-item>',
                '        <popover-item ng-click="logout()" i18n="admin/logout"></popover-item>',
                '    </popover>',
                '</div>'
            ].join('')
        };
    }
]);
