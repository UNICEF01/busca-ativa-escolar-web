(function() {

	angular
		.module('BuscaAtivaEscolar')
		.controller('PromptModalCtrl', function PromptModalCtrl($scope, $q, $uibModalInstance, question, defaultAnswer, canDismiss, answerPlaceholder) {

			//console.log("[modal] prompt_modal", question, canDismiss);

			$scope.question = question;
			$scope.answer = defaultAnswer;
			$scope.placeholder = answerPlaceholder;

			$scope.ok = function() {
				$uibModalInstance.close({response: $scope.answer});
			};

			$scope.cancel = function() {
				$uibModalInstance.dismiss(false);
			};

		});

})();