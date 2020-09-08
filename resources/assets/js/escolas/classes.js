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

            $scope.classe = {
                name: '',
                shift: '',
                qty_enrollment: ''
            };

            $scope.classes = {
              school: {
                  periodicidade: null
              }
            };

            $scope.showEdit = false;

            $scope.school_id = $stateParams.school_id;


            $scope.refresh = function () {
                $scope.classes = Classes.find({id: $scope.school_id});
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


            function validate(obj) {
                for (var prop in obj) {
                    if ((obj[prop] === undefined) || (obj[prop] === null) || (obj[prop] === '')) {
                        return false;
                    }
                }
                return true;
            }


            function onSaved(res) {

                if (res.success) {
                    ngToast.success(res.message);
                    setInterval(function () {
                        location.reload();
                    }, 2000);

                    return;
                }

                if (res.status === 'error') return Utils.displayValidationErrors(res);

                ngToast.danger("Ocorreu um erro ao salvar o usuário<br>por favor entre em contato com o nosso suporte informando o nome do erro: " + res.reason);

            }

            function onUpdated(res) {

                if (res.success) {
                    ngToast.success(res.message);
                    return;
                }

                if (res.status === 'error') return Utils.displayValidationErrors(res);

                ngToast.danger("Ocorreu um erro ao salvar o usuário<br>por favor entre em contato com o nosso suporte informando o nome do erro: " + res.reason);

            }

            $scope.addClasse = function () {
                $scope.classe.schools_id = $scope.school_id;
                $scope.classe.periodicidade = $scope.classes.school.periodicidade;
                Classes.create($scope.classe).$promise.then(onSaved);
            };


            $scope.updateClasse = function (data) {

                var check = validate(data);

                if (!check) {
                    ngToast.success('Favor preencher todos os campos');
                    return;
                }

                if (data === undefined) {
                    data = {periodicidade: $scope.classes.school.periodicidade};
                }

                $scope.show = false;

                Classes.updateSettings(data).$promise.then(onUpdated);

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
                // DTColumnDefBuilder.newColumnDef(8).notSortable()
            ];

            //deletar classe
            $scope.removeClasse = function (classe) {
                Modals.show(
                    Modals.Confirm(
                        "Confirma a remoção da turma "+classe.name+"? " +
                        "As frequências registradas serão removidas.")
                    )
                    .then(function () {
                        Classes.deleteClasse({id: classe.id}).$promise.then( function (res) {
                            if (res.success) {
                                ngToast.success(res.message);
                                $scope.refresh();
                            }
                        });
                    });
            };

            $scope.finish = function(){

                    var alertDiaria = "Atenção! Após a primeira configuração e turmas já registradas, você receberá um e-mail, no próximo dia útil, para cadastrar o acompanhamento de frequência escolar de acordo com a periodicidade escolhida.";
                    var alertSemanal = "Atenção! Após a primeira configuração e turmas já registradas, você receberá um e-mail, no início da próxima semana, para cadastrar o acompanhamento de frequência escolar de acordo com a periodicidade escolhida.";
                    var alertQuinzenal = "Atenção! Após a primeira configuração e turmas já registradas, você receberá um e-mail, no início da próxima quinzena, para cadastrar o acompanhamento de frequência escolar de acordo com a periodicidade escolhida.";
                    var alertMensal = "Atenção! Após a primeira configuração e turmas já registradas, você receberá um e-mail, no início do próximo mês, para cadastrar o acompanhamento de frequência escolar de acordo com a periodicidade escolhida.";

                    var msgFinal = "";

                    switch ($scope.classes.school.periodicidade) {
                        case 'Diaria':
                            msgFinal = alertDiaria;
                            break;
                        case 'Semanal':
                            msgFinal = alertSemanal;
                            break;
                        case 'Quinzenal':
                            msgFinal = alertQuinzenal;
                            break;
                        case 'Mensal':
                            msgFinal = alertMensal;
                            break;
                    }

                Modals.show(
                    Modals.Confirm(msgFinal))
                    .then(function () {
                        window.location.href = "/frequencia/"+$scope.school_id;
                    });
            };

        });
})();