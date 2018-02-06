(function() {

	angular
		.module('BuscaAtivaEscolar')
		.controller('DownloadLinkModalCtrl', function ConfirmModalCtrl($scope, $q, $uibModalInstance, title, message, href) {

			console.log("[modal] download_link ", title, message, href);

			$scope.title = title;
			$scope.message = message;
			$scope.href = href;

			$scope.back = function() {
				$uibModalInstance.dismiss(false);
			};

		});

})();