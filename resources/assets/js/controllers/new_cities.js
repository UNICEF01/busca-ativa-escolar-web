(function() {

	angular.module('BuscaAtivaEscolar').controller('NewCityCtrl', function ($scope, $rootScope, MockData, Identity, Modals) {

		$rootScope.section = 'cities';
		$scope.identity = Identity;
		
		var list = [
			{id: '1', name: 'Município já participante do programa'},
		    {id: '2', name: 'Os dados cadastrados são falsos'}
		];

		$scope.range = function (start, end) {
			var arr = [];

			for(var i = start; i <= end; i++) {
				arr.push(i);
			}

			return arr;
		}

		$scope.accept = function() {
			Modals.show(Modals.Confirm(
				'Tem certeza que deseja ACEITAR este município?','Esta ação não poderá ser desfeita. O Cordenador Operacional receberá um email com os dados de acesso do sistema.'
			)).then(function(res) {
				Identity.login();
				location.hash = '/cities';
			});
		};

		$scope.deny = function() {
			Modals.show(Modals.ConfirmSelect(
				'Tem certeza que deseja INDEFERIR este município?','Esta ação não poderá ser desfeita.', list
			)).then(function(res) {
				Identity.login();
				location.hash = '/cities';
			});
		};

	});

})();