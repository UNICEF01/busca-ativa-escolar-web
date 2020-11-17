(function () {

    angular.module('BuscaAtivaEscolar')
        .config(function ($stateProvider) {
            $stateProvider.state('lgpd_signup', {
                url: '/lgpd_signup',
                templateUrl: '/views/users/user_lgpd_signup.html',
                controller: 'LgpdSignupCtrl',
            })
        })
        .controller('LgpdSignupCtrl', function ($scope, $rootScope, $localStorage, $state, ngToast, Identity, Users, Platform) {

            $scope.signed = false;

            $scope.aceitarTermo = function () {

                var userLgpd = Identity.getCurrentUser();

                userLgpd.lgpd = true;

                var data = Object.assign({}, userLgpd);

                Users.update(data).$promise.then(function (res) {
                    if (res.status === "ok") {
                        ngToast.success('TERMO DE RESPONSABILIDADE E CONFIDENCIALIDADE Aceito Com Sucesso');
                        $state.go('dashboard');
                    } else {
                        ngToast.danger("Ocorreu um erro, por favor procure o nosso suporte" + res.message, res.status);
                    }
                });
            }

            Platform.whenReady(function () {
                //verify signature LGPD
                if (Identity.getCurrentUser().lgpd) {
                    $scope.signed = true;
                }
            });


        });

})();
