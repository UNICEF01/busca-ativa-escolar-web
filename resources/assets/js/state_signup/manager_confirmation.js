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
              /*$scope.css = 'alert alert-success';
              $scope.resposta =
                'A sua solicitação de adesão foi confirmada com sucesso!';*/
            } else {
              $scope.css = 'alert alert-danger';
              $scope.resposta =
                'Problema na solicitação, por favor entre em contato com o nosso suporte!';
            }
          });
        };
        // http://api.busca-ativa-escolar.test/api/v1/signups/tenants/8d239e40-2550-11eb-978f-cd8b250fb29a/accept
        /*var confirm = Tenants.mayorConfirmation({
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
        });*/
      }
    );
})();
