angular.module('tcp').controller('companyController', ['$scope', 'wikipedia', function ($scope, wikipedia) {
    $scope.loading = false;
    $scope.editing = true;

    /**
     * @return {Boolean}
     */
    function shouldFecthDescription() {
        return $scope.name && !$scope.description;
    }

    $scope.fetchCompanyDescription = function () {
        if (!shouldFecthDescription()) {
            return;
        }

        $scope.loading = true;
        wikipedia.extract($scope.name).then(function (page) {
            if (page && page.extract && shouldFecthDescription()) {
                $scope.description = page.extract;
            }

            $scope.loading = false;
            $scope.$apply();
        });
    };

    $scope.edit = function () {
        $scope.editing = true;
    };

    $scope.save = function () {
        $scope.editing = false;
    };
}]);
