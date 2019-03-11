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
			$scope.schools = {};
			$scope.msg_success = false;
			$scope.msg_error = false;
			$scope.query = {
				sort: {},
				show_suspended: false,
				max: 5,
				page: 1
			};
			$scope.selected = {
				schools: []
			};
			
			$scope.onCheckSelectAll = function(){
				if( $scope.check_all_schools ){
					$scope.selected.schools = angular.copy($scope.schools.data);
				}else{
					$scope.selected.schools = [];
				}
			};

            $scope.onModifySchool = function(school){
                Schools.update(school).$promise.then($scope.onSaved);
            };
			
			$scope.onSaved = function(res) {
				if(res.status === "ok") {
					ngToast.success("Dados da escola "+res.updated.name+" salvos com sucesso!");
					return;
				}
				ngToast.danger("Ocorreu um erro ao salvar a escola!: ", res.status);
			};

			$scope.sendnotification = function(){

				if($scope.selected.schools.length > 0){
					
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
								ngToast.warning(res.message);
								$scope.msg_success = true;
								$scope.msg_error = false;
								$scope.refresh();
								window.scrollTo(0, 0);
							}
						});
				}

			};

			$scope.refresh = function() {                
                Schools.all_educacenso($scope.query, function(res) {
					$scope.schools = angular.copy(res);
				});
			};
			
			Platform.whenReady(function() {
                $scope.refresh();
			});

		});

})();