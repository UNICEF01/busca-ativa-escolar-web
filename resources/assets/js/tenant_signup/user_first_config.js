(function() {

    angular.module('BuscaAtivaEscolar')
        .config(function ($stateProvider) {
            $stateProvider.state('user_first_config', {
                url: '/user_setup/{id}?token',
                templateUrl: '/views/initial_admin_setup/review_user.html',
                controller: 'UserSetupCtrl',
                unauthenticated: true
            });
        })
        .controller('UserSetupCtrl', function ($scope, $stateParams, $window, moment, ngToast, Platform, Utils, TenantSignups, Modals) {

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

                if(!Utils.isValid($scope.user, requiredFields, fieldNames, messages.invalid_user)) return;

                Modals.show(Modals.Confirm(
                    'Confirma os dados?',
                    'Lorem ipsum in dolor sit amet ...'
                )).then(function(res) {

                    alert();
                    //call the TenantSigup Resource and activate the user...

                });
            };

            $scope.openTerm = function () {
                $scope.panelTerm = !$scope.panelTerm;
            };

            $scope.fetchUserDetails();

        });

})();