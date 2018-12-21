(function() {

	angular.module('BuscaAtivaEscolar')
		.config(function ($stateProvider) {
			$stateProvider.state('user_alerts', {
				url: '/user_alerts',
				templateUrl: '/views/children/user_alerts.html',
				controller: 'UserAlertsCtrlCtrl'
			})
		})
		.controller('UserAlertsCtrlCtrl', function () {


		});

})();