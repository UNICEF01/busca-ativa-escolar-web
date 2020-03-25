(function() {

    angular.module('BuscaAtivaEscolar')
        .config(function ($stateProvider) {
            $stateProvider.state('user_editor_visitante', {
                url: '/users/visitantes/{user_id}?quick_add',
                templateUrl: '/views/users/editor_visitante.html',
                controller: 'UserEditorVisitanteCtrl'
            })
        })
        .controller('UserEditorVisitanteCtrl', function ($rootScope, $scope, $state, $stateParams, ngToast, Platform, Cities, Utils, Tenants, Identity, Users, Groups, StaticData) {

            $scope.user = {};
            $scope.isCreating = (!$stateParams.user_id || $stateParams.user_id === "new");
            $scope.isReviewing = false;

            $scope.identity = Identity;
            $scope.static = StaticData;

            $scope.quickAdd = ($stateParams.quick_add === 'true');

            var userTypeVisitantes = [];
            var dateOnlyFields = ['dob'];

            Platform.whenReady(function() {
                userTypeVisitantes = StaticData.getUserTypeVisitantes();
            });

            if(!$scope.isCreating) {
                $scope.user = Users.find({id: $stateParams.user_id}, prepareUserModel);
            }

            $scope.isSuperAdmin = function() {
                return (Identity.getType() === 'superuser' || Identity.getType() === 'gestor_nacional');
            };

            $scope.goBack = function() {
                return $state.go($rootScope.previousState, $rootScope.previousStateParams);
            };

            $scope.getUserTypes = function() {
                return userTypeVisitantes;
            };

            $scope.canDefineUserUF = function() {
                return StaticData.getTypesWithUFScope().indexOf($scope.user.type) !== -1;
            };

            $scope.save = function() {

                var data = Object.assign({}, $scope.user);
                data = Utils.prepareDateFields(data, dateOnlyFields);
                data = Utils.prepareCityFields(data, ['work_city']);

                if($scope.isCreating) {
                    return Users.create(data).$promise.then(onSaved)
                }

                Users.update(data).$promise.then(onSaved);

            };

            function prepareUserModel(user) {

                if( Identity.getType() === 'superuser' || Identity.getType() === 'gestor_nacional' ){

                    if(user.type === 'coordenador_estadual' || user.type === 'gestor_estadual' || user.type === 'supervisor_estadual'){
                        $scope.groups = Groups.findByUf({'uf': user.uf});
                    }else {
                        $scope.groups = Groups.findByTenant({'tenant_id': user.tenant_id});
                    }

                }else{
                    $scope.groups = Groups.find();
                }

                return Utils.unpackDateFields(user, dateOnlyFields)
            }

            $scope.showPassowrd = function () {
                var field_password = document.getElementById("fld-password");
                field_password.type === "password" ? field_password.type = "text" : field_password.type = "password"
            }

            function onSaved(res) {
                if(res.status === "ok") {
                    ngToast.success("Dados de usuário salvos com sucesso!");

                    if($scope.quickAdd && $rootScope.previousState) return $state.go($rootScope.previousState, $rootScope.previousStateParams);
                    if($scope.isCreating) return $state.go('user_editor', {user_id: res.id});

                    return;
                }

                if(res.messages) return Utils.displayValidationErrors(res);

                ngToast.danger("Ocorreu um erro ao salvar o usuário<br>por favor entre em contato com o nosso suporte informando o nome do erro: " + res.reason);
            }

        });

})();