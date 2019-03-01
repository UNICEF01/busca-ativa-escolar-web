(function() {

	angular.module('BuscaAtivaEscolar')
		.config(function ($stateProvider) {
			$stateProvider.state('school_browser', {
				url: '/schools',
				templateUrl: '/views/schools/school_browser.html',
				controller: 'SchoolBrowserCtrl'
			})
		})
		.controller('SchoolBrowserCtrl', function ($scope, Schools, ngToast, $state, Modals, Identity, Config, Ufs, Platform) {
                   
			$scope.check_all_schools = false;
			$scope.identity = Identity;
			$scope.schools = [];
			
			$scope.selected = {
				schools: []
			};

			$scope.query = {
				filter: {},
				sort: {},
				max: 16,
				page: 1
			};
			
			$scope.msg_success = false;
			$scope.msg_error = false;
			
			$scope.onCheckSelectAll = function(){
				if( $scope.check_all_schools ){
					$scope.selected.schools = angular.copy($scope.schools);			
				}else{
					$scope.selected.schools = [];
				}
			};

            $scope.onChangeSchool = function(school){
                var school_in_array = $scope.schools.find( function(element_in_array) { return element_in_array.id === school.id } );
                school_in_array = school;
                Schools.update(school_in_array).$promise.then($scope.onSaved);
            };
			
			$scope.onSaved = function(res) {
				if(res.status === "ok") {
					ngToast.success("Dados da escola "+res.updated.name+" salvos com sucesso!");
					return;
				}
				ngToast.danger("Ocorreu um erro ao salvar a escola!: ", res.status);
			};

			$scope.sendnotification = function(){
				
				Modals.show(
					Modals.ConfirmEmail(
						'Confirma o envio de sms e email para as seguintes escolas?',
						'Ao confirmar, as escolas serão notificadas por email e sms e poderão cadastrar o endereço das crianças e adolescentes reportadas pelo Educacenso',
						$scope.selected.schools
					)).then(function () {
						return Schools.send_notifications($scope.selected.schools).$promise;
					})
					.then(function (res) {
						
						if(res.status == "error"){

							ngToast.danger(res.message);
							$scope.msg_success = false;
							$scope.msg_error = true;

							$scope.refresh();
							window.scrollTo(0, 0);
							
						}else{
	
							ngToast.success(res.message);
							$scope.msg_success = true;
							$scope.msg_error = false;

							$scope.refresh();
							window.scrollTo(0, 0);
						}

						
					});

			};

			$scope.refresh = function() {                
                Schools.all_educacenso(function(res) {
					$scope.schools = angular.copy(res.data);	
				});
			};
			
			Platform.whenReady(function() {
                $scope.refresh();
			});

		});

})();