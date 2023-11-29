(function () {
  angular
    .module('BuscaAtivaEscolar')
    .config(function ($stateProvider) {
      $stateProvider.state('school_editor', {
        url: '/schools/editor',
        templateUrl: '/views/schools/school_editor.html',
        controller: 'SchoolEditorCtrl',
      });
    })
    .controller(
      'SchoolEditorCtrl',
      function ($scope, $state, ngToast, StaticData, Schools) {
        $scope.school = {};
        $scope.static = StaticData;

        $scope.save = function () {
          let data = {
            codigo: $scope.school.codigo,
            name: $scope.school.name,
            uf: $scope.school.city.uf,
            city_id: $scope.school.city.id,
            city_name: $scope.school.city.name,
            region: $scope.school.city.region,
            uf_id: $scope.school.city.ibge_uf_id,
            city_ibge_id: $scope.school.city.ibge_city_id,
            school_email: $scope.school.email ? $scope.school.email : null,
          };

          Schools.save(data).$promise.then(function (res) {
            // console.log(JSON.stringify(res, null, 3));

            if (res.status === 'ok') {
              ngToast.success('Escola Cadastrada com Sucesso');
              $state.go('dashboard');
            } else if (res.status === 'error') {
              handleErrorResponse(res);
            }
          });
        };

        function handleErrorResponse(res) {
          switch (res.reason) {
            case 'INEP has already been registered':
              ngToast.danger('Código INEP já cadastrado');
              break;
            case 'School name has already been registered':
              ngToast.danger('Nome da escola já cadastrado');
              break;
            case 'validation_failed':
              handleValidationFailure(res);
              break;
            default:
              ngToast.danger('Erro desconhecido ao salvar a escola.');
              break;
          }
        }

        function handleValidationFailure(res) {
          if (res.statusCode === 422 && res.messages) {
            ngToast.danger(
              'Falha na validação dos dados: ' + res.messages.join(', ')
            );
          } else {
            ngToast.danger('Erro desconhecido na validação dos dados.');
          }
        }
      }
    );
})();
