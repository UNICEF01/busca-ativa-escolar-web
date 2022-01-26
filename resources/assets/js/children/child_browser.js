(function () {
    

    angular.module('BuscaAtivaEscolar')
        .config(function ($stateProvider) {
            $stateProvider.state('child_browser', {
                url: '/children',
                templateUrl: '/views/children/browser.html',
                controller: 'ChildSearchCtrl'
            });

        })

        .controller('ChildSearchCtrl', function ($scope, Identity, Config, Children, Decorators, Modals, DTOptionsBuilder, DTColumnDefBuilder, Reports, ngToast, Groups) {

            $scope.Decorators = Decorators;
            $scope.Children = Children;
            $scope.reports = {};
            $scope.lastOrder = {
                date: null
            };
            $scope.identity = Identity;
            
      
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
                group_id: null
            };

            $scope.query = angular.merge({}, $scope.defaultQuery);
            $scope.operators = [];
            $scope.search = {};

            $scope.refresh = function () {
                $scope.search = Children.search($scope.query);
                $scope.reports = Reports.reportsChild();
                $scope.groups =  [];
                Groups.findGroupedGroups(function(res){
                    res.data.forEach(function(v){
                        $scope.groups.push({value: v.id, displayName: v.name});
                        v.children.forEach(function(v2){ 
                            v2.name = v2.name.trim()
                            v2.name = Array(3).fill('\xa0').join('') + v2.name
                            $scope.groups.push({value: v2.id, displayName: v2.name});
                            v2.children.forEach(function(v3){
                                v3.name = v3.name.trim()
                                v3.name = Array(6).fill('\xa0').join('') + v3.name
                                $scope.groups.push({value: v3.id, displayName: v3.name});
                                v3.children.forEach(function(v4){ 
                                    v4.name = v4.name.trim()
                                    v4.name = Array(9).fill('\xa0').join('') + v4.name
                                    $scope.groups.push({value: v4.id, displayName: v4.name});
                                  
                                });
                            });
                        });
                       
                    });
                })
            };

            
            $scope.resetQuery = function () {
                $scope.query = angular.merge({}, $scope.defaultQuery);
                $scope.refresh();
            };

            $scope.exportXLS = function () {
                Children.export($scope.query, function (res) {
                    Modals.show(Modals.DownloadLink('Baixar arquivo XLS', 'Clique no link abaixo para baixar os casos exportados:', res.download_url));
                });
            };
            
            $scope.exportXLSReport = function(file){
                Identity.provideToken().then(function (token) {
                    window.open(Config.getAPIEndpoint() + 'reports/child/download?token=' + token + "&file=" + file);
                });
            };

            $scope.createXLSReport = function(){

                Reports.createReportChild($scope.query).$promise
                    .then(function (res) {
                        $scope.lastOrder.date = res.date;
                        $scope.reports = {};

                        ngToast.success("Solicitação feita com sucesso. Arquivo estará disponível em breve!");

                        setInterval(function() {
                            $scope.reports = Reports.reportsChild();
                            $scope.lastOrder.date = null;
                        }, 600000);
                    });
            };

            $scope.refresh();

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