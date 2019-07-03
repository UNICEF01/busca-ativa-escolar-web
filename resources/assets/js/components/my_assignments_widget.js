(function () {

    angular.module('BuscaAtivaEscolar').directive('myAssignments', function (moment, Identity, Platform, Children, Decorators, DTOptionsBuilder, DTColumnDefBuilder) {

        function init(scope, element, attrs) {
            scope.Decorators = Decorators;
            scope.children = [];

            var isReady = false;

            var language = {
                "sEmptyTable": "Nenhum registro encontrado",
                "sInfo": "Mostrando de _START_ até _END_ de _TOTAL_ registros",
                "sInfoEmpty": "Mostrando 0 até 0 de 0 registros",
                "sInfoFiltered": "(Filtrados de _MAX_ registros)",
                "sInfoPostFix": "",
                "sInfoThousands": ".",
                "sLengthMenu": "_MENU_ resultados por página",
                "sLoadingRecords": "Carregando...",
                "sProcessing": "Processando...",
                "sZeroRecords": "Nenhum registro encontrado",
                "sSearch": "Pesquisar",
                "oPaginate": {
                    "sNext": "Próximo",
                    "sPrevious": "Anterior",
                    "sFirst": "Primeiro",
                    "sLast": "Último"
                },
                "oAria": {
                    "sSortAscending": ": Ordenar colunas de forma ascendente",
                    "sSortDescending": ": Ordenar colunas de forma descendente"
                }
            }

            //Configura a linguagem na diretiva dt-options=""
            scope.dtOptions = DTOptionsBuilder.newOptions()
                .withLanguage(language);

            //Configura a linguagem na diretiva dt-column-defs=""
            scope.dtColumnDefs = [
                DTColumnDefBuilder.newColumnDef(6).notSortable()
            ];

            scope.refresh = function () {
                console.log("[widget.my_assignments] Loading assignments...");
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
                        age: {from: 0, to: 100},
                        age_null: true,
                        gender: ['male', 'female', 'undefined'],
                        gender_null: true,
                        place_kind: ['rural', 'urban'],
                        place_kind_null: true
                    },
                    function (data) {
                        //console.log("[widget.my_assignments] Loaded: ", data.results);
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
                return (scope.children && scope.children.length > 0);
            };

            Platform.whenReady(function () {
                scope.refresh();
            });
        }

        return {
            link: init,
            scope: true,
            replace: true,
            templateUrl: '/views/components/my_assignments.html'
        };
    });

})();