(function() {

	angular.module('BuscaAtivaEscolar').controller('SignUpCtrl', function ($scope, $rootScope, $window, Modals, MockData, Identity) {
		
		$scope.cities = MockData.cities;
		$scope.states = MockData.states;

		$rootScope.section = 'sign_up';

		$scope.identity = Identity;
		$scope.step = 1;
		$scope.agreeTOS = 0;

		Identity.clearLogin();

		$scope.goToStep = function (step) {
			if(!$scope.agreeTOS) return;

			$scope.step = step;
			$window.scrollTo(0, 0);
		};

		$scope.nextStep = function() {
			if($scope.step >= 4) return;

			$scope.step++;
			$window.scrollTo(0, 0);
			if($scope.step > 3) $scope.step = 3;
		};

		$scope.prevStep = function() {
			if($scope.step >= 4) return;

			$scope.step--;
			$window.scrollTo(0, 0);
			if($scope.step < 1) $scope.step = 1;
		};

		$scope.finish = function() {
			if(!$scope.agreeTOS) return;
			if($scope.step >= 4) return;

			Modals.show(Modals.Confirm(
				'Tem certeza que deseja prosseguir com o cadastro?',
				'Os dados informados serão enviados para validação e aprovação de nossa equipe. Caso aprovado, você receberá uma mensagem em seu e-mail institucional com os dados para acesso à plataforma, e instruções de como configurá-la.'
			)).then(function(res) {
				$scope.step = 4;
			});
		};

	});

})();