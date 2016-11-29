(function() {

	angular.module('BuscaAtivaEscolar').controller('SettingsCtrl', function ($scope, $rootScope, $window, ngToast, MockData, Identity) {

		$rootScope.section = 'settings';
		$scope.identity = Identity;

		$scope.identity = Identity;
		$scope.step = 1;
		$scope.causes = MockData.alertReasons;
		$scope.newGroupName = "";
		$scope.groups = [
			'Secretaria dos Transportes',
			'Secretaria de Assistência Social',
			'Secretaria da Educação',
			'Secretaria dos Direitos Humanos e Cidadania',
			'Secretaria da Saúde'
		];

		$scope.goToStep = function (step) {
			$scope.step = step;
			$window.scrollTo(0, 0);
		};

		$scope.nextStep = function() {
			$scope.step++;
			$window.scrollTo(0, 0);
			if($scope.step > 6) $scope.step = 6;
		};

		$scope.prevStep = function() {
			$scope.step--;
			$window.scrollTo(0, 0);
			if($scope.step < 1) $scope.step = 1;
		};

		$scope.removeGroup = function(i) {
			$scope.groups.splice(i, 1);
		};

		$scope.addGroup = function() {
			$scope.groups.push($scope.newGroupName);
			$scope.newGroupName = "";
		};

		$scope.finish = function() {
			ngToast.create({
				className: 'success',
				content: 'Configurações salvas!'
			});
		};

	});

})();