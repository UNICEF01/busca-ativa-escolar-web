(function () {
  angular
    .module('BuscaAtivaEscolar')
    .directive(
      'myAssignments',
      function (
        Identity,
        Platform,
        Children,
        Decorators,
        DTOptionsBuilder,
        DTColumnDefBuilder
      ) {
        function init(scope) {
          scope.Decorators = Decorators;
          scope.children = [];

          var isReady = false;

          var language = {
            sEmptyTable: 'Nenhum registro encontrado',
            sInfoFiltered: '(Filtrados de _MAX_ registros)',
            sInfoPostFix: '',
            sInfoThousands: '.',
            sLoadingRecords: 'Carregando...',
            sProcessing: 'Processando...',
            sZeroRecords: 'Nenhum registro encontrado',
            oAria: {
              sSortAscending: ': Ordenar colunas de forma ascendente',
              sSortDescending: ': Ordenar colunas de forma descendente',
            },
          };

          //Configura a linguagem na diretiva dt-options=""
          scope.dtOptions = DTOptionsBuilder.newOptions()
            .withLanguage(language)
            .withOption('paging', false)
            .withOption('searching', false);

          //Configura a linguagem na diretiva dt-column-defs=""
          scope.dtColumnDefs = [
            DTColumnDefBuilder.newColumnDef(6).notSortable(),
          ];

          scope.refresh = function () {
            isReady = false;

            Children.search(
              {
                assigned_user_id: Identity.getCurrentUserID(),
                name: '',
                step_name: '',
                cause_name: '',
                assigned_user_name: '',
                location_full: '',
                alert_status: ['accepted'],
                case_status: ['in_progress'],
                risk_level: ['low', 'medium', 'high'],
                age: { from: 0, to: 100 },
                age_null: true,
                gender: ['male', 'female', 'undefined'],
                gender_null: true,
                place_kind: ['rural', 'urban'],
                place_kind_null: true,
              },
              function (data) {
                scope.children = data.results;
                isReady = true;
              }
            );
          };

          scope.getChildren = function () {
            return scope.children;
          };

          scope.isReady = function () {
            return isReady;
          };

          scope.hasAssignments = function () {
            return scope.children && scope.children.length > 0;
          };

          Platform.whenReady(function () {
            scope.refresh();
          });
        }

        return {
          link: init,
          scope: true,
          replace: true,
          templateUrl: '/views/components/my_assignments.html',
        };
      }
    );
})();
