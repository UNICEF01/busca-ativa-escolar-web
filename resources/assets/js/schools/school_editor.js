(function() {

	angular.module('BuscaAtivaEscolar')
		.config(function ($stateProvider) {
			$stateProvider.state('school_editor', {
				url: '/schools/editor',
				templateUrl: '/views/schools/school_editor.html',
				controller: 'SchoolEditorCtrl'
			})
		})
		.controller('SchoolEditorCtrl', function ($rootScope, $scope, $state, ngToast, Platform, Utils, StaticData, Schools) {

			$scope.school = {};
			$scope.static = StaticData;
			$scope.save = function() {
				let data = {
					'codigo': $scope.school.codigo,
					'name': $scope.school.name,
					'uf': $scope.school.city.uf,
					'city_id': $scope.school.city.id,
					'city_name': $scope.school.city.name,
					'region': $scope.school.city.region,
					'uf_id': $scope.school.city.ibge_uf_id,
					'city_ibge_id': $scope.school.city.ibge_city_id,
					'school_email': $scope.school.email ? $scope.school.email : null,
				}
                Schools.save(data).$promise.then(function (res) {
                    if (res.status === "ok"){
						ngToast.success('Escola Cadastrada com Sucesso');
						$state.go('dashboard');
					}
                        
                    if (res.status === 'error') 
                        alert('Código INEP já cadastrado para escola com o nome ' + res.name)
                });
			};
		});

})();