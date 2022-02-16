(function() {

	angular.module('BuscaAtivaEscolar')
		.config(function ($stateProvider) {
			$stateProvider.state('user_editor', {
				url: '/users/{user_id}?quick_add',
				templateUrl: '/views/users/editor.html',
				controller: 'UserEditorCtrl'
			})
		})
		.controller('UserEditorCtrl', function ($rootScope, $scope, $state, $stateParams, ngToast, Platform, Cities, Utils, Tenants, Identity, Users, Groups, StaticData) {

			$scope.currentState = $state.current.name;

			$scope.user = {};
			$scope.isCreating = (!$stateParams.user_id || $stateParams.user_id === "new");
			$scope.isReviewing = false;

			$scope.identity = Identity;
			$scope.static = StaticData;
			$scope.showInputKey = false;

			$scope.groupedGroups = [];
			$scope.groupsToMove = [];
			$scope.groupsOfUser = [];

			$scope.tenants = Tenants.find();
			$scope.quickAdd = ($stateParams.quick_add === 'true');

			var permissions = {};
			var dateOnlyFields = ['dob'];

			var userTypeVisitantes = [];
			var permissionsFormForVisitante = [];

			$scope.perfilVisitante = { name: '' };
			$scope.permissionsVisitantes = ['relatorios'];

			Platform.whenReady(function() {

				permissions = StaticData.getPermissions();
				userTypeVisitantes = StaticData.getUserTypeVisitantes();
				permissionsFormForVisitante = StaticData.getPermissionsFormForVisitante();

				if(!$scope.isCreating) {


					if( Identity.getType() === 'superuser' || Identity.getType() === 'gestor_nacional' ){
						$scope.user = Users.find({id: $stateParams.user_id}, prepareUserModel);
					}

					if( Identity.getType() === 'coordenador_operacional' ||
						Identity.getType() === 'gestor_politico' ||
						Identity.getType() === 'supervisor_institucional'){

						$scope.user = Users.find({id: $stateParams.user_id}, prepareUserModel);

						Groups.findGroupedByTenant({tenant_id: Identity.getCurrentUser().tenant_id}, function (res){
							$scope.groupedGroups = res;
							$scope.groupsToMove = $scope.getGroupsToMove();
							$scope.groupsOfUser = $scope.getGroupsOfUser();
						});
					}

				}else{

					if( Identity.getType() === 'superuser' || Identity.getType() === 'gestor_nacional' ){
						$scope.groupedGroups = [];
						$scope.groupsToMove = [];
						$scope.groupsOfUser = [];
					}

					if( Identity.getType() === 'coordenador_operacional' ||
						Identity.getType() === 'gestor_politico' ||
						Identity.getType() === 'supervisor_institucional'){
						Groups.findGroupedByTenant({tenant_id: Identity.getCurrentUser().tenant_id}, function (res){
							$scope.groupedGroups = res;
							$scope.groupsToMove = $scope.getGroupsToMove();
							$scope.groupsOfUser = $scope.getGroupsOfUser();
						});
					}

					if( Identity.getType() === 'gestor_estadual' ||
						Identity.getType() === 'coordenador_estadual' ||
						Identity.getType() === 'supervisor_estadual'){

					}

					if( Identity.getType() === 'comite_nacional' ||
						Identity.getType() === 'comite_estadual' ||
						Identity.getType() === 'perfil_visitante'){
						alert();
					}
				}
			});

			$scope.isSuperAdmin = function() {
				return (Identity.getType() === 'superuser' || Identity.getType() === 'gestor_nacional');
			};

			$scope.isTargetUserTenantBound = function () {
				return (StaticData.getTypesWithGlobalScope().indexOf($scope.user.type) === -1 && StaticData.getTypesWithUFScope().indexOf($scope.user.type) === -1)
			};

			$scope.isTargetUserUFBound = function () {
				return StaticData.getTypesWithUFScope().indexOf($scope.user.type) !== -1;
			};

			$scope.canDefineUserTenant = function() {
				// Can specify user tenant only if superadmin, and only if target user type is tenant-bound
				if(!$scope.isSuperAdmin()) return false;
				return $scope.isTargetUserTenantBound();
			};

			$scope.canDefineUserUF = function() {
				// Only superusers can define user UF, and only on UF-bound user types
				if(!$scope.isSuperAdmin()) return false;
				return StaticData.getTypesWithUFScope().indexOf($scope.user.type) !== -1;
			};

			$scope.openUser = function(user_id, is_reviewing) {
				$scope.isCreating = false;
				$scope.isReviewing = !!is_reviewing;
				$scope.user = Users.find({id: user_id}, prepareUserModel);
			};

			$scope.goBack = function() {
				return $state.go($rootScope.previousState, $rootScope.previousStateParams);
			};

			$scope.getUserTypes = function() {
				if(!permissions) return {};
				if(!permissions.can_manage_types) return {};

				var finalPermissions = permissions.can_manage_types[ Identity.getCurrentUser().type ].filter( function( el ) {
						return $scope.getUserTypesVisitantes().indexOf( el ) < 0;
					} );

				return finalPermissions;
			};

			$scope.getUserTypesVisitantes = function(){
				if(!permissions) return {};
				if(!permissions.can_manage_types) return {};
				return userTypeVisitantes;
			};

			$scope.getPermissionsFormForVisitante = function(){
				return permissionsFormForVisitante;
			};

			$scope.save = function() {

				//validate group
				if( !$scope.user.hasOwnProperty('group') && $scope.isTargetUserTenantBound() ){
					ngToast.danger("Informe o grupo do usuário");
					return ;
				}

				if( $scope.isTargetUserTenantBound() && $scope.user.group == null ){
					ngToast.danger("Informe o grupo do usuário");
					return ;
				}

				//se tiver grupo - set group
				if( $scope.user.hasOwnProperty('group') ){
					$scope.user.group_id = $scope.user.group.id;
				}

				if( $scope.user.type === "perfil_visitante" ){
					$scope.user.type = getFinalTypeUser();
				}

				var data = Object.assign({}, $scope.user);
				data = Utils.prepareDateFields(data, dateOnlyFields);
				data = Utils.prepareCityFields(data, ['work_city']);

				if($scope.isCreating) {
					return Users.create(data).$promise.then(onSaved)
				}

				Users.update(data).$promise.then(onSaved);

			};

            $scope.onSelectTenant = function(){
				Groups.findGroupedByTenant({tenant_id: $scope.user.tenant_id}, function (res){
					$scope.groupedGroups = res;
					$scope.groupsOfUser = $scope.getGroupsToMove();
				});
			};

            $scope.onSelectUf = function(){

            };

            $scope.onSelectFunction = function(){

				//limpa o grupo se não for do municipio
				if( $scope.user.type == 'coordenador_operacional' ||
					$scope.user.type == 'gestor_politico' ||
					$scope.user.type == 'supervisor_institucional' ||
					$scope.user.type == 'agente_comunitario' ||
					$scope.user.type == 'tecnico_verificador'){

					$scope.user.group = null;

				}else{
					$scope.user.group = null;
					$scope.user.group_id = null;
					$scope.user.tenant_id = null;
				}
			};

			function prepareUserModel(user) {

                if( Identity.getType() === 'superuser' || Identity.getType() === 'gestor_nacional' ){

                	if(user.type === 'coordenador_estadual' || user.type === 'gestor_estadual' || user.type === 'supervisor_estadual'){ }

                	//perfil de visitante
                	if( user.type.includes("visitante_") ){
						$scope.permissionsVisitantes = permissionsFormForVisitante[user.type];
                		if( user.type.includes("visitante_nacional") ){
							$scope.perfilVisitante.name = "visitante_nacional";
						}
						if( user.type.includes("visitante_estadual") ){
							$scope.perfilVisitante.name = "visitante_estadual";
						}
						$scope.user.type = "perfil_visitante";
					}

                }else{
				}

                return Utils.unpackDateFields(user, dateOnlyFields)
			};

			$scope.showPassowrd = function () {
                var field_password = document.getElementById("fld-password");
                field_password.type === "password" ? field_password.type = "text" : field_password.type = "password"
            };

			function onSaved(res) {
				if(res.status === "ok") {
					ngToast.success("Dados de usuário salvos com sucesso!");

					if($scope.quickAdd && $rootScope.previousState) return $state.go($rootScope.previousState, $rootScope.previousStateParams);
					if($scope.isCreating) return $state.go('user_editor', {user_id: res.id});

					return;
				}

				if(res.messages) return Utils.displayValidationErrors(res);

				ngToast.danger("Ocorreu um erro ao salvar o usuário<br>por favor entre em contato com o nosso suporte informando o nome do erro: " + res.reason);
			};

			function getFinalTypeUser() {
            	var finalType = "";
				for (var [key, value] of Object.entries($scope.getPermissionsFormForVisitante())) {
					if ( arraysEqual($scope.permissionsVisitantes.filter(function(obj) { return obj }), value) && key.includes($scope.perfilVisitante.name)){
						finalType = key;
					}
				}
				return finalType;
			};

			function arraysEqual(_arr1, _arr2) {
				if (!Array.isArray(_arr1) || ! Array.isArray(_arr2) || _arr1.length !== _arr2.length)
					return false;
				var arr1 = _arr1.concat().sort();
				var arr2 = _arr2.concat().sort();
				for (var i = 0; i < arr1.length; i++) {
					if (arr1[i] !== arr2[i])
						return false;
				}
				return true;
			};

			$scope.getGroupsToMove = function() {
				var groupsToMove = [];
				$scope.groupedGroups.data.forEach(function(v, k){
					groupsToMove.push({id: v.id, name: v.name});
					v.children.forEach(function(v2, k2){
						groupsToMove.push({id: v2.id, name: v2.name, margin: 10});
						v2.children.forEach(function(v3, k3){
							groupsToMove.push({id: v3.id, name: v3.name, margin: 20});
							v3.children.forEach(function(v4, k4){
								groupsToMove.push({id: v4.id, name: v4.name, margin: 30});
							});
						});
					});
				});
				return groupsToMove;
			};

			$scope.getGroupsOfUser = function (){
				var groupsToMove = [];
				groupsToMove.push({id: $scope.getGroupOfCurrentUser().id, name: $scope.getGroupOfCurrentUser().name});
				$scope.getGroupOfCurrentUser().children.forEach(function(v, k){
					groupsToMove.push({id: v.id, name: v.name, margin: 10});
					v.children.forEach(function(v2, k2){
						groupsToMove.push({id: v2.id, name: v2.name, margin: 30});
						v2.children.forEach(function(v3, k3){
							groupsToMove.push({id: v3.id, name: v3.name, margin: 30});
							v3.children.forEach(function(v4, k4){
								groupsToMove.push({id: v4.id, name: v4.name, margin: 40});
							});
						});
					});
				});
				return groupsToMove;
			};

			$scope.getGroupOfCurrentUser = function (){
				var groupedGroupsOfUser = [];
				var userId = Identity.getCurrentUser().group.id;
				$scope.groupedGroups.data.forEach(function(v, k){
					if (v.id == userId) { groupedGroupsOfUser = v; }
					v.children.forEach(function(v2, k2){
						if (v2.id == userId) { groupedGroupsOfUser = v2; }
						v2.children.forEach(function(v3, k3){
							if (v3.id == userId) { groupedGroupsOfUser = v3; }
							v3.children.forEach(function(v4, k4){
								if (v4.id == userId) { groupedGroupsOfUser = v4; }
							});
						});
					});
				});
				return groupedGroupsOfUser;
			};

		});

})();