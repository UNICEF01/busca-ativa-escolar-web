(function() {

    angular
        .module('BuscaAtivaEscolar')
        .controller('PromptModalCtrl', function PromptModalCtrl($scope, $uibModalInstance, question, defaultAnswer, answerPlaceholder) {


            $scope.question = question;
            $scope.answer = defaultAnswer;
            $scope.placeholder = answerPlaceholder;

            $scope.ok = function() {
                $uibModalInstance.close({ response: $scope.answer });
            };

            $scope.cancel = function() {
                $uibModalInstance.dismiss(false);
            };

        });

})();