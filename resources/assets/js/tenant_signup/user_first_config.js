(function() {

    var app = angular.module('BuscaAtivaEscolar')
        .config(function ($stateProvider) {
            $stateProvider.state('user_first_config', {
                url: '/user_setup/{id}?token',
                templateUrl: '/views/initial_admin_setup/review_user.html',
                controller: 'UserSetupCtrl',
                unauthenticated: true
            });
        })
        .controller('UserSetupCtrl', function ($scope, $stateParams, $window, moment, ngToast, Platform, Utils, TenantSignups, Modals, $state) {

            $scope.canUpdateDataUser = true;
            $scope.message = "";

            var userID = $stateParams.id;
            var userToken = $stateParams.token;

            $scope.user = {};

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
                lgpd: 'termo de adesão'
            };

            var requiredFields = ['email','name','cpf','dob','phone','password', 'lgpd'];

            var messages = {
                invalid_user: 'Dados do usuário incompletos! Campos inválidos: '
            };

            var dateOnlyFields = ['dob'];

            $scope.fetchUserDetails = function() {
                TenantSignups.getUserViaToken(
                    {id: userID, token: userToken},
                    function (data) {

                        if( 'status' in data && 'reason' in data ){
                            $scope.canUpdateDataUser = false;
                            if(data.reason == 'token_mismatch') { $scope.message = "Token inválido"; }
                            if(data.reason == 'invalid_token') { $scope.message = "Token inválido"; }
                            if(data.reason == 'lgpd_already_accepted') { $scope.message = "Usuário já ativado"; }
                        }

                        if( 'email' in data && 'name' in data ){
                            $scope.canUpdateDataUser = true;
                            $scope.message = "";

                            $scope.user = data;
                            $scope.user.dob = moment(data.dob).toDate();
                        }

                    });
            };

            $scope.activeUser = function () {

                //set lgpd = 1 pois na API é obrigatório
                $scope.user.lgpd = 1;

                if(!Utils.isValid($scope.user, requiredFields, fieldNames, messages.invalid_user)) return;

                Modals.show(Modals.Confirm(
                    'Confirma os dados?',
                    'Revise todos os dados informados, pois o seu acesso à plataforma se dará a partir deles, sobretudo do e-mail e senha cadastrados.'
                )).then(function(res) {

                    var finalUser = Object.assign({}, $scope.user);
                    finalUser = Utils.prepareDateFields(finalUser, dateOnlyFields);

                    var data = {
                        id: userID,
                        token: userToken,
                        user: finalUser
                    };

                    TenantSignups.activeUser(data, function (res) {

                        if( 'status' in res && 'reason' in res ){

                            if(res.reason == 'token_mismatch') {
                                ngToast.danger("Token inválido");
                            }
                            if(res.reason == 'invalid_token') {
                                ngToast.danger("Token inválido");
                            }
                            if(res.reason == 'lgpd_already_accepted') {
                                ngToast.danger("Usuário já ativado");
                            }
                            if(res.reason == 'email_already_used') {
                                ngToast.danger("Email inválido. Já pertence a outro usuário");
                            }
                            if(res.reason == 'invalid_password') {
                                ngToast.danger("Senha inválida.");
                            }
                            if(res.reason == 'validation_failed') {
                                ngToast.danger("Campos inválidos. Preencha todos os campos obrigatórios");
                            }
                        }

                        if( 'status' in res && 'updated' in res ){
                            ngToast.success("Perfil ativado");
                            $state.go('login');
                        }

                    });

                });
            };

            $scope.showPassowrd = function () {
                var field_password = document.getElementById("fld-co-password");
                field_password.type === "password" ? field_password.type = "text" : field_password.type = "password";
            };

            $scope.fetchUserDetails();

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
											//mCtrl.$setValidity('charE', true);
									}
									const uncheck = function(entrada) {
											entrada.classList.remove('valid');
											entrada.classList.add('invalid');
									}
									if(typeof(value) === "string"){
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
									
									/*else {
													mCtrl.$setValidity('charE', false);
											}*/
									return value;
							}
							mCtrl.$parsers.push(myValidation);
					}
			};
	});

})();