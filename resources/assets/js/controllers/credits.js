(function() {

	angular.module('BuscaAtivaEscolar').controller('CreditsCtrl', function ($scope, $rootScope, AppDependencies) {

		//console.log("Displaying app dependencies: ", AppDependencies);
		$rootScope.section = 'credits';
		$scope.appDependencies = AppDependencies;

	});

})();