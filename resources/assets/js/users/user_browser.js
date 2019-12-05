(function () {

    angular.module('BuscaAtivaEscolar')
        .config(function ($stateProvider) {
            $stateProvider.state('user_browser', {
                url: '/users',
                templateUrl: '/views/users/browser.html',
                controller: 'UserBrowserCtrl'
            })
        })
        .controller('UserBrowserCtrl', function ($scope, $rootScope, ngToast, API, Config, Platform, Identity, Users, Groups, Tenants, StaticData, Modals) {

            $scope.identity = Identity;
            $scope.query = {
                tenant_id: null,
                uf: null,
                group_id: null,
                type: null,
                email: null,
                with: 'tenant',
                sort: {},
                show_suspended: false,
                max: 16,
                page: 1
            };

            $scope.info = false;

            $scope.quickAdd = false;

            $scope.onCheckCanceled = function () {
                $scope.query.show_suspended = $scope.query.show_suspended ? false : true;
                $scope.refresh();
            };

            $scope.enableQuickAdd = function () {
                $scope.quickAdd = true;
            };

            $scope.setMaxResults = function (max) {
                $scope.query.max = max;
                $scope.query.page = 1;
                $scope.refresh();
            };

            $scope.export = function () {
                Identity.provideToken().then(function (token) {
                    window.open(Config.getAPIEndpoint() + 'users/export?token=' + token + $scope.prepareUriToExport());
                });
            };

            $scope.prepareUriToExport = function () {
                var uri = "";
                Object.keys($scope.query).forEach(function (element) {
                    if (element != "sort" && $scope.query[element] != null) uri = uri.concat("&" + element + "=" + $scope.query[element]);
                });
                uri = uri.concat("&show_suspended=" + $scope.query.show_suspended);
                return uri;
            };

            $scope.canEditUser = function (user) {
                var currentUser = Identity.getCurrentUser();
                return (StaticData.getPermissions().can_manage_types[currentUser.type]).indexOf(user.type) !== -1;
            };

            $scope.isCurrentUser = function (user) {
                return (Identity.getCurrentUser().id === user.id);
            };

            $scope.static = StaticData;
            $scope.tenants = [];
            $scope.groups = Groups.find();
            $scope.canFilterByTenant = false;

            $scope.checkboxes = {};
            $scope.search = {};

            $scope.getGroups = function () {
                if (!$scope.groups || !$scope.groups.data) return [];
                return $scope.groups.data;
            };

            $scope.getTenants = function () {
                if (!$scope.tenants || !$scope.tenants.data) return [];
                return $scope.tenants.data;
            };

            $scope.getUFs = function () {
                return StaticData.getUFs();
            };

            $scope.refresh = function () {
                $scope.tenants = Tenants.findByUf({'uf': $scope.query.uf});
                $scope.search = Users.search($scope.query);
            };

            $scope.suspendUser = function (user) {
                Users.suspend({id: user.id}, function (response) {
                    if (response.have_data) {
                        Modals.show(Modals.Confirm(
                            'Deseja prosseguir!',
                            'Existem casos sobre a responsabilidade deste usuário, os casos deverão ser atribuidos a outro usuário do sistema. ' +
							'Quantidade por etapas: ' +
							'Pesquisa: ' + response.pesquisa.casos + ', ' +
							'Análise Técnica: ' + response.analise_tecnica.casos + ', ' +
							'Gestão do caso: ' + response.gestao_caso.casos + ', ' +
							'(Ré)matrícula: ' + response.rematricula.casos + ', ' +
							'Observação: ' + response.observacao.casos
                        )).then(function (res) {
                            alert('Excluidos');
                        });
                    } else {
                        ngToast.success('Usuário desativado!');
                        $scope.refresh();
                    }
                });
            };

            $scope.restoreUser = function (user) {
                Users.restore({id: user.id}, function (res) {
                    ngToast.success('Usuário reativado!');
                    $scope.refresh();
                });
            };

            $scope.refresh();

            Platform.whenReady(function () {
                $scope.canFilterByTenant = (Identity.getType() === 'gestor_nacional' || Identity.getType() === 'superuser');
                console.log("[user_browser] Can filter by tenant? ", Identity.getType(), $scope.canFilterByTenant);
            });

        });

})();