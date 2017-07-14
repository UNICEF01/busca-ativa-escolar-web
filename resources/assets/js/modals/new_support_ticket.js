(function() {

	angular
		.module('BuscaAtivaEscolar')
		.controller('NewSupportTicketModalCtrl', function NewSupportTicketModalCtrl($scope, $q, $http, ngToast, Identity, SupportTicket, $uibModalInstance) {

			console.log("[modal] new_support_ticket_modal");

			$scope.isLoading = false;

			$scope.ticket = {
				name: '',
				city_name: '',
				phone: '',
				email: '',
				message: ''
			};

			$scope.submitTicket = function() {
				$scope.isLoading = true;

				SupportTicket.submit($scope.ticket, function(res) {
					$scope.isLoading = false;

					ngToast.success('Solicitação de suporte enviada com sucesso!');
					$uibModalInstance.close({response: $scope.answer});
				});
				
				return false;
			};

			$scope.cancel = function() {
				$uibModalInstance.dismiss(false);
			};

		});

})();