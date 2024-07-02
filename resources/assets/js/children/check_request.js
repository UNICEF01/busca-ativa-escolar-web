(function () {
  angular
    .module('BuscaAtivaEscolar')
    .config(function ($stateProvider) {
      $stateProvider.state('checks', {
        url: '/checks',
        templateUrl: '/views/children/checks.html',
        controller: 'CheckRequestCtrl',
      });
    })
    .controller(
      'CheckRequestCtrl',
      function (
        $scope,
        Children,
        Decorators,
        ngToast,
        DTOptionsBuilder,
        DTColumnDefBuilder,
        Modals
      ) {
        $scope.Decorators = Decorators;
        $scope.Children = Children;

        $scope.query = angular.merge({}, $scope.defaultQuery);
        $scope.requests = {};

        $scope.refresh = function () {
          $scope.requests = Children.requests();
        };

        $scope.refresh();

        var language = {
          sEmptyTable: 'Nenhum registro encontrado',
          sInfo: 'Mostrando de _START_ até _END_ de _TOTAL_ registros',
          sInfoEmpty: 'Mostrando 0 até 0 de 0 registros',
          sInfoFiltered: '(Filtrados de _MAX_ registros)',
          sInfoPostFix: '',
          sInfoThousands: '.',
          sLengthMenu: '_MENU_ resultados por página',
          sLoadingRecords: 'Carregando...',
          sProcessing: 'Processando...',
          sZeroRecords: 'Nenhum registro encontrado',
          sSearch: 'Pesquisar',
          oPaginate: {
            sNext: 'Próximo',
            sPrevious: 'Anterior',
            sFirst: 'Primeiro',
            sLast: 'Último',
          },
          oAria: {
            sSortAscending: ': Ordenar colunas de forma ascendente',
            sSortDescending: ': Ordenar colunas de forma descendente',
          },
        };

        //Configura a linguagem na diretiva dt-options=""
        $scope.dtOptions = DTOptionsBuilder.newOptions().withLanguage(language);

        $scope.dtColumnDefs = [
          DTColumnDefBuilder.newColumnDef([0]).withOption('type', 'date'),
        ];

        $scope.aprove = function (child) {
          if (child.type_request === 'reopen') {
            Children.reopenCase({
              case_id: child.child.current_case_id,
              reason: 'request',
            }).$promise.then(function (res) {
              if (res.status !== 'error') {
                ngToast.success(res.result);
                setTimeout(function () {
                  window.location =
                    'children/view/' + res.child_id + '/consolidated';
                }, 4000);
              } else {
                ngToast.danger('Erro ao reabrir o caso!');
              }
            });
          }

          if (child.type_request === 'transfer') {
            Children.transferCase({
              case_id: child.child.current_case_id,
            }).$promise.then(function (res) {
              if (res.status !== 'error') {
                ngToast.success(res.result);
                setTimeout(function () {
                  window.location =
                    'children/view/' + res.child_id + '/consolidated';
                }, 4000);
              } else {
                ngToast.danger('Erro ao reabrir o caso!');
              }
            });
          }
        };
        $scope.reject = function (child) {
          Modals.show(Modals.CaseReject($scope.identity.getType()))
            .then(function (response) {
              if (!response) return $q.reject();

              if ($scope.identity.getType() === 'coordenador_operacional') {
                Children.reject({
                  id: child.id,
                  reject_reason: response.reason,
                }).$promise.then(function (res) {
                  if (res.status !== 'error') {
                    ngToast.success(res.result);
                    setTimeout(function () {
                      window.location = 'checks';
                    }, 4000);
                  } else {
                    ngToast.danger(res.result);
                  }
                });
              } else {
                ngToast.warning('Você não pode realizar essa ação.');
              }
            })
            .then(function () {});
        };
      }
    );
})();
