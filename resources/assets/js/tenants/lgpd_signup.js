(function() {
    var app = angular.module('BuscaAtivaEscolar')
        .config(function($stateProvider) {
            $stateProvider.state('lgpd_signup', {
                url: '/lgpd_signup/:user_id',
                templateUrl: '/views/users/user_lgpd_signup.html',
                controller: 'LgpdSignupCtrl',
            })
        })
        .controller('LgpdSignupCtrl', function($rootScope, $scope, $state, $stateParams, $localStorage, ngToast, Platform, Utils, Identity, Users,  StaticData) {

            $scope.signed = false;
            $scope.term = true;

            $scope.currentState = $state.current.name;

            $scope.user = {};
            $scope.isReviewing = false;

            $scope.identity = Identity;
           
            $scope.static = StaticData;

            $scope.quickAdd = ($stateParams.quick_add === 'true');

            var dateOnlyFields = ['dob'];

            Platform.whenReady(function() {
                $scope.user = Users.myself({ id: $scope.identity.getCurrentUser().id }, prepareUserModel);

            });

            $scope.save = function() {

                //1 pois a API valida essa opção;
                $scope.user.lgpd = 1;

                if ($scope.user.type === "perfil_visitante") {
                    $scope.user.type = getFinalTypeUser();
                }

                var data = Object.assign({}, $scope.user);
                data = Utils.prepareDateFields(data, dateOnlyFields);
                data = Utils.prepareCityFields(data, ['work_city']);


                Users.updateYourself(data).$promise.then(function(res) {
                    if (res.status === "ok") {
                        ngToast.success('TERMO DE RESPONSABILIDADE E CONFIDENCIALIDADE Assinado com Sucesso');
                        $localStorage.identity.current_user.lgpd = 1;
                        $state.go('dashboard');
                    }

                    if (res.status === "error") {
                        ngToast.danger("Ocorreu um erro, por favor procure o nosso suporte" + res.messages[0]);
                    }

                });

            };

            function prepareUserModel(user) {
                return Utils.unpackDateFields(user, dateOnlyFields)
            }

            $scope.showPassowrd = function() {
                var field_password = document.getElementById("fld-gp-password");

                field_password.type === "password" ? field_password.type = "text" : field_password.type = "password"
            };

            function onSaved(res) {
                if (res.status === "ok") {
                    ngToast.success("Dados de usuário salvos com sucesso!");

                    if ($scope.quickAdd && $rootScope.previousState) return $state.go($rootScope.previousState, $rootScope.previousStateParams);
                    if ($scope.isCreating) return $state.go('user_editor', { user_id: res.id });

                    return;
                }

                if (res.messages) return Utils.displayValidationErrors(res);

                ngToast.danger("Ocorreu um erro ao salvar o usuário<br>por favor entre em contato com o nosso suporte informando o nome do erro: " + res.reason);
            }


            $scope.openTerm = function() {
                $scope.panelTerm = !$scope.panelTerm;

                console.log($scope.lastCoordinators);
            };

        });
    app.directive('myDirective', function() {
        return {
            require: 'ngModel',
            link: function(scope, element, attr, mCtrl) {
                function myValidation(value) {
                    const capital = document.getElementById('capital');
                    const number = document.getElementById('number');
                    const length = document.getElementById('length');
                    const letter = document.getElementById('letter');
                    const symbol = document.getElementById('symbol')
                    const check = function(entrada) {
                        entrada.classList.remove('invalid');
                        entrada.classList.add('valid');
                    }
                    const uncheck = function(entrada) {
                        entrada.classList.remove('valid');
                        entrada.classList.add('invalid');
                    }
                    if (typeof(value) === "string") {
                        var lowerCaseLetters = /[a-z]/g;
                        if (value.match(lowerCaseLetters)) {
                            check(letter)
                        } else {
                            uncheck(letter)
                        }
                        var upperCaseLetters = /[A-Z]/g;
                        if (value.match(upperCaseLetters)) {
                            check(capital)
                        } else {
                            uncheck(capital)
                        }
                        var numbers = /[0-9]/g;
                        if (value.match(numbers)) {
                            check(number)
                        } else {
                            uncheck(number)
                        }
                        var symbols = /[!@#$%&*?]/g;
                        if (value.match(symbols)) {
                            check(symbol)
                        } else {
                            uncheck(symbol)
                        }
                        // Validate length
                        if (value.length >= 8 && value.length <= 16) {
                            check(length);
                        } else {
                            uncheck(length);
                        }
                    }
                    return value;
                }
                mCtrl.$parsers.push(myValidation);
            }
        };
    });


})();