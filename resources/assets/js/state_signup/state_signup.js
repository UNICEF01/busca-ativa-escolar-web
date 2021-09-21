(function () {
  angular
    .module('BuscaAtivaEscolar')
    .controller(
      'StateSignupCtrl',
      function (
        $scope,
        $rootScope,
        $window,
        ngToast,
        Utils,
        StateSignups,
        Cities,
        Modals,
        StaticData
      ) {
        $scope.static = StaticData;

        $scope.step = 1;
        $scope.numSteps = 4;
        $scope.isCityAvailable = false;

        $scope.stepChecks = [false, false, false];
        $scope.stepsNames = [
          'Indique a UF',
          'Gestor(a) Estadual',
          'Coordenador(a) Estadual',
        ];

        $scope.form = {
          uf: null,
          admin: {},
          coordinator: {},
        };

        var fieldNames = {
          cpf: 'CPF',
          name: 'nome',
          email: 'e-mail institucional',
          position: 'posição',
          institution: 'instituição',
          password: 'senha',
          dob: 'data de nascimento',
          phone: 'telefone institucional',
          mobile: 'celular institucional',
          personal_phone: 'telefone pessoal',
          personal_mobile: 'celular pessoal',
        };

        var messages = {
          invalid_admin:
            'Dados do(a) gestor(a) estadual incompletos! Campos inválidos: ',
          invalid_coordinator:
            'Dados do(a) coordenador(a) estadual incompletos! Campos inválidos: ',
        };

        var requiredAdminFields = ['email', 'name', 'cpf', 'dob', 'phone'];
        var requiredCoordinatorFields = [
          'email',
          'name',
          'cpf',
          'dob',
          'phone',
        ];

        $scope.goToStep = function (step) {
          //console.log($scope.step, $scope.numSteps)
          if ($scope.step < 1) return;
          if ($scope.step >= $scope.numSteps) return;
          //console.log($scope.step, $scope.numSteps)
          $scope.step = step;
          $window.scrollTo(0, 0);
        };

        $scope.nextStep = function (step) {
          if ($scope.step >= $scope.numSteps) return;

          if (
            $scope.step === 2 &&
            !Utils.isValid(
              $scope.form.admin,
              requiredAdminFields,
              fieldNames,
              messages.invalid_admin
            )
          )
            return;

          $scope.step++;
          $window.scrollTo(0, 0);
          $scope.stepChecks[step] = true;
        };

        $scope.prevStep = function () {
          if ($scope.step <= 1) return;

          $scope.step--;
          $window.scrollTo(0, 0);
        };

        $scope.onUFSelect = function (uf) {
          //console.log("UF selected: ", uf);
          if (!uf) return;
          $scope.checkStateAvailability(uf);
        };

        $scope.checkStateAvailability = function (uf) {
          $scope.hasCheckedAvailability = false;

          StateSignups.checkIfAvailable({ uf: uf }, function (res) {
            $scope.hasCheckedAvailability = true;
            $scope.isStateAvailable = !!res.is_available;
          });
        };

        $scope.showPassword = function (elementId) {
          var field_password = document.getElementById(elementId);
          field_password.type === 'password'
            ? (field_password.type = 'text')
            : (field_password.type = 'password');
        };
        $scope.agree = function (value) {
          $scope.agreeTOS = value;
        };

        $scope.finish = function (step) {
          if (!$scope.agreeTOS) return;
          if (
            $scope.step === 3 &&
            !Utils.isValid(
              $scope.form.coordinator,
              requiredCoordinatorFields,
              fieldNames,
              messages.invalid_coordinator
            )
          )
            return;
          if (
            $scope.step === 3 &&
            !Utils.haveEqualsValue('Os CPFs', [
              $scope.form.admin.cpf,
              $scope.form.coordinator.cpf,
            ])
          )
            return;
          if (
            $scope.step === 3 &&
            !Utils.haveEqualsValue('Os nomes', [
              $scope.form.admin.name,
              $scope.form.coordinator.name,
            ])
          )
            return;

          if (
            $scope.step === 3 &&
            !Utils.haveEqualsValue('Os emails', [
              $scope.form.admin.email,
              $scope.form.coordinator.email,
            ])
          )
            return;

          var data = {};
          data.admin = Object.assign({}, $scope.form.admin);
          data.coordinator = Object.assign({}, $scope.form.coordinator);
          data.uf = $scope.form.uf;

          if (
            !Utils.isValid(
              data.admin,
              requiredAdminFields,
              messages.invalid_admin
            )
          )
            return;
          if (
            !Utils.isValid(
              data.coordinator,
              requiredCoordinatorFields,
              messages.invalid_coordinator
            )
          )
            return;

          data.admin = Utils.prepareDateFields(data.admin, ['dob']);
          data.coordinator = Utils.prepareDateFields(data.coordinator, ['dob']);

          StateSignups.register(data, function (res) {
            if (res.status === 'ok') {
              ngToast.success('Solicitação de adesão registrada!');
              $scope.step = 5;
              return;
            }

            if (res.reason === 'admin_email_in_use') {
              $scope.step = 2;
              return ngToast.danger(
                'O e-mail indicado para o(a) gestor(a) estadual já está em uso. Por favor, escolha outro e-mail'
              );
            }

            if (res.reason === 'coordinator_email_in_use') {
              $scope.step = 2;
              return ngToast.danger(
                'O e-mail indicado para o(a) coordenador(a) estadual já está em uso. Por favor, escolha outro e-mail'
              );
            }

            if (res.reason === 'invalid_admin_data') {
              $scope.step = 2;
              ngToast.danger(messages.invalid_admin);

              return Utils.displayValidationErrors(res);
            }

            ngToast.danger(
              'Ocorreu um erro ao registrar a adesão: ' + res.reason
            );
          });
          $scope.stepChecks[step] = true;
        };
      }
    );
})();
