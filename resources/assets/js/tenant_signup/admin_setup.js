(function () {
  var app = angular
    .module('BuscaAtivaEscolar')
    .config(function ($stateProvider) {
      $stateProvider.state('admin_setup', {
        url: '/admin_setup/{id}?token',
        templateUrl: '/views/initial_admin_setup/main.html',
        controller: 'AdminSetupCtrl',
        unauthenticated: true,
      });
    })
    .controller(
      'AdminSetupCtrl',
      function (
        $scope,
        $stateParams,
        $window,
        moment,
        ngToast,
        Platform,
        Utils,
        TenantSignups,
        Cities,
        Modals,
        StaticData
      ) {
        $scope.static = StaticData;

        var signupID = $stateParams.id;
        var signupToken = $stateParams.token;

        // console.info('[admin_setup] Admin setup for signup: ', signupID, 'token=', signupToken);

        $scope.step = 1;
        $scope.numSteps = 4;
        $scope.ready = false;

        $scope.panelTerm = false;

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
          lgpd: 'termo de adesão',
        };

        var requiredAdminFieldsPolitical = [
          'email',
          'name',
          'cpf',
          'dob',
          'phone',
          'password',
          'lgpd',
        ];
        var requiredAdminFieldsOperational = [
          'email',
          'name',
          'cpf',
          'dob',
          'phone',
        ];

        var messages = {
          invalid_gp:
            'Dados do(a) gestor(a) político(a) incompletos! Campos inválidos: ',
          invalid_co:
            'Dados do(a) coordenador(a) operacional incompletos! Campos inválidos: ',
        };

        $scope.signup = {};
        $scope.admins = {
          political: {},
          operational: {},
        };

        $scope.lastTenant = null;
        $scope.lastCoordinators = [];
        $scope.isNecessaryNewCoordinator = true;

        $scope.goToStep = function (step) {
          if ($scope.step < 1) return;
          if ($scope.step > $scope.numSteps) return;

          $scope.step = step;
          $window.scrollTo(0, 0);
        };

        $scope.nextStep = function () {
          //set lgpd = 1 - obrigatório na API
          $scope.admins.political.lgpd = 1;

          if ($scope.step >= $scope.numSteps) return;

          if (
            $scope.step === 3 &&
            !Utils.isValid(
              $scope.admins.political,
              requiredAdminFieldsPolitical,
              fieldNames,
              messages.invalid_gp
            )
          )
            return;
          if (
            $scope.step === 4 &&
            !Utils.isValid(
              $scope.admins.operational,
              requiredAdminFieldsOperational,
              fieldNames,
              messages.invalid_co
            )
          )
            return;

          if (
            $scope.step === 3 &&
            !Utils.isvalidTerm($scope.admins.political.lgpd)
          )
            return;

          $scope.step++;
          $window.scrollTo(0, 0);
        };

        $scope.prevStep = function () {
          if ($scope.step <= 1) return;

          $scope.step--;
          $window.scrollTo(0, 0);
        };

        $scope.fetchSignupDetails = function () {
          TenantSignups.getViaToken(
            { id: signupID, token: signupToken },
            function (data) {
              $scope.ready = true;
              $scope.signup = data;
              $scope.admins.political = data.data.admin;
              $scope.admins.political.dob = moment(
                data.data.admin.dob
              ).toDate();

              $scope.lastCoordinators = data.last_coordinators;
              $scope.lastTenant = data.last_tenant;

              $scope.step = 3;
            }
          );
        };

        $scope.showPassowrd = function (elementId) {
          var field_password = document.getElementById(elementId);
          field_password.type === 'password'
            ? (field_password.type = 'text')
            : (field_password.type = 'password');
        };

        $scope.provisionTenant = function () {
          //set lgpd = 1 - obrigatório na API
          $scope.admins.political.lgpd = 1;

          if (
            !Utils.isValid(
              $scope.admins.political,
              requiredAdminFieldsPolitical,
              fieldNames,
              messages.invalid_gp
            )
          )
            return;

          if ($scope.isNecessaryNewCoordinator) {
            if (
              !Utils.isValid(
                $scope.admins.operational,
                requiredAdminFieldsOperational,
                fieldNames,
                messages.invalid_co
              )
            )
              return;
          }

          Modals.show(
            Modals.Confirm(
              'Tem certeza que deseja prosseguir com o cadastro?',
              'Os dados informados serão utilizados para cadastrar os demais usuários. A configuração do município será realizada pelo(a) Coordenador(a) Operacional.'
            )
          ).then(function (res) {
            var data = {
              id: signupID,
              token: signupToken,
            };

            data.political = Object.assign({}, $scope.admins.political);
            data.political = Utils.prepareDateFields(data.political, ['dob']);
            data.political = Utils.prepareCityFields(data.political, [
              'work_city',
            ]);

            data.operational = Object.assign({}, $scope.admins.operational);
            data.operational = Utils.prepareDateFields(data.operational, [
              'dob',
            ]);
            data.operational = Utils.prepareCityFields(data.operational, [
              'work_city',
            ]);

            data.lastTenant = $scope.lastTenant;
            data.lastCoordinators = $scope.lastCoordinators;
            data.isNecessaryNewCoordinator = $scope.isNecessaryNewCoordinator;

            TenantSignups.complete(data, function (res) {
              if (res.status === 'ok') {
                ngToast.success('Adesão finalizada!');
                $scope.step = 5;
                return;
              }

              if (res.reason === 'political_admin_email_in_use') {
                $scope.step = 3;
                return ngToast.danger(
                  'O e-mail indicado para o(a) gestor(a) político(a) já está em uso. Por favor, escolha outro e-mail'
                );
              }

              if (res.reason === 'operational_admin_email_in_use') {
                $scope.step = 4;
                return ngToast.danger(
                  'O e-mail indicado para o(a) coordenador(a) já está em uso. Por favor, escolha outro e-mail'
                );
              }

              if (res.reason === 'admin_emails_are_the_same') {
                $scope.step = 4;
                return ngToast.danger(
                  'Você precisa informar e-mails diferentes para o gestor(a) político(a) e o(a) coordenador(a) operacional'
                );
              }

              if (res.reason === 'invalid_political_admin_data') {
                $scope.step = 3;
                ngToast.danger(messages.invalid_gp);
                return Utils.displayValidationErrors(res);
              }

              if (res.reason === 'invalid_operational_admin_data') {
                $scope.step = 4;
                ngToast.danger(messages.invalid_co);
                return Utils.displayValidationErrors(res);
              }

              if (res.reason === 'coordinator_emails_are_the_same') {
                $scope.step = 4;
                return ngToast.danger(
                  'Você precisa informar e-mails diferentes para o(a) gestor(a) político(a), o(a) novo(a) coordenador(a) operacional e os demais coordenadores'
                );
              }

              if (res.reason === 'coordinator_email_in_use') {
                $scope.step = 4;
                return ngToast.danger(
                  'Email do(a) coordenador(a) desativado já está em uso por outro perfil'
                );
              }

              ngToast.danger(
                'Ocorreu um erro ao finalizar a adesão: ' + res.reason
              );
            });
          });
        };

        $scope.fetchSignupDetails();

        // $scope.openTerm = function () {
        // 	$scope.panelTerm = !$scope.panelTerm;
        // };

        $scope.changeNecessityCoordinator = function (necessity) {
          $scope.isNecessaryNewCoordinator = necessity;
          $scope.admins.operational = {};
        };
      }
    );

  app.directive('myDirective', function () {
    return {
      require: 'ngModel',
      link: function (scope, element, attr, mCtrl) {
        function myValidation(value) {
          const capital = document.getElementById('capital');
          const number = document.getElementById('number');
          const length = document.getElementById('length');
          const letter = document.getElementById('letter');
          const symbol = document.getElementById('symbol');
          const check = function (entrada) {
            entrada.classList.remove('invalid');
            entrada.classList.add('valid');
            //mCtrl.$setValidity('charE', true);
          };
          const uncheck = function (entrada) {
            entrada.classList.remove('valid');
            entrada.classList.add('invalid');
          };
          if (typeof value === 'string') {
            var lowerCaseLetters = /[a-z]/g;
            if (value.match(lowerCaseLetters)) {
              check(letter);
            } else {
              uncheck(letter);
            }
            var upperCaseLetters = /[A-Z]/g;
            if (value.match(upperCaseLetters)) {
              check(capital);
            } else {
              uncheck(capital);
            }
            var numbers = /[0-9]/g;
            if (value.match(numbers)) {
              check(number);
            } else {
              uncheck(number);
            }
            var symbols = /[!@#$%&*?]/g;
            if (value.match(symbols)) {
              check(symbol);
            } else {
              uncheck(symbol);
            }
            // Validate length
            if (value.length >= 8 && value.length <= 16) {
              check(length);
            } else {
              uncheck(length);
            }
          }

          /*else {
													mCtrl.$setValidity('charE', false);
											}*/
          return value;
        }
        mCtrl.$parsers.push(myValidation);
      },
    };
  });
})();
