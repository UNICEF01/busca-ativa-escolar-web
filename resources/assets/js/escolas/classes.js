(function () {

    angular.module('BuscaAtivaEscolar')
        .config(function ($stateProvider) {
            $stateProvider.state('classes', {
                url: '/turmas/{school_id}',
                templateUrl: '/views/escolas/turmas.html',
                controller: 'TurmasCtrl',
                unauthenticated: true
            });
        })
        .controller('TurmasCtrl', function ($scope, $anchorScroll, $httpParamSerializer, $stateParams, API, ngToast, Utils, Classes, Schools, Decorators, Modals, DTOptionsBuilder, DTColumnDefBuilder) {

            $scope.Decorators = Decorators;

            $scope.classe = {};

            $scope.showEdit = false;

            $scope.school_id = $stateParams.school_id;

            $scope.defaultQuery = {
                name: '',
                step_name: '',
                cause_name: '',
                assigned_user_name: '',
                location_full: '',
                alert_status: ['accepted'],
                case_status: ['in_progress'],
                risk_level: ['low', 'medium', 'high'],
                age_null: true,
                age: {from: 0, to: 10000},
                gender: ['male', 'female', 'undefined'],
                gender_null: true,
                place_kind: ['rural', 'urban'],
                place_kind_null: true,
            };

            $scope.refresh = function () {
                $scope.classes = Classes.find('11000023');
                // $scope.school = Schools.findSchoolById($scope.school_id);
            };

            $scope.refresh();

            $scope.edit = function (i) {
                if ($scope.show === i) {
                    $scope.show = false;
                    return;
                }
                $scope.showUpdate = true;
                $scope.show = i;
            }


            function onSaved(res) {

                if (res.success) {
                    ngToast.success(res.message);
                    setInterval(function () {
                        location.reload();
                    }, 3000);

                    return;
                }

                if (res.status === 'error') return Utils.displayValidationErrors(res);

                ngToast.danger("Ocorreu um erro ao salvar o usuário<br>por favor entre em contato com o nosso suporte informando o nome do erro: " + res.reason);


            }

            $scope.addClasse = function () {

                if ($scope.classe.name === undefined || $scope.classe.name === undefined || $scope.classe.name === undefined) {
                    return;
                }


                $scope.classe.schools_id = $scope.school_id;

                Classes.create($scope.classe).$promise.then(onSaved);

            };

            $scope.updateClasse = function (data) {

                $scope.show = false;

                Classes.updateSettings(data).$promise.then(onSaved);

            };


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
            $scope.dtOptions = DTOptionsBuilder.newOptions()
                .withLanguage(language);

            //Configura a linguagem na diretiva dt-column-defs=""
            $scope.dtColumnDefs = [
                DTColumnDefBuilder.newColumnDef(8).notSortable()
            ];

        });
})();