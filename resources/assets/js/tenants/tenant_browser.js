(function () {
  angular
    .module('BuscaAtivaEscolar')
    .config(function ($stateProvider) {
      $stateProvider.state('tenant_browser', {
        url: '/tenants',
        templateUrl: '/views/tenants/list.html',
        controller: 'TenantBrowserCtrl',
      });
    })
    .controller(
      'TenantBrowserCtrl',
      function ($scope, ngToast, Tenants, Modals, Identity, Config, Ufs) {
        $scope.identity = Identity;
        $scope.tenants = {};
        $scope.ufs = Ufs;
        $scope.query = {
          show_suspended: false,
          filter: {},
          sort: {},
          max: 16,
          page: 1,
        };

        $scope.showCanceledCities = function () {
          $scope.query.show_suspended = $scope.query.show_suspended
            ? false
            : true;
          $scope.refresh();
        };

        $scope.refresh = function () {
          $scope.tenants = Tenants.all($scope.query);
        };

        $scope.export = function () {
          Identity.provideToken().then(function (token) {
            window.open(
              Config.getAPIEndpoint() +
                'tenants/export?token=' +
                token +
                $scope.prepareUriToExport()
            );
          });
        };

        $scope.prepareUriToExport = function () {
          var uri = '';
          Object.keys($scope.query.filter).forEach(function (element) {
            uri = uri.concat(
              '&' + element + '=' + $scope.query.filter[element]
            );
          });
          uri = uri.concat('&show_suspended=' + $scope.query.show_suspended);
          return uri;
        };

        $scope.disableTenant = function (tenant) {
          Modals.show(
            Modals.Confirm(
              'Tem certeza que deseja cancelar o município: ' + tenant.name,
              'Ao confirmar, os acessos do município serão cancelados, e todos os dados recebidos serão arquivados, e não poderão mais ser acessados. ' +
                'Os alertas e lembretes não serão disparados. As estatísticas e métricas coletadas não serão apagadas'
            )
          )
            .then(function () {
              return Tenants.cancel({ id: tenant.id }).$promise;
            })
            .then(function (res) {
              if (res && res.status === 'ok') {
                ngToast.success('Município cancelado com sucesso!');
                $scope.refresh();
                return;
              }

              ngToast.danger('Ocorreu um erro ao cancelar o município!');
              console.error('[tenants.cancel] Failed to cancel tenant: ', res);
            });
        };

        $scope.getGestorPoliticoUsers = (users, politicalAdmin) => {
          // Filtrar o array de usuários com base nas condições
          const gestorPoliticoUsers = users.filter((user) => {
            return (
              user.type === 'gestor_politico' &&
              user.deleted_at === null &&
              user.name !== politicalAdmin.name
            );
          });

          // Adicionar 'political_admin' ao início do array 'gestorPoliticoUsers' se ele existir
          if (politicalAdmin) {
            gestorPoliticoUsers.unshift(politicalAdmin);
          }

          return gestorPoliticoUsers;
        };

        $scope.getCoordenadorOperacionalUsers = (users, operationalAdmin) => {
          // Filtrar o array de usuários com base nas condições
          const coordenadorOperacionalUsers = users.filter((user) => {
            return (
              user.type === 'coordenador_operacional' &&
              user.deleted_at === null &&
              user.name !== operationalAdmin.name
            );
          });

          // Adicionar 'coordenador_operacional' ao início do array 'coordenadorOperacionalUsers' se ele existir
          if (operationalAdmin) {
            coordenadorOperacionalUsers.unshift(operationalAdmin);
          }

          return coordenadorOperacionalUsers;
        };

        $scope.refresh();
      }
    );
})();
