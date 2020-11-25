(function () {

    angular.module('BuscaAtivaEscolar')
        .config(function ($stateProvider) {
            $stateProvider.state('lgpd_signup', {
                url: '/lgpd_signup/:user_id',
                templateUrl: '/views/users/user_lgpd_signup.html',
                controller: 'LgpdSignupCtrl',
            })
        })
        .controller('LgpdSignupCtrl', function ($rootScope, $scope, $state, $stateParams, $localStorage, ngToast, Platform, Cities, Utils, Tenants, Identity, Users, Groups, StaticData) {

            $scope.signed = false;

            $scope.currentState = $state.current.name

            $scope.user = {};
            $scope.isReviewing = false;

            $scope.identity = Identity;
            $scope.static = StaticData;

            $scope.groups = {};
            $scope.tenants = Tenants.find();
            $scope.quickAdd = ($stateParams.quick_add === 'true');

            var permissions = {};
            var dateOnlyFields = ['dob'];

            var userTypeVisitantes = [];
            var permissionsFormForVisitante = [];

            $scope.perfilVisitante = {name: ''};
            $scope.permissionsVisitantes = ['relatorios'];

            Platform.whenReady(function () {
                permissions = StaticData.getPermissions();
                userTypeVisitantes = StaticData.getUserTypeVisitantes();
                permissionsFormForVisitante = StaticData.getPermissionsFormForVisitante();
                $scope.isCreating = (!$scope.identity.getCurrentUser().id || $scope.identity.getCurrentUser().id === "new");

                if (!$scope.isCreating) {
                    $scope.user = Users.find({id: $scope.identity.getCurrentUser().id}, prepareUserModel);
                } else {
                    if (Identity.getType() === 'superuser' || Identity.getType() === 'gestor_nacional') {
                        $scope.groups = {};
                    } else {
                        $scope.groups = Groups.find();
                    }
                }

                if (Identity.getCurrentUser().lgpd) {
                    $scope.signed = true;
                }

            });


            $scope.isSuperAdmin = function () {
                return (Identity.getType() === 'superuser' || Identity.getType() === 'gestor_nacional');
            };

            $scope.isTargetUserTenantBound = function () {
                return (StaticData.getTypesWithGlobalScope().indexOf($scope.user.type) === -1 && StaticData.getTypesWithUFScope().indexOf($scope.user.type) === -1)
            };

            $scope.isTargetUserUFBound = function () {
                return StaticData.getTypesWithUFScope().indexOf($scope.user.type) !== -1;
            };

            $scope.canDefineUserTenant = function () {
                // Can specify user tenant only if superadmin, and only if target user type is tenant-bound
                if (!$scope.isSuperAdmin()) return false;
                return $scope.isTargetUserTenantBound();
            };

            $scope.canDefineUserUF = function () {
                // Only superusers can define user UF, and only on UF-bound user types
                if (!$scope.isSuperAdmin()) return false;
                return StaticData.getTypesWithUFScope().indexOf($scope.user.type) !== -1;
            };

            $scope.openUser = function (user_id, is_reviewing) {
                $scope.isCreating = false;
                $scope.isReviewing = !!is_reviewing;
                $scope.user = Users.find({id: user_id}, prepareUserModel);
            };

            $scope.goBack = function () {
                return $state.go($rootScope.previousState, $rootScope.previousStateParams);
            };

            $scope.getUserTypes = function () {
                if (!permissions) return {};
                if (!permissions.can_manage_types) return {};

                var finalPermissions = permissions.can_manage_types[Identity.getCurrentUser().type].filter(function (el) {
                    return $scope.getUserTypesVisitantes().indexOf(el) < 0;
                });

                return finalPermissions;
            };

            $scope.getUserTypesVisitantes = function () {
                if (!permissions) return {};
                if (!permissions.can_manage_types) return {};
                return userTypeVisitantes;
            };

            $scope.getPermissionsFormForVisitante = function () {
                return permissionsFormForVisitante;
            };

            $scope.save = function () {

                if ($scope.user.lgpd === 0) {
                    ngToast.danger('Para prosseguir, é preciso concordar com o termo de adesão. Em caso de dúvidas, entre em contato');
                    return;
                }

                if ($scope.user.type === "perfil_visitante") {
                    $scope.user.type = getFinalTypeUser();
                }

                var data = Object.assign({}, $scope.user);
                data = Utils.prepareDateFields(data, dateOnlyFields);
                data = Utils.prepareCityFields(data, ['work_city']);

                if ($scope.isCreating) {
                    return Users.create(data).$promise.then(onSaved)
                }

                Users.update(data).$promise.then(function (res) {
                    if (res.status === "ok") {
                        ngToast.success('TERMO DE RESPONSABILIDADE E CONFIDENCIALIDADE Assinado com Sucesso');
                        $localStorage.identity.current_user.lgpd = 1
                        $state.go('dashboard');
                    } else {
                        ngToast.danger("Ocorreu um erro, por favor procure o nosso suporte" + res.message, res.status);
                    }
                });

            };

            $scope.onSelectTenant = function () {
                $scope.groups = Groups.findByTenant({'tenant_id': $scope.user.tenant_id});
            }

            $scope.onSelectUf = function () {
                $scope.groups = Groups.findByUf({'uf': $scope.user.uf});
            }

            $scope.onSelectFunction = function () {
                if (Identity.getType() === 'superuser' || Identity.getType() === 'gestor_nacional') {
                    $scope.groups = {};
                    $scope.user.uf = null;
                    $scope.user.tenant_id = null;
                    $scope.perfilVisitante.name = '';
                }
            }

            function prepareUserModel(user) {

                if (Identity.getType() === 'superuser' || Identity.getType() === 'gestor_nacional') {

                    if (user.type === 'coordenador_estadual' || user.type === 'gestor_estadual' || user.type === 'supervisor_estadual') {
                        $scope.groups = Groups.findByUf({'uf': user.uf});
                    } else {
                        $scope.groups = Groups.findByTenant({'tenant_id': user.tenant_id});
                    }

                    //perfil de visitante
                    if (user.type.includes("visitante_")) {
                        $scope.permissionsVisitantes = permissionsFormForVisitante[user.type];
                        if (user.type.includes("visitante_nacional")) {
                            $scope.perfilVisitante.name = "visitante_nacional";
                        }
                        if (user.type.includes("visitante_estadual")) {
                            $scope.perfilVisitante.name = "visitante_estadual";
                        }
                        $scope.user.type = "perfil_visitante";
                    }

                } else {
                    $scope.groups = Groups.find();
                }

                return Utils.unpackDateFields(user, dateOnlyFields)
            }

            $scope.showPassowrd = function () {
                var field_password = document.getElementById("fld-password");
                field_password.type === "password" ? field_password.type = "text" : field_password.type = "password"
            }

            function onSaved(res) {
                if (res.status === "ok") {
                    ngToast.success("Dados de usuário salvos com sucesso!");

                    if ($scope.quickAdd && $rootScope.previousState) return $state.go($rootScope.previousState, $rootScope.previousStateParams);
                    if ($scope.isCreating) return $state.go('user_editor', {user_id: res.id});

                    return;
                }

                if (res.messages) return Utils.displayValidationErrors(res);

                ngToast.danger("Ocorreu um erro ao salvar o usuário<br>por favor entre em contato com o nosso suporte informando o nome do erro: " + res.reason);
            }

            function getFinalTypeUser() {
                var finalType = "";
                for (var [key, value] of Object.entries($scope.getPermissionsFormForVisitante())) {
                    if (arraysEqual($scope.permissionsVisitantes.filter(function (obj) {
                        return obj
                    }), value) && key.includes($scope.perfilVisitante.name)) {
                        finalType = key;
                    }
                }
                return finalType;
            }

            function arraysEqual(_arr1, _arr2) {
                if (!Array.isArray(_arr1) || !Array.isArray(_arr2) || _arr1.length !== _arr2.length)
                    return false;
                var arr1 = _arr1.concat().sort();
                var arr2 = _arr2.concat().sort();
                for (var i = 0; i < arr1.length; i++) {
                    if (arr1[i] !== arr2[i])
                        return false;
                }
                return true;
            }

            $scope.openTerm = function () {
                $scope.panelTerm = !$scope.panelTerm;

                console.log($scope.lastCoordinators);
            };

        });

})();
