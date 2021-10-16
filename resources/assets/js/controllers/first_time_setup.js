(function () {
  angular
    .module('BuscaAtivaEscolar')
    .controller(
      'FirstTimeSetupCtrl',
      function (
        $scope,
        $rootScope,
        $window,
        $location,
        Auth,
        Modals,
        MockData,
        Identity
      ) {
        $rootScope.section = 'first_time_setup';

        $scope.identity = Identity;
        $scope.step = 2; // Step 1 is sign-up
        $scope.isEditing = false;

        $scope.causes = MockData.alertReasonsPriority;
        $scope.newGroupName = '';
        $scope.groups = [
          { name: 'Secretaria Municipal de Educação', canChange: false },
          {
            name: 'Secretaria Municipal de Assistência Social',
            canChange: true,
          },
          { name: 'Secretaria Municipal da Saúde', canChange: true },
        ];

        Identity.clearSession();

        $scope.range = function (start, end) {
          var arr = [];

          for (var i = start; i <= end; i++) {
            arr.push(i);
          }

          return arr;
        };

        $scope.goToStep = function (step) {
          $scope.step = step;
          $window.scrollTo(0, 0);
        };

        $scope.nextStep = function () {
          $scope.step++;
          $window.scrollTo(0, 0);
          if ($scope.step > 7) $scope.step = 7;
        };

        $scope.prevStep = function () {
          $scope.step--;
          $window.scrollTo(0, 0);
          if ($scope.step < 2) $scope.step = 1;
        };

        $scope.removeGroup = function (i) {
          $scope.groups.splice(i, 1);
        };

        $scope.addGroup = function () {
          $scope.groups.push({ name: $scope.newGroupName, canChange: true });
          $scope.newGroupName = '';
        };

        $scope.finish = function () {
          Modals.show(
            Modals.Confirm(
              'Tem certeza que deseja prosseguir com o cadastro?',
              'Os dados informados poderão ser alterados por você e pelos gestores na área de Configurações.'
            )
          ).then(function (res) {
            Auth.login('manager_sp@lqdi.net', 'demo').then(function () {
              $location.path('/dashboard');
            });
          });
        };
      }
    );
})();
