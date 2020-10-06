(function() {

	angular
		.module('BuscaAtivaEscolar')
		.controller('CaseActivityLogEntryCtrl', function CaseActivityLogEntryCtrl($scope, $q, $uibModalInstance) {

			// TODO: receive case ID, fetch details and show

			//console.log("[modal] case_activity_log_entry");

			$scope.close = function() {
				$uibModalInstance.dismiss(false);
			};

		});

})();