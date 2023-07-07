(function () {
  angular
    .module('BuscaAtivaEscolar')
    .controller(
      'FileUploaderModalCtrl',
      function FileUploaderModalCtrl(
        $scope,
        $uibModalInstance,
        API,
        StaticData,
        Upload,
        uploadUrl,
        uploadParameters,
        title,
        message
      ) {
        $scope.title = title;
        $scope.message = message;
        $scope.allowedMimeTypes = StaticData.getAllowedMimeTypes().join(',');

        $scope.file = null;
        $scope.progress = 0;
        $scope.uploadingFile = false;

        $scope.upload = function (file) {
          if (!uploadParameters) uploadParameters = {};
          uploadParameters.file = file;

          $scope.uploadingFile = true;

          Upload.upload({
            url: uploadUrl,
            data: uploadParameters,
            headers: API.REQUIRE_AUTH,
          }).then(onSuccess, onError, onProgress);
        };

        function onSuccess(res) {
          if (!res.data) return onError(res);

          $uibModalInstance.close({ response: res.data });
          $scope.uploadingFile = false;
        }

        function onError(res) {
          console.error(
            '[modal.file_uploader] Error when uploading: ',
            res.status,
            'Response: ',
            res
          );
          $scope.uploadingFile = false;
        }

        function onProgress(ev) {
          $scope.progress = ev.loaded / ev.total;
        }

        $scope.calculateProgressWidth = function () {
          return parseInt(100.0 * $scope.progress) + '%';
        };

        $scope.close = function () {
          $scope.uploadingFile = false;
          $uibModalInstance.dismiss(false);
        };
      }
    );
})();
