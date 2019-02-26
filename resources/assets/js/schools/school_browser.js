(function() {

	angular.module('BuscaAtivaEscolar')
		.config(function ($stateProvider) {
			$stateProvider.state('school_browser', {
				url: '/schools',
				templateUrl: '/views/schools/school_browser.html',
				controller: 'SchoolBrowserCtrl'
			})
		})
		.controller('SchoolBrowserCtrl', function ($scope, Schools, ngToast, $state, Tenants, Modals, Identity, Config, Ufs, Platform) {
            
            $scope.identity = Identity;
			$scope.schools = [];
			$scope.query = {
				filter: {},
				sort: {},
				max: 16,
				page: 1
            };
            
            $scope.refresh = function() {                
                Schools.all_educacenso(function(res) {
					$scope.schools = res.data;
				});
            };

            $scope.changeSchool = function(scholl){
                console.log(scholl);
            };

            Platform.whenReady(function() {
                $scope.refresh();
            });

		});

})();