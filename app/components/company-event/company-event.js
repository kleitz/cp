angular.module('tcp').directive('companyEvent', [
    '$q',
    '$http',
    'lodash',
    'utils',
    'keyword',
    function ($q, $http, _, utils, keyword, events, companyEvents) {
        'use strict';

        function controller($scope) {
            var prev_sources;

            $scope.vm = {};

            $scope.ev = {
                title: '',
                sources: [],
            };

            $scope.save = save;
            $scope.$watch('ev.sources', fetchSources, true);

// XXX // $scope._ = { range: _.range };
window.ev=$scope.ev;
setTimeout(function () {
$scope.ev.sources.push({url: 'http://www.bbc.com/news/world-europe-34742273'});
// $scope.ev.sources.push({url: 'http://www.bbc.com/news/world-australia-34762988'});
// $scope.ev.sources.push({url: 'http://www.bbc.com/news/world-europe-34759570'});
$scope.$apply();
}, 500);

            function save() {
                // events.put($scope.ev, ['date', 'description', 'keywords', 'sources', 'title'])
                //     .then(function () { $scope.onSave(); })
                //     .catch(function () { console.error('error saving', $scope.ev); });
            }

            /**
             * @param {String} url
             * @return {Promise}
             */
            function extractPage(url) {
                return $http.get('/extract/page?url=' + encodeURIComponent(url));
            }

            /**
             * @param {Source} source
             * @return {Promise<extract.PageExtract>}
             */
            function fetchContent(source) {
                return extractPage(source.url).then(function (content) {
                    content.data.$source = source;
                    return content.data;
                });
            }

            /**
             * @param {Boolean} [loading] (false: false, *: true)
             */
            function isLoading(loading) {
                $scope.vm.fetchingSource = loading !== false;
            }

            /**
             * @param {Source[]} update
             * @param {Source[]} prev
             */
            function fetchSources(update, prev) {
                $q.all(
                    _(update)
                        .difference(prev)
                        .each(isLoading)
                        .map(fetchContent)
                        .value()
                ).then(function (contents) {
                    isLoading(false);
                    _.each(contents, populateSourceFromContent);
                    populateEvent($scope.ev, contents[0]);
                });
            }

            /**
             * @param {Event} ev
             * @param {extract.PageExtract} [content]
             * @param {Boolean} [overwrite] (default: false)
             */
            function populateEvent(ev, content, overwrite) {
                function get(ev_field, content_field) {
                    var orig_val = ev[ev_field];
                    return orig_val && !overwrite ? orig_val :
                        content[content_field || ev_field];
                }

                content = utils.def(content, {});

                ev.title = get('title');
                ev.date = get('date', 'published');
                ev.$date = new Date(get('date', 'published'));
            }

            /**
             * @param {Source} source
             * @param {extract.PageExtract} content
             * @return {Source}
             */
            function populateSource(source, content) {
                source.title = content.title;
                source.date = content.published;
                source.$date = new Date(content.published);
                source.description = content.description;
            }

            /**
             * @param {Source} source
             * @return {Source}
             */
            function populateSourceFromContent(content) {
                return populateSource(content.$source, content);
            }
        }

        return {
            replace: true,
            templateUrl: '/app/components/company-event/company-event.html',
            controller: ['$scope', controller],
            scope: {
                tiedTo: '=',
                onCancel: '&',
                onSave: '&'
            }
        };
    }
]);