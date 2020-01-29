(function() {

	angular.module('BuscaAtivaEscolar')
		.config(function ($stateProvider) {
			$stateProvider.state('school_browser', {
				url: '/schools',
				templateUrl: '/views/schools/school_browser.html',
				controller: 'SchoolBrowserCtrl'
			});
		})
		.controller('SchoolBrowserCtrl', function ($scope, Schools, ngToast, $state, Modals, Identity, Config, Ufs, Platform) {
                   
			$scope.check_all_schools = false;
			$scope.identity = Identity;
			$scope.schools = {};
			$scope.msg_success = false;
			$scope.msg_error = false;
			$scope.avaliable_years_educacenso = [2017, 2018, 2019];
			$scope.query = {
				year_educacenso: 2019,
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
				}else{
					ngToast.danger("Ocorreu um erro ao salvar a escola!: "+res.message, res.status);
					$scope.refresh();
				}
			};

			$scope.sendnotification = function(){

				//remove objects without email
				var schools_to_send_notification = $scope.selected.schools.filter(function(school){
					if(school.school_email != null && school.school_email != ""){
						return true;
					}else{
						return false;
					}
				});

				if(schools_to_send_notification.length > 0){
					
					Modals.show(
						Modals.ConfirmEmail(
							'Confirma o envio de sms e email para as seguintes escolas?',
							'Ao confirmar, as escolas serão notificadas por email e sms e poderão cadastrar o endereço das crianças e adolescentes reportadas pelo Educacenso',
							schools_to_send_notification
						)).then(function () {
							return Schools.send_notifications(schools_to_send_notification).$promise;
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
				}else{
					Modals.show(Modals.Alert('Atenção', 'Selecione as escolas para as quais deseja encaminhar o email/ SMS'));
				}

			};

			$scope.onSelectYear = function() {
				$scope.query.page = 1;
				$scope.query.max = 5;
				$scope.refresh();
			};

			$scope.refresh = function() {
                Schools.all_educacenso($scope.query, function(res) {
					$scope.check_all_schools = false;
					$scope.selected.schools = [];
					$scope.schools = angular.copy(res);
				});
			};

			$scope.setMaxResults = function(max) {
				$scope.query.max = max;
				$scope.query.page = 1;
				$scope.refresh();
			};
			
			Platform.whenReady(function() {
                $scope.refresh();
			});

		});

})();