(function() {

    const app = angular.module('BuscaAtivaEscolar')
        .config(function($stateProvider) {
            $stateProvider
                .state('forgot_password', {
                    url: '/forgot_password',
                    templateUrl: '/views/password_reset/begin_password_reset.html',
                    controller: 'ForgotPasswordCtrl',
                    unauthenticated: true
                })
                .state('password_reset', {
                    url: '/password_reset?email&token',
                    templateUrl: '/views/password_reset/complete_password_reset.html',
                    controller: 'PasswordResetCtrl',
                    unauthenticated: true
                })
        })
        .controller('ForgotPasswordCtrl', function($scope, $state, ngToast, PasswordReset) {

            $scope.email = "";
            $scope.isLoading = false;

            console.info("[password_reset.forgot_password] Begin password reset");

            $scope.requestReset = function() {
                $scope.isLoading = true;

                PasswordReset.begin({ email: $scope.email }, function(res) {
                    $scope.isLoading = false;

                    if (res.status !== 'ok') {
                        ngToast.danger("Erro! " + res.reason);
                        return;
                    }

                    ngToast.success("Solicitação de troca realizada com sucesso! Verifique em seu e-mail o link para troca de senha.");
                    $state.go('login');
                })
            }

        })
        .controller('PasswordResetCtrl', function($scope, $state, $stateParams, ngToast, PasswordReset) {

            var resetEmail = $stateParams.email;
            var resetToken = $stateParams.token;

            console.info("[password_reset.password_reset] Complete password reset for ", resetEmail, ", token=", resetToken);
            $scope.email = resetEmail;
            $scope.newPassword = "";
            $scope.newPasswordConfirm = "";
            $scope.isLoading = false;

            $scope.showPassowrd = function() {
                var field_password1 = document.getElementById("fld_password");
                field_password1.type === "password" ? field_password1.type = "text" : field_password1.type = "password";
            };

            $scope.showPassowrd2 = function() {
                var field_password2 = document.getElementById("fld_password_confirm");
                field_password2.type === "password" ? field_password2.type = "text" : field_password2.type = "password";
            };

            $scope.resetPassword = function() {

                if ($scope.newPassword !== $scope.newPasswordConfirm) {
                    ngToast.danger("A senha e a confirmação de senha devem ser iguais!");
                    return;
                }

                $scope.isLoading = true;

                PasswordReset.complete({ email: resetEmail, token: resetToken, new_password: $scope.newPassword }, function(res) {
                    $scope.isLoading = false;

                    if (res.status !== 'ok') {
                        ngToast.danger("Ocorreu um erro ao trocar a senha: " + res.reason);
                        return;
                    }

                    ngToast.success("Sua senha foi trocada com sucesso! Você pode efetuar o login com a nova senha agora.");
                    $state.go('login');
                });
            }

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