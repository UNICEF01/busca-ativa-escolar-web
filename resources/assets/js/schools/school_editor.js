(function () {

	angular.module('BuscaAtivaEscolar')
		.config(function ($stateProvider) {
			$stateProvider.state('school_editor', {
				url: '/schools/editor',
				templateUrl: '/views/schools/school_editor.html',
				controller: 'SchoolEditorCtrl'
			})
		})
		.controller('SchoolEditorCtrl', function ($scope, $state, ngToast, StaticData, Schools) {

			$scope.school = {};
			$scope.static = StaticData;

			$scope.save = function () {

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

					switch (res.status) {
						case 'ok':
							ngToast.create({
								className: 'success',
								content: 'INEP: ' + res.school.id + ' - ' + res.school.name + ' cadastrada com sucesso!'
							});
							break;
						case 'error':
							if (res && res.messages) {
								ngToast.create({
									className: 'danger',
									content: 'Erro ao cadastrar escola! ' + res.messages.join(', ')
								});
							} else if (res && res.message) {
								ngToast.create({
									className: 'danger',
									content: 'Erro ao cadastrar escola! ' + res.message
								});
							} else {
								ngToast.create({
									className: 'danger',
									content: 'Erro ao cadastrar escola!'
								});
							}
							break;
						default:
							ngToast.create({
								className: 'danger',
								content: 'Erro ao cadastrar escola!'
							});
							break;
					}



				});
			};
		});

})();