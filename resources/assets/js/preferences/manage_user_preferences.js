(function () {
  angular
    .module('BuscaAtivaEscolar')
    .config(function ($stateProvider) {
      $stateProvider.state('user_preferences', {
        url: '/user_preferences',
        templateUrl: '/views/preferences/manage_user_preferences.html',
        controller: 'ManageUserPreferencesCtrl',
      });
    })
    .controller(
      'ManageUserPreferencesCtrl',
      function (
        $scope,
        ngToast,
        Identity,
        UserPreferences,
        PasswordReset,
        StaticData
      ) {
        $scope.static = StaticData;
        $scope.settings = {};

        $scope.refresh = function () {
          UserPreferences.get({}, function (res) {
            $scope.settings = res.settings;
          });
        };

        $scope.save = function () {
          UserPreferences.update({ settings: $scope.settings }, $scope.refresh);
        };

        $scope.resetPassword = function () {
          $scope.true = false;

          PasswordReset.begin(
            { email: Identity.getCurrentUser().email },
            function (res) {
              $scope.isLoading = false;
              ngToast.success(
                'Solicitação de troca realizada com sucesso! Verifique em seu e-mail o link para troca de senha.'
              );
            }
          );
        };

        $scope.refresh();
      }
    );
})();
