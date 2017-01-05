(function() {
angular.module('BuscaAtivaEscolar').controller('SecondTimeSetupCtrl', function ($scope, $rootScope, $window, Modals, MockData, Identity) {

		$rootScope.section = 'second_time_setup';

		$scope.identity = Identity;
		$scope.step = 1;
		$scope.isEditing = false;

		$scope.causes = MockData.alertReasonsPriority;
		$scope.newGroupName = "";
		$scope.groups = [
			{name: 'Secretaria Municipal de Educação', canChange: false},
			{name: 'Secretaria Municipal de Assistência Social', canChange: true},
			{name: 'Secretaria Municipal da Saúde', canChange: true}
		];

		$rootScope.section = 'users';
		$scope.identity = Identity;

		$scope.range = function (start, end) {
			var arr = [];

			for(var i = start; i <= end; i++) {
				arr.push(i);
			}

			return arr;
		}

		Identity.clearLogin();

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
			if($scope.step < 3) $scope.step = 3;
		};

		$scope.removeGroup = function(i) {
			$scope.groups.splice(i, 1);
		};

		$scope.addGroup = function() {
			$scope.groups.push({name: $scope.newGroupName, canChange: true});
			$scope.newGroupName = "";
		};

		$scope.finish = function() {
			Modals.show(Modals.Confirm(
				'Tem certeza que deseja prosseguir com o cadastro?',
				'Os dados informados poderão ser alterados por você e pelos gestores na área de Configurações.'
			)).then(function(res) {
				Identity.login();
				location.hash = '/dashboard';
			});
		};

	});

})();