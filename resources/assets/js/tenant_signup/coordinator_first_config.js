(function() {

    angular.module('BuscaAtivaEscolar')
        .config(function ($stateProvider) {
            $stateProvider.state('coordinator_first_config', {
                url: '/coordinator_setup/{id}?token',
                templateUrl: '/views/initial_admin_setup/review_gestor_operacional.html',
                controller: 'CoordinatorSetupCtrl',
                unauthenticated: true
            });
        })
        .controller('CoordinatorSetupCtrl', function ($scope, $stateParams, $window, moment, ngToast, Platform, Utils, TenantSignups, Cities, Modals, StaticData) {


        });

})();