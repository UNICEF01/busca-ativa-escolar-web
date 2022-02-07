(function() {

	angular.module('BuscaAtivaEscolar').directive('debugStats', function (Config, Identity, Auth) {

		function init(scope, element, attrs) {
			scope.isEnabled = false;
			scope.identity = Identity;
			scope.auth = Auth;
			scope.config = Config;
		}
		
		return {
			link: init,
			replace: true,
			templateUrl: '/views/components/debug_stats.html' 

		};
	});

})();