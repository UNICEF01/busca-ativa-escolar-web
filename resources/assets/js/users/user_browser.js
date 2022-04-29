(function() {
    angular.module('BuscaAtivaEscolar')
        .config(function($stateProvider) {
            $stateProvider.state('user_browser', {
                url: '/users',
                templateUrl: '/views/users/browser.html',
                controller: 'UserBrowserCtrl'
            })
        })
        .controller('UserBrowserCtrl', function($scope, ngToast, Config, Platform, Identity, Users, Tenants, StaticData, Modals, Maintenance) {

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
            $scope.onCheckCanceled = function() {
                $scope.query.show_suspended = $scope.query.show_suspended ? false : true;
                $scope.refresh();
            };

            $scope.enableQuickAdd = function() {
                $scope.quickAdd = true;
            };

            $scope.setMaxResults = function(max) {
                $scope.query.max = max;
                $scope.query.page = 1;
                $scope.refresh();
            };

            $scope.export = function() {

                var final_uri = $scope.prepareUriToExport();

                if (
                    Identity.isUserType('gestor_nacional') &&
                    (!final_uri.includes('uf') &&
                        !final_uri.includes('type') &&
                        !final_uri.includes('email')
                    )

                ) {
                    Modals.show(Modals.Alert("Atenção", "Utilize a opção Relatórios completos, ou faça o filtro de um estado que deseja baixar"));
                    return false;
                }

                Identity.provideToken().then(function(token) {
                    window.open(Config.getAPIEndpoint() + 'users/export?token=' + token + $scope.prepareUriToExport());
                });
            };

            $scope.prepareUriToExport = function() {
                var uri = "";
                Object.keys($scope.query).forEach(function(element) {
                    if (element != "sort" && $scope.query[element] != null) uri = uri.concat("&" + element + "=" + $scope.query[element]);
                });
                uri = uri.concat("&show_suspended=" + $scope.query.show_suspended);
                return uri;
            };

            $scope.canEditUser = function(user) {
                var currentUser = Identity.getCurrentUser();
                return (StaticData.getPermissions().can_manage_types[currentUser.type]).indexOf(user.type) !== -1;
            };

            $scope.isCurrentUser = function(user) {
                return (Identity.getCurrentUser().id === user.id);
            };

            $scope.selectedGroup = {id:null, name:null};

            $scope.static = StaticData;

            $scope.canFilterByTenant = false;

            $scope.checkboxes = {};
            $scope.search = {};

            $scope.getTenants = function() {
                if (!$scope.tenants || !$scope.tenants.data) return [];
                return $scope.tenants.data;
            };

            $scope.getUFs = function() {
                return StaticData.getUFs();
            };

            $scope.refresh = function() {
                $scope.search = Users.search($scope.query);
            };

            $scope.changeGroup = function() {
                Modals.show(
                    Modals.GroupPicker(
                        'Filtrar usuários que pertencem ao grupo',
                        '',
                        $scope.identity.getCurrentUser().group,
                        'Filtrando grupo: ',
                        false,
                        null,
                        null,
                        true,
                        'Nenhum grupo selecionado')
                ).then(function(selectedGroup) {
                    $scope.query.group_id = selectedGroup.id;
                    $scope.selectedGroup.name = selectedGroup.name;
                    $scope.refresh();
                }).then(function() {

                });
            };

            $scope.suspendUser = function(user) {
                Users.suspend({ id: user.id }, function(response) {
                    if (response.have_data) {
                        Modals.show(Modals.Confirm(
                            'Deseja prosseguir!',
                            'Existem casos sob responsabilidade deste usuário. Ao desativá-lo, estes casos serão atribuídos a você, que deve administrá-los, repassando-os para outra pessoa que assumirá a função ou redistribuindo-os para outros profissionais. ' +
                            'Quantidade por etapas: ' +
                            'Pesquisa: ' + response.pesquisa.casos + ', ' +
                            'Análise Técnica: ' + response.analise_tecnica.casos + ', ' +
                            'Gestão do caso: ' + response.gestao_caso.casos + ', ' +
                            '(Ré)matrícula: ' + response.rematricula.casos + ', ' +
                            'Observação: ' + response.observacao.casos + ', ' +
                            'Clique sim para prosseguir'
                        )).then(function(res) {
                            Maintenance.assignForAdminUser({ id: user.id }, function(response) {
                                ngToast.success(
                                    'Usuário desativado e casos atribuidos com sucesso!'
                                );
                                $scope.refresh();
                            });
                        });
                    } else {
                        ngToast.success('Usuário desativado!');
                        $scope.refresh();
                    }
                });
            };

            $scope.restoreUser = function(user) {
                Users.restore({ id: user.id }, function(res) {
                    ngToast.success('Usuário reativado!');
                    $scope.refresh();
                });
            };

            $scope.sendReactivationMail = function(user) {
                Users.sendReactivationMail({ id: user.id }, function(res) {
                    ngToast.success('Email encaminhado!');
                    $scope.refresh();
                });
            };

            Platform.whenReady(function() {
                $scope.canFilterByTenant = ($scope.identity.getType() === 'gestor_nacional' || $scope.identity.getType() === 'superuser');
                $scope.query.group_id = $scope.canFilterByTenant ? null : $scope.identity.getCurrentUser().group.id;
                $scope.selectedGroup = $scope.identity.getCurrentUser().group;
                $scope.refresh();
            });

            $scope.isScopeOfUser = function (user){
                if ($scope.identity.getType() === 'gestor_nacional' || $scope.identity.getType() === 'superuser') {
                    return user.tenant_id == null ? true : false;
                }
                if ($scope.identity.getType() === 'coordenador_operacional' || $scope.identity.getType() === 'supervisor_institucional' || $scope.identity.getType() === 'gestor_politico') {
                    return true;
                }
                if ($scope.identity.getType() === 'coordenador_estadual' || $scope.identity.getType() === 'supervisor_estadual') {
                    return true;
                }
            };

            $scope.isScopeOfTenant = function (){
                if ($scope.identity.getType() === 'coordenador_operacional' || $scope.identity.getType() === 'supervisor_institucional' || $scope.identity.getType() === 'gestor_politico') {
                    return true;
                }
                return false;
            }

        });
})();