(function () {
  angular
    .module('BuscaAtivaEscolar')
    .config(function ($stateProvider) {
      $stateProvider.state('child_browser', {
        url: '/children',
        templateUrl: '/views/children/browser.html',
        controller: 'ChildSearchCtrl',
      });
    })
    .controller(
      'ChildSearchCtrl',
      function (
        $scope,
        Identity,
        Config,
        Children,
        Decorators,
        Modals,
        Reports,
        ngToast,
        Groups,
        StaticData,
        Platform,
        Cases
      ) {
        $scope.Decorators = Decorators;
        $scope.Children = Children;
        $scope.reports = {};
        $scope.lastOrder = {
          date: null,
        };

        $scope.caseStepList = [
          { key: 'pesquisa', value: 'Pesquisa' },
          { key: 'analise_tecnica', value: 'Analise Técnica' },
          { key: 'gestao_do_caso', value: 'Gestão do Caso' },
          { key: 'rematricula', value: 'Rematricula' },
          { key: '1a_observacao', value: '1ª Observação' },
          { key: '2a_observacao', value: '2ª Observação' },
          { key: '3a_observacao', value: '3ª Observação' },
          { key: '4a_observacao', value: '4ª Observação' },
        ];

        $scope.identity = Identity;

        $scope.defaultQuery = {
          name: '',
          step_name: '',
          assigned_user_name: '',
          location_full: '',
          alert_status: ['accepted'],
          case_status: ['in_progress'],
          risk_level: ['low', 'medium', 'high'],
          age_null: true,
          age: { from: 0, to: 10000 },
          gender: ['male', 'female', 'undefined'],
          gender_null: true,
          place_kind: ['rural', 'urban'],
          place_kind_null: true,
          group_id: null,
          case_not_info: null,
          tree: 1,
          from: 1,
          size: 16,
          tree: 1,
        };

        $scope.numberOfItens = 16;

        $scope.mapOfPage = [];

        $scope.setMaxResults = function (max) {
          $scope.defaultQuery.from = 1;
          $scope.numberOfItens = max;
          $scope.refresh();
        };

        $scope.selected = {
          children: [],
        };

        $scope.branchGroups = 'carregando ...';

        $scope.causes = [];

        $scope.search = {
          stats: { total_results: 0 },
        };

        $scope.reloadData = function () {
          $scope.query.from = 1;
          $scope.refresh();
        };

        $scope.refresh = function () {
          $scope.query.size = $scope.numberOfItens;

          $scope.finalQuery = angular.merge({}, $scope.query);
          $scope.finalQuery.from = $scope.mapOfPage[$scope.query.from - 1];

          Children.search($scope.finalQuery).$promise.then(function (res) {
            $scope.search = res;
            $scope.setMapOfPages();
          });

          $scope.reports = Reports.reportsChild();
          $scope.selected.children = [];
        };

        $scope.resetQuery = function () {
          $scope.setMaxResults(16);
          $scope.defaultQuery.group_id = Identity.getCurrentUser().group.id;
          $scope.defaultQuery.size = 16;
          $scope.defaultQuery.from = 1;
          $scope.selectedGroup = $scope.identity.getCurrentUser().group;

          $scope.query = angular.merge({}, $scope.defaultQuery);
          $scope.refresh();
        };

        $scope.exportXLS = function () {
          Children.export($scope.query, function (res) {
            Modals.show(
              Modals.DownloadLink(
                'Baixar arquivo XLS',
                'Clique no link abaixo para baixar os casos exportados:',
                res.download_url
              )
            );
          });
        };

        $scope.exportXLSReport = function (file) {
          Identity.provideToken().then(function (token) {
            window.open(
              Config.getAPIEndpoint() +
              'reports/child/download?token=' +
              token +
              '&file=' +
              file
            );
          });
        };

        $scope.createXLSReport = function () {
          Reports.createReportChild($scope.query).$promise.then(function (res) {
            $scope.lastOrder.date = res.date;
            $scope.reports = {};
            ngToast.success(
              'Solicitação feita com sucesso. Arquivo estará disponível em breve!'
            );
          });
        };

        $scope.clikcInGroup = function (group_id) {
          $scope.branchGroups = 'carregando ...';
          Groups.findByIdWithParents({ id: group_id }, function (res) {
            var groupOfuserWithParents = res.data[0];
            var groupsOfUser = [];
            groupsOfUser.push(groupOfuserWithParents.name);
            if (groupOfuserWithParents.parent != null) {
              groupsOfUser.push(groupOfuserWithParents.parent.name);
              if (groupOfuserWithParents.parent.parent != null) {
                groupsOfUser.push(groupOfuserWithParents.parent.parent.name);
                if (groupOfuserWithParents.parent.parent.parent != null) {
                  groupsOfUser.push(
                    groupOfuserWithParents.parent.parent.parent.name
                  );
                }
              }
            }
            $scope.branchGroups = groupsOfUser.reverse().join(' > ');
          });
        };

        $scope.changeGroup = function () {
          Modals.show(
            Modals.GroupPicker(
              'Filtrar casos que pertecem ao grupo',
              '',
              Identity.getCurrentUser().group,
              'Filtrando casos do grupo: ',
              false,
              null,
              null,
              true,
              'Nenhum grupo selecionado'
            )
          )
            .then(function (selectedGroup) {
              $scope.selectedGroup = selectedGroup;
              $scope.query.group_id = $scope.selectedGroup.id;
              $scope.defaultQuery.group_id = $scope.selectedGroup.id;
            })
            .then(function () { });
        };

        $scope.onCheckSelectAll = function (element) {
          if (element) {
            $scope.selected.children = angular.copy($scope.search.results);
          } else {
            $scope.selected.children = [];
          }
        };

        $scope.getChild = function (child) {
          if ($scope.check_child) $scope.selected.children.push(child);
          else
            $scope.selected.children = $scope.selected.children.filter(
              function (el) {
                return el.id != child.id;
              }
            );
        };

        $scope.changeAllGroup = function () {
          if ($scope.selected.children.length > 0) {
            Modals.show(
              Modals.GroupPicker(
                'Atribuir alerta ao grupo',
                'Selecione o grupo do qual deseja visualizar os alertas.',
                {
                  id: Identity.getCurrentUser().tenant.primary_group_id,
                  name: Identity.getCurrentUser().tenant.primary_group_name,
                },
                'Filtrando alertas do grupo: ',
                false,
                null,
                null,
                true,
                'Nenhum grupo selecionado'
              )
            )
              .then(function (selectedGroup) {
                Cases.changeGroups({
                  children: $scope.selected.children,
                  group: selectedGroup,
                }).$promise.then(function () {
                  $scope.refresh();
                });
              })
              .then(function () { });
          } else {
            Modals.show(
              Modals.Alert(
                'Atenção',
                'Selecione os casos para os quais deseja atribuir um novo grupo'
              )
            );
          }
        };

        Platform.whenReady(function () {
          $scope.data = StaticData.getCaseCauses();

          if ($scope.causes.length == 0) {
            Object.values($scope.data).forEach((val) =>
              $scope.causes.push({ value: val.id, displayName: val.label })
            );
            $scope.causes.sort((a, b) =>
              a.displayName > b.displayName
                ? 1
                : b.displayName > a.displayName
                  ? -1
                  : 0
            );
            $scope.causes = [...new Set($scope.causes)];
          }

          $scope.selectedGroup = $scope.identity.getCurrentUser().group;
          $scope.defaultQuery.group_id =
            $scope.identity.getCurrentUser().group.id;

          $scope.query = angular.merge({}, $scope.defaultQuery);

          Children.search($scope.query).$promise.then(function (res) {
            $scope.search = res;
            $scope.setMapOfPages();
          });

          $scope.reports = Reports.reportsChild();
        });

        $scope.setMapOfPages = function () {
          var dividendo = $scope.search.stats.total_results;
          var divisor = $scope.numberOfItens;
          var intervals = [];
          let startNumber = 1;
          while (startNumber <= dividendo) {
            intervals.push(startNumber);
            startNumber += divisor;
          }
          $scope.mapOfPage = intervals;
        };

        $scope.checkDisabled = function (child) {
          if (child.assigned_uf) return true;
          if (child.case_status == 'cancelled') return true;
          if (child.case_status == 'completed') return true;
          if (child.case_status == 'transferred') return true;
          if (child.case_status == 'interrupted') return true;
          return false;
        };

        //checkboxes
        $scope.check_all_cases = false;
        $scope.selected = {
          cases: [],
        };
        $scope.onCheckSelectAllCases = function () {
          if ($scope.check_all_cases) {
            $scope.selected.cases = angular.copy($scope.search.results);
          } else {
            $scope.selected.cases = [];
          }
        };
        $scope.changeAllGroups = function () {
          if ($scope.selected.cases.length <= 0) {
            Modals.show(
              Modals.Alert('Atenção', 'Selecione os casos que deseja modificar')
            );
          } else {
            Modals.show(
              Modals.GroupPicker(
                'Atribuir casos ao grupo',
                'Selecione o grupo para onde deseja encaminhar os casos',
                Identity.getCurrentUser().group,
                'Atribuindo casos ao grupo: ',
                false,
                null,
                null,
                true,
                'Nenhum grupo selecionado'
              )
            )
              .then(function (selectedGroup) {
                var obj = {
                  newObject: selectedGroup,
                  cases: $scope.selected.cases,
                };

                return Cases.changeGroups(obj).$promise;
              })
              .then(function (res) {
                if (res.status == 'ok') {
                  ngToast.success('Casos editados com sucesso.');
                  $scope.check_all_cases = false;
                  $scope.selected.cases = [];
                  $scope.refresh();
                } else {
                  ngToast.danger('Ocorreu um erro ao editar os grupos.');
                }
              });
          }
        };
        //----
      }
    );
})();
