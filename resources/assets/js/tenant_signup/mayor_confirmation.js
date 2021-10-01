(function () {
  angular
    .module('BuscaAtivaEscolar')
    .config(function ($stateProvider) {
      $stateProvider.state('mayor_confirmation', {
        url: '/confirmacao_prefeito/{id}',
        templateUrl: '/views/initial_tenant_setup/mayor_confirmation.html',
        controller: 'MayorConfirmationCtrl',
        unauthenticated: true,
      });
    })
    .controller(
      'MayorConfirmationCtrl',
      function ($scope, $state, $stateParams, Tenants, ngToast) {
        $scope.prevStep = function () {
          return $state.go('login');
        };

        $scope.provisionTenant = function () {
          var confirm = Tenants.mayorConfirmation({
            id: $stateParams.id,
          }).$promise;

          confirm.then(function (res) {
            if (res.status === 'ok') {
              ngToast.success(
                'A sua solicitação de adesão foi confirmada com sucesso!'
              );
              $state.go('login');
            } else {
              ngToast.danger('Adesão já realizada.');
            }
          });
        };
      }
    );
})();
