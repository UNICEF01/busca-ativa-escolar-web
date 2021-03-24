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
          list: Config.API_ENDPOINTS
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

        function onLoggedIn(session) {
          $scope.isLoading = false;

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
          console.error('[login_ctrl] Login failed: ', err);
          //console.log(err);
          let text = [];
          if (err.error === 'invalid_credentials')
            (text[0] = 'Usuário ou senha incorretos'),
              (text[1] =
                'Por favor, verifique os dados informados e tente novamente.');
          else if (
            err.error === 'Credentials blocked. Please renew your password.'
          )
            (text[0] = 'Usuário bloqueado'),
              (text[1] = 'Por favor, utilize a recuperação de senha.');
          else {
            let string = err.error.split(' ');
            let date = new Date(`${string[3]}`).toLocaleDateString();
            let hours = string[4].split(':');
            hours = `${hours[0]}h${hours[1]}m${hours[2].replace('.', '')}s`;
            // prettier-ignore
            text[0] = `Acesso bloqueado até ${date} ${hours}.`;
            text[1] = `${string[5]} tentativas de acesso ao seu perfil `;
          }
          /*(text[0] = 'Usuário bloqueado'),
              (text[1] = 'Por favor, utilize a recuperação de senha.');*/
          Modals.show(Modals.Alert(text[0], text[1]));
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
          Modals.show(
            Modals.GeneralAlerts('Atenção: Renovação de adesão dos municípios')
          );
        };

        $scope.showModalAdesao();
      }
    );
})();
