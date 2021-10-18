(function () {
  angular
    .module('BuscaAtivaEscolar')
    .config(function ($stateProvider) {
      $stateProvider.state('manager_confirmation', {
        url: '/confirmacao_gestor_estadual/{id}',
        templateUrl: '/views/state_signup/manager_confirmation.html',
        controller: 'ManagerConfirmationCtrl',
        unauthenticated: true,
      });
    })
    .controller(
      'ManagerConfirmationCtrl',
      function ($scope, $state, $stateParams, StateSignups, ngToast) {
        $scope.prevStep = function () {
          return $state.go('login');
        };

        $scope.provisionState = function () {
          var confirm = StateSignups.accept({
            id: $stateParams.id,
          }).$promise;

          confirm.then(function (res) {
            if (res.status === 'ok') {
              ngToast.success(
                'A sua solicitação de adesão foi confirmada com sucesso!'
              );
              $state.go('login');
            } else {
              ngToast.danger('Adesão já realizada');
            }
          });
        };
      }
    );
})();
