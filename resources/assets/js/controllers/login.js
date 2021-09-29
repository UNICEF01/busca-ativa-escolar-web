(function () {
  angular
    .module('BuscaAtivaEscolar')
    .controller(
      'LoginCtrl',
      function (
        $scope,
        $rootScope,
        $cookies,
        $state,
        $location,
        Modals,
        Config,
        Auth,
        Identity
      ) {
        //console.log("[core] @Login");

        $rootScope.section = '';

        $scope.email = '';
        $scope.password = '';
        $scope.isLoading = false;

        $scope.endpoints = {
          allowed: Config.ALLOWED_ENDPOINTS,
          list: Config.API_ENDPOINTS,
        };

        if (Identity.isLoggedIn()) {
          $state.go('dashboard');
        }

        $scope.showPassowrd = function () {
          var field_password = document.getElementById('fld-password');
          field_password.type === 'password'
            ? (field_password.type = 'text')
            : (field_password.type = 'password');
        };

        $scope.downloadPdf = function () {};

        function onLoggedIn(session) {
          $scope.isLoading = false;
          /*Modals.show(
            Modals.GeneralPopUpAlerts(
              'QUESTIONÁRIO SOBRE IMPLEMENTAÇÃO DA ESTRATÉGIA'
            )
          );*/
          //console.info("[login_ctrl] Logged in!", session);
          //console.info("[login_ctrl] Tenant: ", Identity.getCurrentUser().tenant);

          if (Identity.getCurrentUser().lgpd) {
            if (!Identity.isUserType('coordenador_operacional'))
              return $state.go('dashboard');
            if (!Identity.hasTenant()) return $state.go('dashboard');
            if (!Identity.getCurrentUser().tenant.is_setup)
              return $state.go('tenant_setup');

            return $state.go('dashboard');
          } else {
            return $state.go('lgpd_signup');
          }

          // Check if user should see tenant first time setup
        }

        function onError(err) {
          if (err.error === 'lgpd_validation_fail') {
            Modals.show(
              Modals.Alert(
                'Prezado(a)',
                'Seu município/estado ainda não aceitou o novo termo de adesão à estratégia, atualizado segundo a LGPD. Entre em contato com o(a) coordenador(a) operacional / coordenador(a) estadual para se certificar sobre quando esse aceite será feito.'
              )
            );
          } else {
            Modals.show(
              Modals.Alert(
                'Usuário ou senha incorretos',
                'Por favor, verifique os dados informados e tente novamente.'
              )
            );
          }

          $scope.isLoading = false;
        }

        $scope.setAPIEndpoint = function (endpointID) {
          Config.setEndpoint(endpointID);
          $cookies.put('FDENP_API_ENDPOINT', endpointID);
        };

        $scope.login = function () {
          $scope.isLoading = true;
          Auth.login($scope.email, $scope.password).then(onLoggedIn, onError);
        };

        $scope.showModalAdesao = function () {
          Modals.show(Modals.GeneralAlerts('Aviso importante!'));
        };

        $scope.showModalAdesao();
      }
    );
})();
