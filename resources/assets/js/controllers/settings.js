(function() {

	angular.module('BuscaAtivaEscolar').controller('SettingsCtrl', function ($scope, $stateParams, $state, $rootScope, $window, ngToast, MockData, Identity) {

		$rootScope.section = 'settings';
		$scope.identity = Identity;

		if(!$stateParams.step) {
			if(Identity.can('settings.manage')) return $state.go('settings', {step: 4}); // First tab in settings
			return $state.go('settings', {step: 8}); // Educacenso
		}

		$scope.step = $stateParams.step;
		$scope.isEditing = true;

		$scope.causes = MockData.alertReasonsPriority;
		$scope.newGroupName = "";
		$scope.groups = [
			{name: 'Secretaria Municipal de Educação', canChange: false},
			{name: 'Secretaria Municipal de Assistência Social', canChange: true},
			{name: 'Secretaria Municipal da Saúde', canChange: true}
		];

		$scope.range = function (start, end) {
			var arr = [];

			for(var i = start; i <= end; i++) {
				arr.push(i);
			}

			return arr;
		};

		$scope.goToStep = function (step) {
			$scope.step = step;
			$window.scrollTo(0, 0);
		};

		$scope.nextStep = function() {
			$scope.step++;
			$window.scrollTo(0, 0);
			if($scope.step > 7) $scope.step = 7;
		};

		$scope.prevStep = function() {
			$scope.step--;
			$window.scrollTo(0, 0);
			if($scope.step < 3) $scope.step = 3;
		};

		$scope.removeGroup = function(i) {
			$scope.groups.splice(i, 1);
		};

		$scope.addGroup = function() {
			$scope.groups.push({name: $scope.newGroupName, canChange: true});
			$scope.newGroupName = "";
		};

		$scope.save = function() {
			ngToast.create({
				className: 'success',
				content: 'Configurações salvas!'
			});
		};

	});

})();