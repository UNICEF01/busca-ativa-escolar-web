(function () {
  angular
    .module('BuscaAtivaEscolar')
    .config(function ($stateProvider) {
      $stateProvider.state('pending_state_signups', {
        url: '/pending_state_signups',
        templateUrl: '/views/states/pending_signups.html',
        controller: 'PendingStateSignupsCtrl',
      });
    })
    .controller(
      'PendingStateSignupsCtrl',
      function (
        $scope,
        $rootScope,
        ngToast,
        Identity,
        StateSignups,
        StaticData
      ) {
        $scope.identity = Identity;
        $scope.static = StaticData;

        $scope.signups = {};
        $scope.signup = {};
        $scope.query = {
          sort: { created_at: 'desc' },
          filter: { status: 'pending' },
          max: 16,
          page: 1,
        };

        $scope.refresh = function () {
          $scope.signups = StateSignups.getPending($scope.query);
          return $scope.signups.$promise;
        };

        $scope.preview = function (signup) {
          const accepted = StateSignups.accepted({ id: signup.id }).$promise;

          accepted.then(function (res) {
            if (res.status === 200) {
              $scope.signup = signup;
              let adminDate = signup.data.admin.dob.split('-');
              adminDate =
                adminDate[2] + '/' + adminDate[1] + '/' + adminDate[0];
              signup.data.admin.dob = adminDate;
              let coordinationDate = signup.data.coordinator.dob.split('-');
              coordinationDate =
                coordinationDate[2] +
                '/' +
                coordinationDate[1] +
                '/' +
                coordinationDate[0];
              signup.data.coordinator.dob = coordinationDate;
              signup.is_approved_by_manager = false;
              if (res.data) {
                signup.is_approved_by_manager = true;
              }
            }
          });
        };

        $scope.approve = function (signup) {
          StateSignups.approve({ id: signup.id }, function () {
            $scope.refresh();
            $scope.signup = {};
          });
        };

        $scope.reject = function (signup) {
          StateSignups.reject({ id: signup.id }, function () {
            $scope.refresh();
            $scope.signup = {};
          });
        };

        $scope.updateRegistrationData = function (type, signup) {
          StateSignups.updateRegistrationData(
            { id: signup.id, type: type, data: signup.data[type] },
            function (res) {
              typeName = type === 'admin' ? 'gestor' : 'coordenador';

              if (res.status !== 'ok') {
                ngToast.danger(
                  `Falha ao atualizar os dados do(a) ${typeName}(a): ${res.reason} `
                );
                return;
              }

              //`horseThumb_${id}`
              ngToast.success(`Dados do(a) ${typeName}(a)  atualizado!`);
            }
          );
        };

        $scope.resendNotification = function (signup) {
          StateSignups.resendNotification({ id: signup.id }, function () {
            ngToast.success('Notificação reenviada!');
          });
        };

        $scope.refresh();
      }
    );
})();
