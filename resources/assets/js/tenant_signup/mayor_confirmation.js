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
      function (
        $scope,
        $state,
        $stateParams,
        Platform,
        Identity,
        TenantSignups,
        Tenants,
        Modals
      ) {
        // http://api.busca-ativa-escolar.test/api/v1/signups/tenants/8d239e40-2550-11eb-978f-cd8b250fb29a/accept

        var confirm = Tenants.mayorConfirmation({
          id: $stateParams.id,
        }).$promise;

        confirm.then(function (res) {
          if (res.status === 'ok') {
            $scope.css = 'alert alert-success';
            $scope.resposta =
              'A sua solicitação de adesão foi confirmada com sucesso!';
          } else {
            $scope.css = 'alert alert-danger';
            $scope.resposta =
              'Problema na solicitação, por favor entre em contato com o nosso suporte!';
          }
        });
      }
    );
})();
