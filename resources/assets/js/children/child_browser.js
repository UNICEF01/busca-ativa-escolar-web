(function () {
    

    angular.module('BuscaAtivaEscolar')
        .config(function ($stateProvider) {
            $stateProvider.state('child_browser', {
                url: '/children',
                templateUrl: '/views/children/browser.html',
                controller: 'ChildSearchCtrl'
            });

        })
        .controller('ChildSearchCtrl', function ($scope, Identity, Config, Children, Decorators, Modals, DTOptionsBuilder, DTColumnDefBuilder, Reports, ngToast, Groups, StaticData, Platform) {

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
                group_id: null,
                case_not_info: null
            };

            $scope.groups =  [];
            if($scope.groups.length == 0){
                Groups.findUserGroups(function(res){
                    res.data.forEach(function(v){
                        $scope.groups.push(({value: v.id, displayName: v.name}));
                        const size = Object.keys(v).length;
                        if(size > 2){
                            for(let i  = 0; i < size - 2; ++i){
                                v[i].name = v[i].name.trim()
                                v[i].name = Array(6).fill('\xa0').join('') + v[i].name
                                $scope.groups.push(({value: v[i].id, displayName: v[i].name}));
                                const size1 = Object.keys(v[i]).length;
                                if(size1 > 2){
                                    for(let j  = 0; j < size1 - 2; ++j){
                                        v[i][j].name = v[i][j].name.trim()
                                        v[i][j].name = Array(12).fill('\xa0').join('') + v[i][j].name
                                        $scope.groups.push(({value: v[i][j].id, displayName: v[i][j].name}));
                                        const size2 = Object.keys(v[i][j]).length;
                                        if(size2 > 2){
                                            for(let l  = 0; l < size2 - 2; ++l){
                                                v[i][j][l].name = v[i][j][l].name.trim()
                                                v[i][j][l].name = Array(18).fill('\xa0').join('') + v[i][j][l].name
                                                $scope.groups.push(({value: v[i][j][l].id, displayName: v[i][j][l].name}));
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    });
                });
            }
            
            $scope.branchGroups = "carregando ...";

            $scope.causes = [];
            
            $scope.query = angular.merge({}, $scope.defaultQuery);
            $scope.search = {};

            $scope.refresh = function () {
                $scope.search = Children.search($scope.query);
                $scope.reports = Reports.reportsChild();          
            };
            
            $scope.resetQuery = function () {
                $scope.query = angular.merge({}, $scope.defaultQuery);
                $scope.refresh();
                angular.element('#select_parent').css('text-indent', 0);
            };

            $(function() {
                $('#select_parent').bind("change", function() {
                    var space_offset =7;
                    var matches = $('#select_parent option:selected').text().search(/\S/);
                    var number = matches == 23 ? 23: matches == 29 ? 50 : matches == 35 ? 78: '';
                    $(this).css('text-indent', -(number));
                });
            });
            
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

            $scope.clikcInGroup = function (group_id){
                $scope.branchGroups = "carregando ...";
                Groups.findByIdWithParents({id: group_id}, function (res){
                    var groupOfuserWithParents = res.data[0];
                    var groupsOfUser = [];
                    groupsOfUser.push(groupOfuserWithParents.name);
                    if ( groupOfuserWithParents.parent != null) {
                        groupsOfUser.push(groupOfuserWithParents.parent.name);
                        if ( groupOfuserWithParents.parent.parent != null) {
                            groupsOfUser.push(groupOfuserWithParents.parent.parent.name);
                            if ( groupOfuserWithParents.parent.parent.parent != null) {
                                groupsOfUser.push(groupOfuserWithParents.parent.parent.parent.name);
                            }
                        }
                    }
                    $scope.branchGroups = groupsOfUser.reverse().join(' > ');
                });
            };



            Platform.whenReady(function() {
                $scope.data = StaticData.getCaseCauses()
                if($scope.causes.length == 0){
                    Object.values($scope.data).forEach(val => $scope.causes.push(({value: val.id, displayName: val.label})));
                    $scope.causes.sort((a,b) => (a.displayName > b.displayName) ? 1 : ((b.displayName > a.displayName) ? -1 : 0))
                    $scope.causes =  [...new Set($scope.causes)];
                }
                
            });
        });     
})();