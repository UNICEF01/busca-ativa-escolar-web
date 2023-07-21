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
        Modals,
        Config,
        Auth,
        Identity
      ) {
        $rootScope.section = '';

        $scope.email = '';
        $scope.password = '';
        $scope.isLoading = false;

        const currentDate = new Date();
        const startDate = new Date(2023, 6, 21);
        const endDate = new Date(2023, 6, 25);

        $scope.isBeforeJuly25 =
          currentDate >= startDate && currentDate <= endDate;

        $scope.endpoints = {
          allowed: Config.ALLOWED_ENDPOINTS,
          list: Config.API_ENDPOINTS,
          readesaoURL: Config.getReadesaoURL(),
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

        function onLoggedIn() {
          $scope.isLoading = false;

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
          console.error('[login_ctrl] Login failed: ', err);
          Modals.show(
            Modals.Alert(
              'Usuário ou senha incorretos',
              'Por favor, verifique os dados informados e tente novamente.'
            )
          );
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
