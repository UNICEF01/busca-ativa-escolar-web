(function() {

	angular
		.module('BuscaAtivaEscolar')
		.controller('FileUploaderTituloModalCtrl', function FileUploaderModalCtrl($scope, $q, $uibModalInstance, Auth, API, StaticData, Upload, uploadUrl, uploadParameters, title, message) {

			console.log("[modal] file_uploader titulo", uploadUrl, uploadParameters, title, message);

			$scope.title = title;
			$scope.message = message;
			$scope.allowedMimeTypes = StaticData.getAllowedMimeTypes().join(",");

			$scope.file = null;
			$scope.progress = 0;
			$scope.isUploading = false;


			$scope.upload = function(file) {

				if(!uploadParameters) uploadParameters = {};
				uploadParameters.file = file;
				$scope.isUploading = true;
				Upload.upload({url: uploadUrl, data: uploadParameters, headers: API.OPTIONAL_AUTH}).then(onSuccess, onError, onProgress);
			};

			function onSuccess(res) {
				if(!res.data) return onError(res);

				console.log('[modal.file_uploader] Uploaded: ', res.config.data.file.name, 'Response: ', res.data);
				$uibModalInstance.close({response: res.data});
				$scope.isUploading = false;
			}

			function onError(res) {
				console.error('[modal.file_uploader] Error when uploading: ', res.status, 'Response: ', res);
				$scope.isUploading = false;
			}

			function onProgress(ev) {
				$scope.progress = (ev.loaded / ev.total);
			}

			$scope.calculateProgressWidth = function() {
				return parseInt(100.0 * $scope.progress) + "%";
			};

			$scope.close = function() {
				$scope.isUploading = false;
				$uibModalInstance.dismiss(false);
			}

		});

})();