(function() {

    angular.module('BuscaAtivaEscolar')
        .config(function ($stateProvider) {
            $stateProvider.state('user_first_config', {
                url: '/user_setup/{id}?token',
                templateUrl: '/views/initial_admin_setup/review_user.html',
                controller: 'UserSetupCtrl',
                unauthenticated: true
            });
        })
        .controller('UserSetupCtrl', function ($scope, $stateParams, $window, moment, ngToast, Platform, Utils, TenantSignups, Cities, Modals, StaticData) {

            $scope.ready = false;
            $scope.termAlreadyConfirmed = false;

            var userID = $stateParams.id;
            var userToken = $stateParams.token;

            $scope.user = {};

            $scope.fetchUserDetails = function() {
                TenantSignups.getUserViaToken(
                    {id: userID, token: userToken},
                    function (data) {
                        // console.log(data);
                        // $scope.ready = true;
                        // $scope.user = data;
                    });
            };

            $scope.activeUser = function () {
                alert();
            };

            $scope.fetchUserDetails();

        });

})();