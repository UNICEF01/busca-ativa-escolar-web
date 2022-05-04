(function() {

    angular
        .module('BuscaAtivaEscolar')
        .config(function($stateProvider) {
            $stateProvider
                .state('maintenance_imports', {
                    url: '/maintenance/imports',
                    templateUrl: '/views/maintenance/imports.html',
                    controller: 'ImportsCtrl'
                })
        })
        .controller('ImportsCtrl',
            function($scope, $timeout, StaticData, ImportJobs, Modals, ngToast, API) {

                $scope.static = StaticData;

                $scope.query = {
                    max: 20,
                    page: 1
                };

                $scope.search = {};

                $scope.refresh = function() {
                    ImportJobs.all({ $hide_loading_feedback: true, per_page: $scope.query.max, page: $scope.query.page }, function(jobs) {
                        $scope.jobs = jobs.data;
                        $scope.search = $scope.returnNewSearch(jobs);

                    });
                };

                $scope.jobs = {};

                $scope.refresh();

                $scope.newImport = function(type) {
                    Modals.show(
                        Modals.FileUploader(
                            'Nova importação',
                            'Selecione o arquivo que deseja importar',
                            API.getURI('maintenance/import_jobs/new'), { type: type }
                        )
                    ).then(function(res) {
                        ngToast.success('Arquivo pronto para processamento!');
                        console.info("[maintenance.imports] Job ready, return: ", res);
                        $scope.refresh();
                    });
                };

                $scope.processJob = function(job) {
                    ImportJobs.process({ id: job.id, $hide_loading_feedback: true }, function(res) {
                        ngToast.success('Processamento do arquivo concluído!');
                        console.info("[maintenance.imports] Job processed, return: ", res);
                    });
                    $timeout($scope.refresh, 100);
                };

                $scope.renderProgress = function(job) {
                    if (job.total_records === 0) return '100 %';
                    return ((job.offset / job.total_records) * 100).toFixed(2) + ' %';
                };

                $scope.returnNewSearch = function(jobs) {
                    return {
                        data: jobs.data,
                        meta: {
                            pagination: {
                                total: jobs.total,
                                count: jobs.per_page,
                                per_page: jobs.per_page,
                                current_page: jobs.current_page,
                                total_pages: jobs.last_page,
                                links: {
                                    next: jobs.next_page_url ? jobs.next_page_url : null,
                                    prev: jobs.prev_page_url ? jobs.prev_page_url : null
                                }
                            }
                        }
                    }
                }

            }
        );
})();