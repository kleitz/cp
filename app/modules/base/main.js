'use strict';

(function () {
    var store = new Firebase('https://aryel---rtfm.firebaseio.com/tcp');

    angular.module('tcp', ['ngRoute', 'firebase', 'wikipedia', 'extract']);
    angular.module('tcp').value('lodash', _);
    angular.module('tcp').value('store', store);
    angular.module('tcp').value('postStore', store.child('post'));
    angular.module('tcp').value('userStore', store.child('user'));
    angular.module('tcp').value('companyStore', store.child('company'));
    angular.module('tcp').value('tagStore', store.child('tag'));
})();