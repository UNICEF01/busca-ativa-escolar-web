(function() {
	identify('core', 'app.js');

	angular
		.module('BuscaAtivaEscolar', [
			'ngToast',
			'ngAnimate',
			'ngCookies',
			'ngResource',
			'ngStorage',
			'ngFileUpload',

			'BuscaAtivaEscolar.Config',

			'angularMoment',
			'highcharts-ng',
			'checklist-model',

			'idf.br-filters',
			'jsonFormatter',
			'uiGmapgoogle-maps',

			'ui.router',
			'ui.bootstrap',
			'ui.select',
			'ui.utils.masks',
			'ui.ace',
			'datatables',
            'ui.mask',
            'angular.viacep',
			'ngclipboard',
			'ng-fusioncharts',
			// 'heremaps',
		])
})();

(function() {

	identify('core', 'config.js');

	angular
		.module('BuscaAtivaEscolar.Config', [])
		.factory('Config', function Config($rootScope, $cookies) {

			numeral.language('pt-br');
			moment.locale('pt-br');

			function env(key) {
				if(!window.ENVIRONMENT) {
					window.ENVIRONMENT = {
						SERVER_NAME: "Default (not configured)",
						DEFAULT_ENDPOINT: 'prod_https'
					};
				}

				return window.ENVIRONMENT[key];
			}

			var config = {

				BUILD_PREFIX: 'b060.', // @DEPRECATED: see config/local_storage.js instead!

				API_ENDPOINTS: {
					local_http: {
						label: 'V1 Local - Homestead (Insecure)',
						api: 'http://api.busca-ativa-escolar.test/api/v1/',
						token: 'http://api.busca-ativa-escolar.test/api/auth/token',
					},
					tests_http: {
						label: 'V1 Tests - buscaativaescolar-web1 (Insecure)',
						api: 'http://api.testes.buscaativaescolar.org.br/api/v1/',
						token: 'http://api.testes.buscaativaescolar.org.br/api/auth/token',
					},
					tests_https: {
						label: 'V1 Tests - buscaativaescolar-web1 (Secure)',
						api: 'https://api.testes.buscaativaescolar.org.br/api/v1/',
						token: 'https://api.testes.buscaativaescolar.org.br/api/auth/token',
					},
					prod_http: {
						label: 'V1 Prod - buscaativaescolar-web1 (Insecure)',
						api: 'http://api.buscaativaescolar.org.br/api/v1/',
						token: 'http://api.buscaativaescolar.org.br/api/auth/token',
					},
					prod_https: {
						label: 'V1 Prod - buscaativaescolar-web1 (Secure)',
						api: 'https://api.buscaativaescolar.org.br/api/v1/',
						token: 'https://api.buscaativaescolar.org.br/api/auth/token',
					},
					dev_https: {
						label: 'V1 Dev - buscaativaescolar-web1 (Secure)',
						api: 'https://api.dev.buscaativaescolar.org.br/api/v1/',
						token: 'https://api.dev.buscaativaescolar.org.br/api/auth/token',
					}
				},

				NOTIFICATIONS_REFRESH_INTERVAL: 30000, // 30 sec

				TOKEN_EXPIRES_IN: 3600, // 1 hour
				REFRESH_EXPIRES_IN: 1209600, // 2 weeks

				ALLOWED_ENDPOINTS: ['local_http', 'tests_https', 'prod_https', 'dev_https'],
				CURRENT_ENDPOINT: env('DEFAULT_ENDPOINT')

			};

			// console.log("[core.config] Current environment: ", window.ENVIRONMENT.SERVER_NAME);

			var hasCheckedCookie = false;

			config.setEndpoint = function(endpoint) {
				if(config.ALLOWED_ENDPOINTS.indexOf(endpoint) === -1) {
					//console.error("[core.config] Cannot set endpoint to ", endpoint,  ", not in valid endpoints list: ", config.ALLOWED_ENDPOINTS);
					return;
				}

				//console.info("[core.config] Setting API endpoint: ", endpoint);
				config.CURRENT_ENDPOINT = endpoint;

				$cookies.put('FDENP_API_ENDPOINT', config.CURRENT_ENDPOINT);
			};

			config.getCurrentEndpoint = function() {
				if(hasCheckedCookie) return config.CURRENT_ENDPOINT;
				hasCheckedCookie = true;

				var cookie = $cookies.get('FDENP_API_ENDPOINT');
				if(cookie) config.setEndpoint($cookies.get('FDENP_API_ENDPOINT'));

				//console.info("[core.config] Resolved current API endpoint: ", config.CURRENT_ENDPOINT, "cookie=", cookie);

				return config.CURRENT_ENDPOINT;
			};

			config.getAPIEndpoint = function() {
				return config.API_ENDPOINTS[config.getCurrentEndpoint()].api
			};

			config.getTokenEndpoint = function() {
				return config.API_ENDPOINTS[config.getCurrentEndpoint()].token
			};

			return $rootScope.config = config;

		});

})();

(function () {

    angular.module('BuscaAtivaEscolar')
        .config(function ($stateProvider) {
            $stateProvider.state('checks', {
                url: '/checks',
                templateUrl: '/views/children/checks.html',
                controller: 'CheckRequestCtrl'
            });
        })
        .controller('CheckRequestCtrl', function ($scope, StaticData, $anchorScroll, $httpParamSerializer, API, Children, Decorators, ngToast, DTOptionsBuilder, DTColumnDefBuilder, Modals) {

            $scope.Decorators = Decorators;
            $scope.Children = Children;
            
            $scope.query = angular.merge({}, $scope.defaultQuery);
            $scope.requests = {};

            $scope.refresh = function () {
                $scope.requests = Children.requests();
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
            // $scope.dtOptions = DTOptionsBuilder.newOptions().withOption('order', [[0, 'asc']])

            $scope.dtColumnDefs = [
                DTColumnDefBuilder.newColumnDef([0]).withOption('type', 'date')
            ];
            
            $scope.aprove = function (child) {

                if (child.type_request === 'reopen') {
                    Children.reopenCase({
                        case_id: child.child.alert.case_id,
                        reason: 'request'
                    }).$promise.then(function (res) {
                        if (res.status !== 'error') {
                            ngToast.success(res.result);
                            setTimeout(function () {
                                window.location = 'children/view/' + res.child_id + '/consolidated';
                            }, 4000);

                        } else {
                            ngToast.danger("Erro ao reabrir o caso!");
                        }
                    });

                }

                if (child.type_request === 'transfer') {
                    Children.transferCase({
                        case_id: child.child.alert.case_id,
                    }).$promise.then(function (res) {
                        if (res.status !== 'error') {
                            ngToast.success(res.result);
                            setTimeout(function () {
                                window.location = 'children/view/' + res.child_id + '/consolidated';
                            }, 4000);

                        } else {
                            ngToast.danger("Erro ao reabrir o caso!");
                        }
                    });
                }

            };
            $scope.reject = function (child) {

                Modals.show(Modals.CaseReject($scope.identity.getType())).then(function (response) {
                    if (!response) return $q.reject();

                    if ($scope.identity.getType() === 'coordenador_operacional') {
                        Children.reject({
                            id: child.id,
                            reject_reason: response.reason
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
                }).then(function (res) {
                    //console.log(res);
                });
            };
        });
})();

(function() {

	angular.module('BuscaAtivaEscolar')
		.controller('ChildActivityLogCtrl', ChildActivityLogCtrl)

		.config(function ($stateProvider) {
			$stateProvider
				.state('child_viewer.activity_log', {
					url: '/activity_log',
					templateUrl: '/views/children/view/activity_log.html',
					controller: 'ChildActivityLogCtrl'
				})
		});
	
	function ChildActivityLogCtrl($scope, $state, $stateParams, Children, Decorators) {

		$scope.Decorators = Decorators;
		$scope.Children = Children;

		$scope.entries = {};

		$scope.refresh = function() {
			$scope.entries = Children.getActivity({id: $stateParams.child_id});
		};

		$scope.refresh();

		//console.log("[core] @ChildActivityLogCtrl", $scope.$parent.entries);
	}

})();
(function() {

	angular.module('BuscaAtivaEscolar')
		.config(function ($stateProvider) {
			$stateProvider.state('child_viewer.attachments', {
				url: '/attachments',
				templateUrl: '/views/children/view/attachments.html',
				controller: 'ChildAttachmentsCtrl',
			})
		})
		.controller('ChildAttachmentsCtrl', function ($scope, $state, $window, $stateParams, ngToast, Auth, API, Modals, Children) {

			$scope.Children = Children;

			$scope.attachments = {};
			$scope.uploadToken = "";

			$scope.refresh = function() {
				$scope.attachments = Children.getAttachments({id: $stateParams.child_id});
			};

			$scope.uploadAttachment = function() {
				Modals.show(Modals.Prompt('Anexando um arquivo ao caso', '', false, 'Qual a descrição do anexo que será enviado?'))
					.then(function(description) {
						return Modals.show(Modals.FileUploader(
							'Anexando um arquivo ao caso',
							'Selecione abaixo o arquivo que deseja anexar ao caso.',
							API.getURI('children/' + $stateParams.child_id + '/attachments'),
							{description: description}
						))
					})
					.then(function (file) {
						ngToast.success('Arquivo anexado!');
						$scope.refresh();

						$window.location.reload();
					})
			};

			$scope.removeAttachment = function(attachment) {
				Modals.show(Modals.Confirm("Tem certeza que deseja remover esse arquivo?"))
					.then(function () {
						return Children.removeAttachment({id: $stateParams.child_id, attachment_id: attachment.id})
					})
					.then(function() {
						$scope.refresh();
					});
			};

			//console.log("[core] @ChildAttachmentsCtrl", $stateParams);

			$scope.refresh();

		});

})();
(function () {

    angular.module('BuscaAtivaEscolar')
        .config(function ($stateProvider) {
            $stateProvider.state('child_browser', {
                url: '/children',
                templateUrl: '/views/children/browser.html',
                controller: 'ChildSearchCtrl'
            });
        })
        .controller('ChildSearchCtrl', function ($scope, Identity, Config, $anchorScroll, $httpParamSerializer, API, Children, Decorators, Modals, DTOptionsBuilder, DTColumnDefBuilder, Reports, ngToast) {

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
            };

            $scope.query = angular.merge({}, $scope.defaultQuery);

            $scope.search = {};

            $scope.refresh = function () {
                $scope.search = Children.search($scope.query);
                $scope.reports = Reports.reportsChild();
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
(function () {
    angular.module("BuscaAtivaEscolar")
        .controller('ChildCasesCtrl', ChildCasesCtrl)
        .controller('ChildCaseStepCtrl', ChildCaseStepCtrl)
        .config(function ($stateProvider) {
            $stateProvider
                .state('child_viewer.cases', {
                    url: '/cases',
                    templateUrl: '/views/children/view/steps.html',
                    controller: 'ChildCasesCtrl'
                })
                .state('child_viewer.cases.view_step', {
                    url: '/{step_type}/{step_id}',
                    templateUrl: '/views/children/view/case_info.html',
                    controller: 'ChildCaseStepCtrl'
                })
        });

    function ChildCasesCtrl($q, $timeout, $scope, $state, $stateParams, ngToast, Identity, Utils, Alerts, Modals, Children, CaseSteps, Decorators) {

        $scope.Decorators = Decorators;
        $scope.Children = Children;
        $scope.CaseSteps = CaseSteps;

        $scope.identity = Identity;

        $scope.child_id = $scope.$parent.child_id;
        $scope.child = $scope.$parent.child;

        $scope.openedCase = {};
        $scope.openStepID = null;

        $scope.child.$promise.then(openCurrentCase);

        function openCurrentCase(child) {

            //console.log("[child_viewer.cases] Opening current case for child: ", child);

            $scope.openedCase = child.cases.find(function (item) {
                if ($stateParams.case_id) return item.id === $stateParams.case_id;
                return item.case_status === 'in_progress';
            });

            // Don't try to open a step; UI-Router will already open the one in the URL
            if ($stateParams.step_id) return;
            if (!$scope.openedCase) return;

            //console.log("[child_viewer.cases] Current case: ", $scope.openedCase, "; finding current step to open");

            var stepToOpen = $scope.openedCase.steps.find(function (step) {
                return ($scope.openedCase.current_step_id === step.id);
            });

            //console.log("[child_viewer.cases] Opening current step... ", stepToOpen);

            $scope.openStep(stepToOpen);
        }

        //console.log("[core] @ChildCasesCtrl", $scope.child, $scope.openedCase);

        $scope.collapseCase = function (childCase) {
            $scope.openedCase = childCase;
        };

        $scope.isCaseCollapsed = function (childCase) {
            if (!$scope.openedCase) return true;
            return $scope.openedCase.id !== childCase.id;
        };

        $scope.renderStepStatusClass = function (childCase, step) {

            var toggleClass = (step.id === $scope.openStepID) ? ' step-open' : '';

            if (step.is_completed) return 'step-completed' + toggleClass;
            if (childCase.current_step_id === step.id) return 'step-current' + toggleClass;
            return 'step-pending' + toggleClass;
        };

        $scope.canOpenStep = function (step) {
            if (step.is_completed || step.id === $scope.openedCase.current_step_id) {
                return Identity.can('cases.step.' + step.slug)
            }
            return false;
        };

        $scope.canEditStep = function (step) {
            return !step.is_completed && step.slug !== 'alerta';
        };

        $scope.openStep = function (selectedStep) {

            if (!$scope.canOpenStep(selectedStep)) return false;

            $scope.openStepID = selectedStep.id;

            //console.log("[child_viewer.cases] Opening step: ", selectedStep);

            $state.go('child_viewer.cases.view_step', {step_type: selectedStep.step_type, step_id: selectedStep.id})
                .then(function () {
                    $timeout(refreshGoogleMap, 1000);
                });

        };

        $scope.canCompleteStep = function (childCase, step) {
            if (step.step_type === 'BuscaAtivaEscolar\\CaseSteps\\Alerta') return false;
            if (!Identity.can('cases.step.' + step.slug)) return false;
            return (step.id === childCase.current_step_id && !step.is_completed && !step.is_pending_assignment);
        };

        $scope.isPendingAssignment = function (step) {
            return !step.is_completed && step.is_pending_assignment;
        };

        $scope.hasNextStep = function (step) {
            if (!step) return false;
            if (step.step_type === 'BuscaAtivaEscolar\\CaseSteps\\Observacao' && step.report_index === 4) return false;
            return true;
        };

        $scope.cancelCase = function () {

            Modals.show(Modals.CaseCancel())
                .then(function (reason) {
                    if (!reason) return $q.reject();
                    return Children.cancelCase({case_id: $scope.openedCase.id, reason: reason})
                })
                .then(function (res) {
                    ngToast.success("A última etapa de observação foi concluída, e o caso foi encerrado!");
                    $state.go('child_viewer.cases', {child_id: $scope.child.id}, {reload: true});
                });

        };

        $scope.reopenCase = function () {

            Modals.show(Modals.CaseReopen($scope.identity.getType()))

                .then(function (reason) {
                    if (!reason) return $q.reject();

                    if ($scope.identity.getType() === 'coordenador_operacional') {

                        Children.reopenCase({
                            case_id: $scope.openedCase.id,
                            reason: reason
                        }).$promise.then(function (res) {
                            if (res.status === 'success') {
                                ngToast.success(res.result + '! Redirecionando para o novo caso...');
                                setTimeout(function () {
                                    window.location = 'children/view/' + res.child_id + '/consolidated';
                                }, 4000);

                            } else {
                                ngToast.danger(res.result);
                            }
                        });
                    }

                    if ($scope.identity.getType() === 'supervisor_institucional') {
                        Children.requestReopenCase({
                            case_id: $scope.openedCase.id,
                            reason: reason
                        }).$promise.then(function (res) {

                            if (res.status === 'success') {
                                ngToast.success(res.result);
                                setTimeout(function () {
                                    window.location = 'children/view/' + $scope.child_id + '/consolidated';
                                }, 3000);
                            }

                            if (res.status === 'error') {
                                ngToast.danger(res.result);
                            }
                        });
                    }
                })

                .then(function (res) {
                    //console.log(res);
                });
        };

        $scope.transferCase = function () {

            Modals.show(Modals.CaseTransfer($scope.identity.getType())).then(function (response) {
                if (!response) return $q.reject();

                if ($scope.identity.getType() === 'coordenador_operacional') {
                    Children.requestTransferCase({
                        tenant_id: response.tenant_id,
                        case_id: $scope.openedCase.id,
                        reason: response.reason,
                        city_id: response.city_id
                    }).$promise.then(function (res) {
                        if (res.status === 'success') {
                            ngToast.success(res.result + '! Você será redirecionado.');
                            setTimeout(function () {
                                window.location = 'children';
                            }, 4000);

                        } else {
                            ngToast.danger(res.result);
                        }
                    });
                } else {
                    ngToast.warning('Você não pode realizar essa ação.');
                }
            }).then(function (res) {
                //console.log(res);
            });
        };

        function refreshGoogleMap() {
            $timeout(function () {
                $scope.renderMap = false;
                $timeout(function () {
                    $scope.renderMap = true;
                });
            });
        }

        $scope.completeStep = function (step) {

            //console.log("[child_viewer.cases] Attempting to complete step: ", step);

            var question = 'Tem certeza que deseja prosseguir para a próxima etapa?';
            var explanation = 'Ao progredir de etapa, a etapa atual será marcada como concluída. Os dados preenchidos serão salvos.';

            if (step.step_type === "BuscaAtivaEscolar\\CaseSteps\\AnaliseTecnica") {
                question = 'Tem certeza que deseja concluir a Análise Técnica?';
                explanation = 'Ao dizer SIM, a Análise Técnica será marcada como concluída e nenhuma informação poderá ser editada. Os dados preenchidos serão salvos.';
            }

            if (step.step_type === "BuscaAtivaEscolar\\CaseSteps\\Observacao" && step.report_index === 4) {
                question = 'Tem certeza que deseja concluir a última etapa de observação?';
                explanation = 'O caso será considerado concluído e os dados preenchidos serão salvos.';
            }

            Modals.show(Modals.Confirm(question, explanation)).then(function () {
                return CaseSteps.complete({type: step.step_type, id: step.id}).$promise;
            }).then(function (response) {

                if (response.messages) {
                    ngToast.danger("É necessário preencher todos os campos obrigatórios para concluir essa etapa.");
                    Utils.displayValidationErrors(response);
                    $state.go('child_viewer.cases.view_step', {step_type: step.step_type, step_id: step.id});
                    return;
                }

                if (response.status !== "ok") {
                    ngToast.danger("Ocorreu um erro ao concluir a etapa! (reason=" + response.reason + ")")
                    return;
                }

                if (!response.hasNext) {
                    ngToast.success("A última etapa de observação foi concluída, e o caso foi encerrado!");
                    $state.go('child_viewer.cases', {child_id: $scope.child.id}, {reload: true});
                    return;
                }

                ngToast.success("Etapa concluída! A próxima etapa já está disponível para início");
                $state.go('child_viewer.cases.view_step', {
                    step_type: response.nextStep.step_type,
                    step_id: response.nextStep.id
                }, {reload: true});

            })
        };

    }

    function ChildCaseStepCtrl($scope, $state, $stateParams, $timeout, ngToast, Utils, Modals, Alerts, Schools, Cities, Children, Decorators, CaseSteps, StaticData, Tenants) {

        $scope.Decorators = Decorators;
        $scope.Children = Children;
        $scope.CaseSteps = CaseSteps;
        $scope.static = StaticData;

        $scope.editable = true;
        $scope.showAll = false;
        $scope.showTitle = true;

        $scope.child_id = $scope.$parent.child_id;
        $scope.child = $scope.$parent.child;
        $scope.identity = $scope.$parent.identity;
        $scope.checkboxes = {};

        $scope.step = {};
        $scope.tenantSettings = {};

        $scope.tenantSettingsOfCase = null;

        $scope.isMapReady = false;
        $scope.defaultMapZoom = 14;

        $scope.current_date = {};

        $scope.responsible = {};

        $scope.addContact = function (id, parent) {
            if (id || (id === undefined)) {
                $scope.fields.aux.contatos[parent].push({
                    name: '',
                    phone: '',
                    isResponsible: '',
                    model: {name: 'name', phone: 'phone'}
                })
            } else if (id === false) {
                $scope.fields.aux.contatos[parent] = []
            }
        }

        $scope.removeContact = function (index, parent) {
            if (index === 0) return;
            $scope.fields.aux.contatos[parent].splice(index, 1)
        }

        $scope.insertResponsible = function (parent) {
            if (parent) {
                if ($scope.fields.aux.contatos[parent].length > 1) {
                    $scope.responsible[parent] = $scope.fields.aux.contatos[parent]
                } else {
                    $scope.fields.guardian_name = $scope.fields.aux.contatos[parent][0].name
                }
            } else {
                $scope.fields.guardian_name = $scope.fields.aux.contatos[parent][0].name
            }
        }

        $scope.avisoDivergencia = false;

        $scope.getAdressByCEP = function (cep) {
            if (!cep) {
                return
            }
            viaCep.get(cep).then(function (response) {
                // $scope.address = response
                $scope.fields.school_address = response.logradouro;
                $scope.fields.school_neighborhood = response.bairro;
                $scope.fields.school_uf = response.uf;
                $scope.fetchCities(response.localidade).then(function (value) {
                    $scope.fields.school_city = value[0];
                    validateSchoolWithPlace();
                });
            }).catch(function (responseCatch) {
                //console.log(responseCatch);
                $scope.noCEF = true;
                setTimeout(function () {
                    $scope.noCEF = false;
                }, 1000);
            });
        }

        function validateSchoolWithPlace() {
            if ($scope.fields.school && $scope.fields.school_city) {
                if ($scope.fields.school.city_name !== $scope.fields.school_city.name) {
                    $scope.avisoDivergencia = true;
                    setTimeout(function () {
                        $scope.avisoDivergencia = false;
                    }, 5000);
                }
            }
        }

        $scope.putStateAndCity = function (value) {
            $scope.fields.school_uf = value.uf;
            $scope.fetchCities(value.city_name).then(function (value) {
                $scope.fields.school_city = value[0];
            });
        }

        $scope.checkInputParents = function (value, name) {
            if ('mother' === name) {
                $scope.fields.aux.contatos.mother.name = $scope.fields.mother_name
            }
            if (!value) {
                $scope.fields.aux.contatos[name].name = '';
                $scope.fields.aux.contatos[name].phone = '';
            }
        }

        function fetchStepData() {

            $scope.current_date = new Date();

            $scope.step = CaseSteps.find({type: $stateParams.step_type, id: $stateParams.step_id, with: 'fields,case'});

            Tenants.getSettings(function (res) {
                $scope.tenantSettings = res;
            });

            $scope.step.$promise.then(function (step) {
                $scope.fields = Utils.unpackDateFields(step.fields, dateOnlyFields);
                $scope.case = step.case;
                $scope.$parent.openStepID = $scope.step.id;
                if (!$scope.fields.aux) {
                    $scope.fields.aux = {};
                    $scope.fields.aux.contatos = {};
                    $scope.fields.aux = {
                        contatos: {
                            siblings: $scope.fields.aux.contatos.siblings || [],
                            grandparents: $scope.fields.aux.contatos.grandparents || [],
                            others: $scope.fields.aux.contatos.others || []
                        }
                    }
                }
                if (step.fields && step.fields.place_coords) {
                    step.fields.place_map_center = Object.assign({}, step.fields.place_coords);
                }

                var settingsOfTenantOfCase = Tenants.getSettingsOftenantOfcase({id: $scope.step.case.tenant_id});

                settingsOfTenantOfCase.$promise.then(function (res_settings) {
                    $scope.tenantSettingsOfCase = res_settings;
                });

            });
        }

        fetchStepData();

        var handicappedCauseIDs = [];
        var dateOnlyFields = ['enrolled_at', 'report_date', 'dob', 'guardian_dob', 'reinsertion_date'];

        //console.log("[core] @ChildCaseStepCtrl", $scope.step);

        $scope.saveAndProceed = function () {
            //console.log("[child_viewer.cases.step] Attempting to save and complete step: ", $scope.step);

            $scope.save()
                .then(function () {
                    return $scope.step.$promise;
                })
                .then(function () {
                    $scope.$parent.completeStep($scope.step);
                });
        };

        $scope.areDatesEqual = function (a, b) {
            if (!a) return false;
            if (!b) return false;
            return moment(a).startOf('day').isSame(moment(b).startOf('day'));
        };

        $scope.isStepOpen = function (stepClassName) {
            if (!$scope.step) return false;
            return $scope.step.step_type === "BuscaAtivaEscolar\\CaseSteps\\" + stepClassName;
        };

        $scope.hasNextStep = function () {
            if (!$scope.step) return false;
            if ($scope.step.step_type === 'BuscaAtivaEscolar\\CaseSteps\\Observacao' && $scope.step.report_index === 4) return false;
            return true;
        };

        $scope.canEditCurrentStep = function (isEditableOnAlerts) {
            if (!$scope.step) return false;
            if (!$scope.$parent.openedCase) return false;
            if (!isEditableOnAlerts && $scope.step.slug === "alerta") return false;
            if ($scope.scopeOfCase() !== $scope.scopeOfUser()) return false;
            return (!$scope.step.is_completed);
        };

        $scope.canAcceptAlert = function (step, fields) {
            if (!step) return false;
            if (!step.requires_address_update) return true;
            return fields && fields.place_address && (fields.place_address.trim().length > 0);
        };

        $scope.acceptAlert = function (childID) {
            var data = {id: childID};

            if ($scope.step && $scope.step.slug === 'alerta' && $scope.step.requires_address_update) {
                data.place_address = $scope.fields.place_address;
            }

            Alerts.accept(data, function () {
                $state.reload();
            })
        };

        $scope.rejectAlert = function (childID) {
            Alerts.reject({id: childID}, function () {
                $state.reload();
            })
        };

        // $scope.isHandicapped = function () {
        //     if (!$scope.step || !$scope.step.fields || !$scope.step.fields.case_cause_ids) return false;
        //
        //     if (!handicappedCauseIDs || handicappedCauseIDs.length <= 0) {
        //         handicappedCauseIDs = Utils.extract('id', StaticData.getCaseCauses(), function (item) {
        //             return (item.is_handicapped === true);
        //         });
        //     }
        //
        //     var currentCauses = $scope.step.fields.case_cause_ids;
        //
        //     for (var i in currentCauses) {
        //         if (!currentCauses.hasOwnProperty(i)) continue;
        //         var cause = currentCauses[i];
        //         if (handicappedCauseIDs.indexOf(cause) !== -1) return true;
        //     }
        //
        //     return false;
        // };

        $scope.canCompleteStep = function () {
            if (!$scope.step) return false;
            if (!$scope.$parent.openedCase) return false;
            return ($scope.step.id === $scope.$parent.openedCase.current_step_id && !$scope.step.is_completed && !$scope.step.is_pending_assignment);
        };

        $scope.isPendingAssignment = function () {
            if (!$scope.step) return false;
            return !$scope.step.is_completed && !!$scope.step.is_pending_assignment;
        };

        $scope.fillWithCurrentDate = function (field) {
            $scope.fields[field] = moment(new Date().toISOString().substring(0, 10));
        };

        function filterOutEmptyFields(data) {
            var filtered = {};

            for (var i in data) {
                if (!data.hasOwnProperty(i)) continue;
                if (data[i] === null) continue;
                if (data[i] === 'null') continue;
                if (data[i] === undefined) continue;
                if (("" + data[i]).trim().length <= 0) continue;
                filtered[i] = data[i];
            }

            return filtered;
        }

        $scope.assignUser = function () {

            // console.log("[child_viewer.cases.step] Attempting to assign new user for step: ", $scope.step);

            CaseSteps.assignableUsers({type: $scope.step.step_type, id: $scope.step.id}).$promise
                .then(function (res) {
                    if (!res.users) return ngToast.danger("Nenhum usuário pode ser atribuído para essa etapa!");
                    return Modals.show(Modals.UserPicker('Atribuindo responsabilidade', 'Indique qual usuário deve ficar responsável por essa etapa:', res.users, true))
                })
                .then(function (user) {
                    return CaseSteps.assignUser({
                        type: $scope.step.step_type,
                        id: $scope.step.id,
                        user_id: user.id
                    }).$promise;
                }).then(function (res) {
                ngToast.success("Usuário atribuído!");
                $state.reload();
            });

        };

        $scope.isCheckboxChecked = function (field, value) {
            if (!$scope.fields) return false;
            if (!$scope.fields[field]) $scope.fields[field] = [];
            var value = $scope.fields[field].indexOf(value) !== -1;
            return value;
        };

        $scope.toggleCheckbox = function (field, value) {

            if (!$scope.fields[field]) $scope.fields[field] = []; // Ensures list exists
            var index = $scope.fields[field].indexOf(value); // Check if in list
            if (index === -1) return $scope.fields[field].push(value); // Add to list
            return $scope.fields[field].splice(index, 1); // Remove from list
        };

        $scope.getCaseCauseIDs = function () {
            if (!$scope.$parent.openedCase) return [];
            return $scope.$parent.openedCase.case_cause_ids;
        };

        $scope.getAlertCauseId = function () {
            if (!$scope.$parent.openedCase) return [];
            return $scope.$parent.openedCase.alert_cause_id;
        };

        $scope.fetchCities = function (query) {
            var data = {name: query, $hide_loading_feedback: true};

            if ($scope.fields.place_uf) data.uf = $scope.fields.place_uf;
            if ($scope.fields.school_uf) data.uf = $scope.fields.school_uf;

            // console.log("[create_alert] Looking for cities: ", data);

            return Cities.search(data).$promise.then(function (res) {
                return res.results;
            });
        };

        $scope.fetchSchools = function (query, filter_by_uf, filter_by_city) {
            var data = {name: query, $hide_loading_feedback: true};

            if (filter_by_uf) data.uf = filter_by_uf;
            if (filter_by_city && filter_by_city.id) data.city_id = filter_by_city.id;

            // console.log("[create_alert] Looking for schools: ", data);

            return Schools.search(data).$promise.then(function (res) {
                return res.results;
            });
        };

        $scope.renderSelectedCity = function (city) {
            if (!city) return '';
            return city.uf + ' / ' + city.name;
        };

        $scope.renderSelectedSchool = function (school) {
            if (!school) return '';
            return school.name + ' (' + school.city_name + ' / ' + school.uf + ')';
        };

        function clearAuxiliaryFields(fields) {
            var auxiliaryFields = ['place_map_center', 'place_map_geocoded_address'];
            var filtered = {};

            for (var i in fields) {
                if (!fields.hasOwnProperty(i)) continue;
                if (auxiliaryFields.indexOf(i) !== -1) continue;
                filtered[i] = fields[i];
            }

            return filtered;
        }

        function unpackTypeaheadField(data, name, model) {
            if (data[name]) {
                data[name + '_id'] = model.id;
                data[name + '_name'] = model.name;
            }

            return data;
        }

        $scope.save = function () {

            var data = Object.assign({}, $scope.step.fields);

            // console.log(data);


            data = Utils.prepareDateFields(data, dateOnlyFields);

            data = unpackTypeaheadField(data, 'place_city', data.place_city);
            data = unpackTypeaheadField(data, 'school_city', data.school_city);
            data = unpackTypeaheadField(data, 'school', data.school);
            data = unpackTypeaheadField(data, 'school_last', data.school_last);

            data = clearAuxiliaryFields(data);
            data = filterOutEmptyFields(data);

            data.type = $scope.step.step_type;
            data.id = $scope.step.id;

            // console.info("[child_viewer.step_editor] Saving step data: ", data);

            return CaseSteps.save(data).$promise.then(function (response) {
                if (response.messages) {
                    return Utils.displayValidationErrors(response);
                }

                if (response.status !== "ok") {
                    ngToast.danger("Ocorreu um erro ao salvar os dados da etapa! (status=" + response.status + ", reason=" + response.reason + ")");
                    return;
                }

                if (response.updated) {
                    fetchStepData(); // Updates data
                }

                ngToast.success("Os campos da etapa foram salvos com sucesso!");

            })
        }

        $scope.diffDaysBetweenSteps = function (a, b) {
            const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
            const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
            return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
        };

        $scope.canUpdateStepObservation = function (child) {
            if (!$scope.tenantSettingsOfCase) {
                return false;
            }
            var time_for_next_step = 0;
            if ($scope.step && $scope.tenantSettings) {
                if ($scope.step.slug == "1a_observacao") {
                    time_for_next_step = $scope.tenantSettingsOfCase.stepDeadlines["1a_observacao"];
                    var permission = $scope.diffDaysBetweenSteps(new Date(child.cases[0].steps[4].updated_at), $scope.current_date) >= time_for_next_step ? true : false;
                    return permission;

                }
                if ($scope.step.slug == "2a_observacao") {
                    time_for_next_step = $scope.tenantSettingsOfCase.stepDeadlines["2a_observacao"];
                    var permission = $scope.diffDaysBetweenSteps(new Date(child.cases[0].steps[5].updated_at), $scope.current_date) >= time_for_next_step ? true : false;
                    return permission;
                }
                if ($scope.step.slug == "3a_observacao") {
                    time_for_next_step = $scope.tenantSettingsOfCase.stepDeadlines["3a_observacao"];
                    var permission = $scope.diffDaysBetweenSteps(new Date(child.cases[0].steps[6].updated_at), $scope.current_date) >= time_for_next_step ? true : false;
                    return permission;
                }
                if ($scope.step.slug == "4a_observacao") {
                    time_for_next_step = $scope.tenantSettingsOfCase.stepDeadlines["4a_observacao"];
                    var permission = $scope.diffDaysBetweenSteps(new Date(child.cases[0].steps[7].updated_at), $scope.current_date) >= time_for_next_step ? true : false;
                    return permission;
                }
            }
        };

        $scope.scopeOfCase = function () {
            if ($scope.step.assigned_user) {
                if ($scope.step.assigned_user.type === "coordenador_estadual"
                    || $scope.step.assigned_user.type === "supervisor_estadual") {
                    return "state";
                } else {
                    return "municipality";
                }
            }
        }

        $scope.scopeOfUser = function () {
            if ($scope.identity.getCurrentUser().type === "coordenador_estadual"
                || $scope.identity.getCurrentUser().type === "supervisor_estadual") {
                return "state";
            } else {
                return "municipality";
            }
        }

    }

})();

(function() {

	angular.module('BuscaAtivaEscolar')
		.config(function ($stateProvider) {
			$stateProvider.state('child_viewer.comments', {
				url: '/comments',
				templateUrl: '/views/children/view/comments.html',
				controller: 'ChildCommentsCtrl'
			})
		})
		.controller('ChildCommentsCtrl', function ($scope, $state, $stateParams, Children) {

			$scope.Children = Children;

			$scope.comments = {};
			$scope.message = "";

			$scope.refresh = function() {
				$scope.comments = Children.getComments({id: $stateParams.child_id});
			};

			$scope.sendMessage = function() {

				Children.postComment({
					id: $scope.$parent.child.id,
					message: $scope.message
				}, function (res) {
					$scope.refresh();
				});

				$scope.message = "";
			};

			//console.log("[core] @ChildCommentsCtrl", $stateParams);

			$scope.refresh();

		});

})();
(function () {

    angular.module('BuscaAtivaEscolar')
        .controller('ChildConsolidatedCtrl', ChildConsolidatedCtrl)

        .config(function ($stateProvider) {
            $stateProvider
                .state('child_viewer.consolidated', {
                    url: '/consolidated',
                    templateUrl: '/views/children/view/consolidated.html',
                    controller: 'ChildConsolidatedCtrl'
                })
        });

    function ChildConsolidatedCtrl($scope, $state, $location, $stateParams, Children, Decorators, Utils, ngToast) {
        $scope.Decorators = Decorators;
        $scope.Children = Children;
        $scope.showAll = true;

        $scope.refreshChildData = function (callback) {
            return $scope.child = Children.find({id: $scope.child_id, with: 'currentStep,consolidated'}, callback);
        };

        $scope.fields = {};
        $scope.child_id = $stateParams.child_id;
        // $scope.id_case_for_reopen = $location.search().id_request ? $location.search().id_request : '';
        $scope.child = $scope.refreshChildData(function (data) {
            var consolidated = Utils.unpackDateFields(data.consolidated, dateOnlyFields)
            angular.copy(consolidated, $scope.fields);
        });

        var dateOnlyFields = ['enrolled_at', 'report_date', 'dob', 'guardian_dob', 'reinsertion_date'];

        $scope.getConsolidatedFields = function () {
            return $scope.fields;
        };

        $scope.isCheckboxChecked = function (field, value) {
            if (!$scope.fields) return false;
            if (!$scope.fields[field]) $scope.fields[field] = [];
            return $scope.fields[field].indexOf(value) !== -1;
        };
        // if ($scope.id_case_for_reopen !== '') {
        //     Children.reopenCase({case_id: $scope.id_case_for_reopen, reason: 'request'}).$promise.then(function (res) {
        //         if (res.status !== 'error') {
        //             ngToast.success(res.result);
        //             setTimeout(function () {
        //                 window.location = 'children/view/' + res.child_id + '/consolidated';
        //             }, 4000);
        //
        //         } else {
        //             ngToast.danger("Erro ao reabrir o caso!");
        //         }
        //     });
        // }


        // console.log("[core] @ChildConsolidatedCtrl", $scope.child);

    }

})();

(function() {

	angular.module('BuscaAtivaEscolar')
		.controller('ChildViewCtrl', ChildViewCtrl)

		.config(function ($stateProvider) {
			$stateProvider
				.state('child_viewer', {
					url: '/children/view/{child_id}',
					templateUrl: '/views/children/view/viewer.html',
					controller: 'ChildViewCtrl'
				})
		});

	function ChildViewCtrl($scope, $state, $stateParams, Children, Decorators, StaticData) {
		if ($state.current.name === "child_viewer") $state.go('.consolidated');

		$scope.Decorators = Decorators;
		$scope.Children = Children;
		$scope.StaticData = StaticData;

		$scope.refreshChildData = function(callback) {
			return $scope.child = Children.find({id: $scope.child_id}, callback);
		};

		$scope.child_id = $stateParams.child_id;
		$scope.child = $scope.refreshChildData();

		//console.log("[core] @ChildViewCtrl", $scope.child);

	}

})();
(function() {

	angular.module('BuscaAtivaEscolar')
		.config(function ($stateProvider) {
			$stateProvider.state('child_create_from_alert', {
				url: '/children/create_alert',
				templateUrl: '/views/children/create_alert.html',
				controller: 'CreateAlertCtrl'
			})
		})
		.controller('CreateAlertCtrl', function ($scope, $state, ngToast, Utils, Identity, StaticData, Children, Cities) {

			$scope.identity = Identity;
			$scope.static = StaticData;
			$scope.disableCreateAlertButton = false;

			$scope.birthdayDateEnd = moment(new Date()).format('YYYY-MM-DD');
			$scope.birthdayDateStart = moment($scope.birthdayDateEnd).subtract(100, 'years').format('YYYY-MM-DD');


			$scope.alert = {};

			$scope.fetchCities = function(query) {
				var data = {name: query, $hide_loading_feedback: true};
				if($scope.alert.place_uf) data.uf = $scope.alert.place_uf;

				//console.log("[create_alert] Looking for cities: ", data);

				return Cities.search(data).$promise.then(function (res) {
					return res.results;
				});
			};

			$scope.renderSelectedCity = function(city) {
				if(!city) return '';
				return city.uf + ' / ' + city.name;
			};

			$scope.createAlert = function() {

				$scope.disableCreateAlertButton = true;

				// TODO: validate fields

				var data = $scope.alert;
				data = Utils.prepareDateFields(data, ['dob']);
				data.place_city_id = data.place_city ? data.place_city.id : null;
				data.place_city_name = data.place_city ? data.place_city.name : null;

				Children.spawnFromAlert(data).$promise.then(function (res) {
					if(res.messages) {
						console.warn("[create_alert] Failed validation: ", res.messages);
						$scope.disableCreateAlertButton = false;
						return Utils.displayValidationErrors(res);
					}

					if(!res || !res.child_id) {
						ngToast.danger('Ocorreu um erro ao registrar o alerta!');
						$scope.disableCreateAlertButton = false;
						return;
					}

					ngToast.success('Alerta registrado com sucesso!');

					$scope.disableCreateAlertButton = false;

					if(Identity.getType() === 'agente_comunitario') {
						$state.go('dashboard');
						return;
					}

					$state.go('child_viewer', {child_id: res.child_id});
				});
			}

		});

})();
(function() {

	angular.module('BuscaAtivaEscolar')
		.config(function ($stateProvider) {
			$stateProvider.state('pending_alerts', {
				url: '/pending_alerts',
				templateUrl: '/views/children/pending_alerts.html',
				controller: 'PendingAlertsCtrlCtrl'
			})
		})
		.controller('PendingAlertsCtrlCtrl', function ($scope, $rootScope, Platform, Identity, Alerts, StaticData) {

			$scope.identity = Identity;
			$scope.sendingAlert = false;
			$scope.children = {};
			$scope.child = {};
			$scope.causes = {};

			$scope.query = {
                name: null,
				submitter_name: null,
                sort: {},
                max: 16,
				page: 1,
				neighborhood: null,
				show_suspended: false
            };

            $scope.search = {};
			
			$scope.getAlertCauseName = function(id) {
				if(!$scope.child) return 'err:no_child_open';
				if(!$scope.child.alert) return 'err:no_alert_data';
				if(!$scope.child.alert.alert_cause_id) return 'err:no_alert_cause_id';
				var indexAlertCauses = _.findIndex($scope.causes, {id: $scope.child.alert.alert_cause_id});
				if(!$scope.causes[indexAlertCauses]) return 'err:no_cause_with_id';
				return $scope.causes[indexAlertCauses].label;
			};

            $scope.setMaxResults = function(max) {
                $scope.query.max = max;
                $scope.query.page = 1;
                $scope.refresh();
            };

			$scope.static = StaticData;
			
			$scope.refresh = function() {
				$scope.child = null;
				$scope.children = Alerts.getPending($scope.query);
				$scope.search = $scope.children;
			};

			$scope.preview = function(child) {
				$scope.child = child
				$('#modalChild').modal({
					keyboard: false,
				});
			};

			$scope.canAcceptAlert = function(child) {
				if(!child) return false;
				if(!child.requires_address_update) return true;
				return child.alert
					&& child.alert.place_address
					&& (child.alert.place_address.trim().length > 0)
					&& child.alert.place_neighborhood
					&& (child.alert.place_neighborhood.trim().length > 0);
			};

			$scope.accept = function(child) {
				if(!$scope.canAcceptAlert(child)) {
					return;
				}

				$scope.sendingAlert = true;

				Alerts.accept({id: child.id, place_address: child.alert.place_address, place_neighborhood: child.alert.place_neighborhood}, function() {
					$scope.refresh();
					$scope. child = {};
					$('#modalChild').modal('hide');
					$scope.sendingAlert = false;
				});
			};

			$scope.reject = function(child) {
				Alerts.reject({id: child.id}, function() {
					$scope.refresh();
					$scope.child = {};
					$('#modalChild').modal('hide');
				});
			};

			Platform.whenReady(function() {
				$scope.causes = StaticData.getAlertCauses();
				$scope.refresh();
			});

		});

})();
(function() {

	angular.module('BuscaAtivaEscolar')
		.config(function ($stateProvider) {
			$stateProvider.state('user_alerts', {
				url: '/user_alerts',
				templateUrl: '/views/children/user_alerts.html',
				controller: 'UserAlertsCtrlCtrl'
			})
		})
		.controller('UserAlertsCtrlCtrl', function () {
		});

})();
(function() {
	identify('config', 'charts.js');

	angular.module('BuscaAtivaEscolar').run(function (Config) {
		Highcharts.setOptions({
			lang: {
				months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
				shortMonths: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
				weekdays: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
				loading: ['Atualizando o gráfico...'],
				contextButtonTitle: 'Exportar gráfico',
				decimalPoint: ',',
				thousandsSep: '.',
				downloadJPEG: 'Baixar imagem JPEG',
				downloadPDF: 'Baixar arquivo PDF',
				downloadPNG: 'Baixar imagem PNG',
				downloadSVG: 'Baixar vetor SVG',
				printChart: 'Imprimir gráfico',
				rangeSelectorFrom: 'De',
				rangeSelectorTo: 'Para',
				rangeSelectorZoom: 'Zoom',
				resetZoom: 'Voltar zoom',
				resetZoomTitle: 'Voltar zoom para nível 1:1'
			}
		});
	})

})();
(function() {
	identify('config', 'google_maps.js');

	angular.module('BuscaAtivaEscolar').config(function (uiGmapGoogleMapApiProvider) {
		/*uiGmapGoogleMapApiProvider.configure({
			key: 'AIzaSyBDzaqPtU-q7aHGed40wS6R2qEjVFHwvGA',
			libraries: 'places,visualization'
		});*/
	});

})();
// (function () {
//     identify('config', 'here_api.js');
//
//     angular.module('BuscaAtivaEscolar').config(["HereMapsConfigProvider", function (HereMapsConfigProvider) {
//         HereMapsConfigProvider.setOptions({
//             app_id: 'IaV356sfi2gAreQwtVsB',
//             app_code: 'cVhEI2VX0p26k_Rdz_NpbL-zV1eo5rDkTe2BoeJcE9U',
//             useHTTPS: true,
//             apiVersion: '3.0',
//             useCIT: true,
//             mapTileConfig: {
//                 scheme: 'reduced.day',
//                 size: 256,
//                 format: 'png8',
//                 metadataQueryParams: {}
//             }
//         });
//     }]);
// })();
//

(function() {
	identify('config', 'http.js');

	angular.module('BuscaAtivaEscolar').config(function ($httpProvider) {
		$httpProvider.defaults.headers.common = {"Content-Type": "application/json"};

		$httpProvider.interceptors.push('InjectAPIEndpointInterceptor');
		$httpProvider.interceptors.push('TrackPendingRequestsInterceptor');
		$httpProvider.interceptors.push('AddAuthorizationHeadersInterceptor');
		$httpProvider.interceptors.push('HandleExceptionResponsesInterceptor');
		$httpProvider.interceptors.push('HandleErrorResponsesInterceptor');
	});

})();
(function() {
	identify('config', 'local_storage.js');

	angular.module('BuscaAtivaEscolar').config(function ($localStorageProvider) {
		$localStorageProvider.setKeyPrefix('BuscaAtivaEscolar.v075.');
	});

})();
(function() {
	identify('config', 'on_init.js');

	angular.module('BuscaAtivaEscolar').run(function ($cookies, $rootScope, $state, Identity, Auth, Config, StaticData) {
		//console.info("------------------------------");
		//console.info(" BUSCA ATIVA ESCOLAR");
		//console.info(" Copyright (c) LQDI Digital");
		//console.info("------------------------------");
		//console.info(" WS ENDPOINT: ", Config.getAPIEndpoint());
		//console.info(" STORAGE BUILD PREFIX: ", Config.BUILD_PREFIX);
		//console.info("------------------------------");

		$.material.init();

		$rootScope.$on('unauthorized', function() {
			//console.log('[event.unauthorized] User unauthorized, redirecting to login...');
			Auth.logout();
			$state.go('login');
		})
	})

})();
(function () {
    identify('config', 'states.js');

    angular.module('BuscaAtivaEscolar')
        .config(function ($stateProvider, $locationProvider, $urlRouterProvider) {

            $locationProvider.html5Mode({
                    enabled: true,
                    requireBase: true
                }
            );
            $urlRouterProvider.otherwise('/dashboard');

            $stateProvider
                .state('login', {
                    url: '/login',
                    templateUrl: '/views/login.html',
                    controller: 'LoginCtrl',
                    unauthenticated: true
                })
                .state('dashboard', {
                    url: '/dashboard',
                    templateUrl: '/views/dashboard.html',
                    controller: 'DashboardCtrl'
                })
                .state('developer_mode', {
                    url: '/developer_mode',
                    templateUrl: '/views/developer/developer_dashboard.html',
                    controller: 'DeveloperCtrl',
                    unauthenticated: true

                })
                .state('settings', {
                    url: '/settings?step',
                    templateUrl: '/views/settings/manage_settings.html',
                    controller: 'SettingsCtrl'
                })
                .state('settings.parameterize_group', {
                    url: '/parameterize_group/{group_id}',
                    templateUrl: '/views/settings/parameterize_group.html',
                    controller: 'ParameterizeGroupCtrl'
                })
                .state('credits', {
                    url: '/credits',
                    templateUrl: '/views/static/credits.html',
                    controller: 'CreditsCtrl',
                    unauthenticated: true
                })
                .state('tenant_signup', {
                    url: '/tenant_signup',
                    templateUrl: '/views/tenant_signup/main.html',
                    controller: 'TenantSignupCtrl',
                    unauthenticated: true
                })
                .state('state_signup', {
                    url: '/state_signup',
                    templateUrl: '/views/state_signup/main.html',
                    controller: 'StateSignupCtrl',
                    unauthenticated: true
                })

        });

})();

(function() {
	identify('config', 'toasts.js');

	angular.module('BuscaAtivaEscolar').config(function(ngToastProvider) {
		ngToastProvider.configure({
			verticalPosition: 'top',
			horizontalPosition: 'right',
			maxNumber: 8,
			animation: 'slide',
			dismissButton: true,
			timeout: 6000
		});
	});

})();
(function() {
	angular.module('BuscaAtivaEscolar').service('Decorators', function () {
		var Child = {
			parents: function(child) {
				return (child.mother_name || '')
					+ ((child.mother_name && child.father_name) ? ' | ' : '')
					+ (child.father_name || '');
			}
		};

		var Step = {
		};

		return {
			Child: Child,
			Step: Step
		};
	})
})();
(function() {

	angular.module('BuscaAtivaEscolar').controller('CreditsCtrl', function ($scope, $rootScope, AppDependencies) {

		//console.log("Displaying app dependencies: ", AppDependencies);
		$rootScope.section = 'credits';
		$scope.appDependencies = AppDependencies;

	});

})();
(function () {

    angular.module('BuscaAtivaEscolar').controller('DashboardCtrl', function ($rootScope, $scope, $http, $localStorage, moment, Platform, Identity, StaticData, Tenants, Reports, Graph, Config) {

        $scope.identity = Identity;
        $scope.static = StaticData;
        $scope.tenantInfo = Tenants.getSettings();
        $scope.tenants = [];
        $scope.showDetailsMap = false;
        $scope.showMessageMap = 'Ver detalhes';

        $scope.listeners = {
            click: function () {
            },
            mousemove: function () {
            },
            mouseleave: function () {
            },
            mouseenter: function () {
            },
            drag: function () {
            },
            dragstart: function () {
            },
            dragend: function () {
            },
            mapviewchange: function () {
            },
            mapviewchangestart: function () {
            },
            mapviewchangeend: function () {
            }
        };

        $scope.ufs_selo = {data: []};
        $scope.tenants_selo = {data: []};

        $scope.query = angular.merge({}, $scope.defaultQuery);
        $scope.search = {};

        //--
        $scope.selo_unicef_todos = "TODOS";
        $scope.selo_unicef_participa = "PARTICIPA DO SELO UNICEF";
        $scope.selo_unicef_nao_participa = "NÃO PARTICIPA DO SELO UNICEF";
        //--

        //-- to use with fusionmap
        $scope.childrenMap = null;
        $scope.fusionmap_scope_table = "maps/brazil";
        $scope.fusionmap_scope_uf = null;
        $scope.fusionmap_scope_city = {id: null};
        $scope.fusion_map_config = {
            type: $scope.fusionmap_scope_table,
            renderAt: 'chart-container',
            width: '700',
            height: '730',
            dataFormat: 'json',
            dataSource: {

                "chart": {
                    "caption": "",
                    "subcaption": "",
                    "entityFillHoverColor": "#cccccc",
                    "numberScaleValue": "1.1000.1000",
                    "numberPrefix": "",
                    "showLabels": "0",
                    "theme": "fusion"
                },

                "colorrange": {
                    "minvalue": "0",
                    "startlabel": "",
                    "endlabel": "",
                    "code": "#6baa01",
                    "gradient": "1",
                    "color": []
                },

                "data": []

            },
            "events": {

                "entityClick": function (e) {
                    if ($scope.fusionmap_scope_table == "maps/brazil") {
                        if (e.data.value > 0) {
                            $scope.fusionmap_scope_table = "maps/" + e.data.label.split(" ").join("").toLowerCase();
                            $scope.initFusionChartMapState(e.data.shortLabel, $scope.fusionmap_scope_table);
                        }
                    } else {
                        if (e.data.value > 0) {
                            $scope.fusionmap_scope_city.id = e.data.id;
                            $scope.$apply();
                        }
                    }
                },
                "entityRollover": function (evt, data) {
                    if ($scope.fusionmap_scope_table == "maps/brazil") {
                        document.getElementById('state_' + evt.data.id).style.backgroundColor = "#ddd";
                    }
                },
                "entityRollout": function (evt, data) {
                    if ($scope.fusionmap_scope_table == "maps/brazil") {
                        document.getElementById('state_' + evt.data.id).style.backgroundColor = "#ffffff";
                    }
                }
            }
        };
        $scope.injectedObjectDirectiveCaseMaps = {};
        $scope.objectToInjectInMetrics = {};
        //--

        $scope.options_selo = [
            $scope.selo_unicef_todos,
            $scope.selo_unicef_participa,
            $scope.selo_unicef_nao_participa
        ];

        $scope.query_evolution_graph = {
            uf: '',
            tenant_id: '',
            selo: $scope.selo_unicef_todos
        };

        $scope.show_option_selo = false;
        $scope.show_option_uf = false;
        $scope.show_option_municipio = false;

        $scope.schema = [
            {
                "name": "Date",
                "type": "date",
                "format": "%Y-%m-%d"
            },
            {
                "name": "Rematricula",
                "type": "string"
            },
            {
                "name": "Unemployment",
                "type": "number"
            }
        ];

        $scope.dataSource = {
            caption: {
                text: "Evolução (Re)Matrículas"
            },
            subcaption: {
                text: "Período de " + moment().subtract(100, "days").format('DD/MM/YYYY') + " até " + moment().format('DD/MM/YYYY')
            },
            series: "Rematricula",
            yaxis: [
                {
                    format: {
                        formatter: function (obj) {
                            var val = null;
                            if (obj.type === "axis") {
                                val = obj.value
                            } else {
                                val = obj.value.toString().replace(".", ",");
                            }
                            return val;
                        }

                    },
                    plot: [
                        {
                            value: "Unemployment",
                            type: "column"
                        }
                    ],
                    title: "(Re)Matrículas",
                    referenceline: [
                        {
                            label: "Meta Selo UNICEF",
                        }
                    ],
                    defaultFormat: false
                }
            ],
            xAxis: {
                initialInterval: {
                    from: moment().subtract(100, "days").format('YYYY-MM-DD'),
                    to: moment().format('YYYY-MM-DD')
                },
                outputTimeFormat: {
                    year: "%Y",
                    month: "%m/%Y",
                    day: "%d/%m/%Y"
                },
                timemarker: [{
                    timeFormat: '%m/%Y'
                }]
            },
            tooltip: {
                enabled: "false", // Disables the Tooltip
                outputTimeFormat: {
                    day: "%d/%m/%Y"
                },
                style: {
                    container: {
                        "border-color": "#000000",
                        "background-color": "#75748D"
                    },
                    text: {
                        "color": "#FFFFFF"
                    }
                }
            }
        };

        $scope.getUFs = function () {
            return StaticData.getUFs();
        };

        $scope.getTablevaluesFormFusionMap = function () {
            return $scope.fusion_map_config.dataSource.data;
        };

        $scope.initFusionChartMap = function () {
            FusionCharts.ready(function () {
                Reports.getDataMapFusionChart(function (data) {

                    $scope.fusionmap_scope_city.id = null;
                    $scope.fusionmap_scope_table = "maps/brazil";
                    $scope.fusion_map_config.type = "maps/brazil";
                    $scope.fusion_map_config.width = "700";
                    $scope.fusionmap_scope_uf = null;
                    $scope.fusion_map_config.dataSource.data = data.data;
                    $scope.fusion_map_config.dataSource.colorrange.color = data.colors;

                    //remove o antigo
                    document.getElementById("chart-container").innerHTML = '';

                    //instancia
                    $scope.childrenMap = new FusionCharts(
                        $scope.fusion_map_config
                    );

                    //renderiza
                    $scope.childrenMap.render();
                });
            });
        };

        $scope.initFusionChartMapState = function (uf, scope_table) {
            Reports.getDataMapFusionChart({uf: uf}, function (data) {

                $scope.fusionmap_scope_city.id = null;
                $scope.fusion_map_config.type = scope_table;
                $scope.fusionmap_scope_uf = uf;
                $scope.fusionmap_scope_table = scope_table;
                $scope.fusion_map_config.width = "1000";

                $scope.fusion_map_config.dataSource.data = data.data;
                $scope.fusion_map_config.dataSource.colorrange.color = data.colors;

                //remove o antigo
                document.getElementById("chart-container").innerHTML = '';

                //instancia
                $scope.childrenMap = new FusionCharts(
                    $scope.fusion_map_config
                );
                //renderiza
                $scope.childrenMap.render();

            });
        };

        $scope.initFusionChartMapCity = function () {
            $scope.injectedObjectDirectiveCaseMaps.invoke($scope.fusionmap_scope_city.id);
            $scope.objectToInjectInMetrics.invoke($scope.fusionmap_scope_city.id, $scope.fusionmap_scope_uf);
        };

        $scope.initFusionChart = function () {

            Identity.provideToken().then(function (token) {

                var jsonify = function (res) {
                    return res.json();
                };

                var dataDaily = fetch(Config.getAPIEndpoint() + 'reports/data_rematricula_daily?uf=' + $scope.query_evolution_graph.uf + '&tenant_id=' + $scope.query_evolution_graph.tenant_id + '&selo=' + $scope.query_evolution_graph.selo + '&token=' + token).then(jsonify);

                Promise.all([dataDaily]).then(function (res) {

                    const data = res[0];

                    var data_final = [
                        {date: moment().format('YYYY-MM-DD'), value: "0", tipo: "(Re)matrícula"},
                        {date: moment().format('YYYY-MM-DD'), value: "0", tipo: "Cancelamento após (re)matrícula"}
                    ];

                    if (parseInt(data.data.length) > 0) {
                        data_final = data.data;
                    }

                    const fusionTable = new FusionCharts.DataStore().createDataTable(
                        data_final.map(function (x) {
                            return [
                                x.date,
                                x.tipo,
                                parseFloat(x.value)
                            ]
                        }),

                        $scope.schema
                    );
                    $scope.$apply(function () {

                        if (data.selo == $scope.selo_unicef_participa && data.goal > 0) {
                            $scope.dataSource.yaxis[0].Max = data.goal;
                            $scope.dataSource.yaxis[0].referenceline[0].label = "Meta Selo UNICEF";
                            $scope.dataSource.yaxis[0].referenceline[0].value = data.goal;
                            $scope.dataSource.yaxis[0].referenceline[0].style = {
                                marker: {
                                    fill: '#CF1717', //cor do circulo e do backgroud do numero da meta
                                    stroke: '#CF1717', //borda do circulo e da linha
                                    'stroke-opacity': 1.0, //opacidade da linha
                                    'stroke-width': 5.0
                                },
                                text: {
                                    fill: '#FFD023',
                                    "font-size": 15
                                }
                            }
                        }

                        if (data.selo == $scope.selo_unicef_nao_participa || data.selo == $scope.selo_unicef_todos) {
                            $scope.dataSource.yaxis[0].Max = 0;
                            $scope.dataSource.yaxis[0].referenceline[0] = {};
                        }

                        $scope.dataSource.data = fusionTable;
                    });

                    $scope.initSelectsOfFusionChart();

                    if ($scope.show_option_uf) {
                        $scope.initUfs();
                    }
                    ;

                });

            });
        };

        $scope.initSelectsOfFusionChart = function () {
            if (Identity.isUserType("coordenador_operacional")
                || Identity.isUserType("supervisor_institucional")
                || Identity.isUserType("gestor_politico")) {

                $scope.show_option_selo = false;
                $scope.show_option_municipio = false;
                $scope.show_option_uf = false;
            }

            if (Identity.isUserType("coordenador_estadual") || Identity.isUserType("gestor_estadual")) {
                $scope.show_option_uf = false;
                $scope.initTenantsSelo();
                $scope.show_option_selo = true;
                $scope.show_option_municipio = true;
                $scope.show_option_uf = false;
            }

            if (Identity.isUserType("gestor_nacional")) {

                $scope.show_option_selo = true;
                $scope.show_option_municipio = true;
                $scope.show_option_uf = true;
            }
        };

        $scope.initTenants = function () {
            if ($scope.uf_profiles_type.includes($scope.identity.getType())) {
                $scope.tenants = Tenants.findByUfPublic({'uf': $scope.identity.getCurrentUser().uf});
            }
        };

        $scope.initUfs = function () {
            $scope.ufs_selo = Reports.getUfsBySelo({selo: $scope.query_evolution_graph.selo});
        };

        $scope.getUfsSelo = function () {
            return $scope.ufs_selo.data;
        };

        $scope.getTenantsSelo = function () {
            return $scope.tenants_selo.data;
        };

        $scope.onSelectSelo = function () {
            $scope.query_evolution_graph.tenant_id = '';
            if (!Identity.isUserType("coordenador_estadual") && !Identity.isUserType("gestor_estadual")) {
                $scope.query_evolution_graph.uf = '';
                $scope.tenants_selo = {data: []};
            }
            if (Identity.isUserType("coordenador_estadual") && Identity.isUserType("gestor_estadual")) {
                $scope.initTenantsSelo();
            }
            $scope.initFusionChart();
        };

        $scope.onSelectUf = function () {
            $scope.query_evolution_graph.tenant_id = '';
            $scope.tenants_selo = Reports.getTenantsBySelo({
                selo: $scope.query_evolution_graph.selo,
                uf: $scope.query_evolution_graph.uf
            });
            $scope.initFusionChart();
        };

        $scope.onSelectCity = function () {
            $scope.initFusionChart();
        };

        $scope.refresh = function () {
            if (($scope.query.uf !== undefined) && ($scope.query.tenant_id !== undefined)) {
                $scope.tenants = Graph.getReinsertEvolution({'uf': $scope.query.uf});
            }
        };

        $scope.getTenants = function () {
            if (!$scope.tenants || !$scope.tenants.data) return [];
            return $scope.tenants.data;
        };

        $scope.ready = false;

        $scope.showInfo = '';

        $scope.steps = [
            {name: 'Adesão', info: ''},
            {name: 'Configuração', info: ''},
            {name: '1º Alerta', info: ''},
            {name: '1º Caso', info: ''},
            {name: '1ª (Re)matrícula', info: ''}
        ];

        $scope.chartWithContentDownload = function () {
            window.scrollTo(0, 100);

            var cloneDom = $("#regua").clone(true);

            if (typeof html2canvas !== 'undefined') {
                // The following is the processing of SVG
                var nodesToRecover = [];
                var nodesToRemove = [];
                var svgElem = cloneDom.find('svg'); //divReport is the ID of the DOM that needs to be intercepted into pictures
                svgElem.each(function (index, node) {
                    var parentNode = node.parentNode;
                    var svg = node.outerHTML.trim();

                    var canvas = document.createElement('canvas');

                    canvg(canvas, svg);

                    nodesToRecover.push({
                        parent: parentNode,
                        child: node
                    });
                    parentNode.removeChild(node);

                    nodesToRemove.push({
                        parent: parentNode,
                        child: canvas
                    });

                    parentNode.appendChild(canvas);
                });

                // The clone node is dynamically appended to the body.
                $("#regua_print").append(cloneDom);

                html2canvas(cloneDom, {
                    onrendered: function (canvas) {
                        var data = canvas.toDataURL("image/png");
                        var docDefinition = {
                            content: [{
                                image: data,
                                width: 500,
                                logging: true,
                                profile: true,
                                useCORS: true,
                                allowTaint: true
                            }]
                        };
                        pdfMake.createPdf(docDefinition).download("painel_de_metas.pdf");
                        $("#regua_print").empty();
                    }
                });

            }
        };

        $scope.initStatusBar = function () {

            Reports.getStatusBar(function (data) {

                var meta = data.goal_box && data.goal_box.goal || 0;

                if (meta == 0) {
                    $scope.query_evolution_graph.selo = $scope.selo_unicef_todos;
                }

                if (meta > 0) {
                    $scope.query_evolution_graph.selo = $scope.selo_unicef_participa;
                }

                var atingido = data.goal_box && data.goal_box.reinsertions_classes || 0;
                $scope.percentualAtingido = Math.floor((atingido * 100) / meta);
                // $scope.percentualAtingido = 100;

                if (data.status !== 'ok') {
                    $scope.steps[0].info = data.bar && data.bar.registered_at || 0;
                    $scope.steps[1].info = data.bar && data.bar.config.updated_at || 0;
                    $scope.steps[2].info = data.bar && data.bar.first_alert || 0;
                    $scope.steps[3].info = data.bar && data.bar.first_case || (data.bar.first_alert || 0);
                    $scope.steps[4].info = data.bar && data.bar.first_reinsertion_class || 0;
                    $scope.otherData = data;

                    for (var i = 0; $scope.steps.length >= i; i++) {
                        if ($scope.steps[i]) {
                            var actualDate = moment($scope.steps[i].info || 0);
                            if (actualDate._i !== 0) {
                                $scope.showInfo = i;
                            }
                        }
                    }
                }

                $scope.initFusionChart();

            });

            $scope.initFusionChart();

        };

        $scope.initTenantsSelo = function () {
            $scope.tenants_selo = Reports.getTenantsBySelo({
                selo: $scope.query_evolution_graph.selo,
                uf: $scope.identity.getCurrentUser().uf
            });
        };

        $scope.stateCountChange = function () {
            $scope.stateCount = isNaN($scope.stateCount) ? 2 : $scope.stateCount;
            init();
        };

        $scope.setCurrent = function (state) {
            for (var i = 0; i < $scope.states.length; i++) {
                $scope.states[i].isCurrent = false;
            }
            state.isCurrent = true;
        };

        $scope.states = [];
        $scope.stateCount = 2;

        function returnStateByIDFusionMap(sigla) {
            var states =
                [
                    {sigla: 'AC', id: '001', state: 'Acre'},
                    {sigla: 'AL', id: '002', state: 'Alagoas'},
                    {sigla: 'AP', id: '003', state: 'Amapa'},
                    {sigla: 'AM', id: '004', state: 'Amazonas'},
                    {sigla: 'BA', id: '005', state: 'Bahia'},
                    {sigla: 'CE', id: '006', state: 'Ceara'},
                    {sigla: 'DF', id: '007', state: 'Distrito Federal'},
                    {sigla: 'ES', id: '008', state: 'Espirito Santo'},
                    {sigla: 'GO', id: '009', state: 'Goias'},
                    {sigla: 'MA', id: '010', state: 'Maranhao'},
                    {sigla: 'MG', id: '011', state: 'Mato Grosso'},
                    {sigla: 'MS', id: '012', state: 'Mato Grosso do Sul'},
                    {sigla: 'MG', id: '013', state: 'Minas Gerais'},
                    {sigla: 'PA', id: '014', state: 'Para'},
                    {sigla: 'PB', id: '015', state: 'Paraiba'},
                    {sigla: 'PR', id: '016', state: 'Parana'},
                    {sigla: 'PE', id: '017', state: 'Pernambuco'},
                    {sigla: 'PI', id: '018', state: 'Piaui'},
                    {sigla: 'RJ', id: '019', state: 'Rio de Janeiro'},
                    {sigla: 'RN', id: '020', state: 'Rio Grande do Norte'},
                    {sigla: 'RS', id: '021', state: 'Rio Grande do Sul'},
                    {sigla: 'RO', id: '022', state: 'Rondonia'},
                    {sigla: 'RR', id: '023', state: 'Roraima'},
                    {sigla: 'SC', id: '024', state: 'Santa Catarina'},
                    {sigla: 'SP', id: '025', state: 'Sao Paulo'},
                    {sigla: 'SE', id: '026', state: 'Sergipe'},
                    {sigla: 'TO', id: '027', state: 'Tocantins'}
                ];
            return states.filter(function (e) {
                return e.sigla == sigla;
            })[0];
        }

        $scope.handleMaps = function (value) {
            var cloudering = document.getElementById("map");
            var markers = document.getElementById("map-markes");
            if (cloudering.style.display === "none") {
                cloudering.style.display = "block";
                markers.style.display = "none";
                $scope.showMessageMap = $scope.showMessageMap;
            } else {
                cloudering.style.display = "none";
                markers.style.display = "block";
                $scope.showMessageMap = 'Ver agrupado';
            }
        };

        Platform.whenReady(function () {
            $scope.ready = true;

            if (Identity.getCurrentUser().type == "gestor_nacional") {
                $scope.initFusionChartMap();
            }

            if (Identity.getCurrentUser().type == "coordenador_estadual" || Identity.getCurrentUser().type == "gestor_estadual") {
                var scope_uf = "maps/" + returnStateByIDFusionMap(Identity.getCurrentUser().uf).state.split(" ").join("").toLowerCase();
                $scope.initFusionChartMapState(Identity.getCurrentUser().uf, scope_uf);
            }

        });

        function init() {
            $scope.states.length = 0;
            for (var i = 0; i < $scope.stateCount; i++) {
                $scope.states.push({
                    name: 'Step ' + (i + 1).toString(),
                    heading: 'Step ' + (i + 1).toString(),
                    isVisible: true
                });
            }

            if( Identity.getCurrentUser().type == "coordenador_operacional" || Identity.getCurrentUser().type == "supervisor_institucional" || Identity.getCurrentUser().type == "gestor_politico" ) {
                $scope.initStatusBar();
            }

            $scope.initFusionChart();

        };

        init();

    });

})();
(function() {

	angular.module('BuscaAtivaEscolar').controller('DeveloperCtrl', function ($scope, $rootScope, $localStorage, $http, StaticData, ngToast, API, Notifications, Tenants, Children, Auth) {

		$scope.static = StaticData;

		var messages = [
			'asdasd asd as das das dsd fasdf as',
			'sdg sdf gfdgh dfthdfg hdfgh dfgh ',
			'rtye rtertg heriufh iurfaisug faisugf as',
			'ksjf hkdsuf oiaweua bfieubf iasuef iauegh',
			'jkb viubiurbviesubvisueb iseubv',
			'askjdfh aiufeiuab biausf biu iubfa iub fseiuse bfsaef'
		];

		var child_id = 'b9d1d8a0-ce23-11e6-98e6-1dc1d3126c4e';
		var tenant_id = 'b0838f00-cd55-11e6-b19b-757d3a457db3';

		$scope.rest = {
			requireAuth: true,
			endpoint: null,
			request: '{}',
			response: '{}',
			sendRequest: sendRESTRequest
		};

		function sendRESTRequest() {

			var headers = ($scope.rest.requireAuth) ? API.REQUIRE_AUTH : {};
			var request = {
				method: $scope.rest.endpoint.method,
				url: API.getURI($scope.rest.endpoint.path, true),
				data: JSON.parse($scope.rest.request),
				headers: headers,
				responseType: 'string'
			};

			console.info("[developer.rest] Sending request: ", request);

			$http(request).then(
				function (res) {
					ngToast.success("REST OK: " + res.status);
					$scope.rest.response = res.data
				},
				function (err) {
					ngToast.danger("REST ERROR: " + err.status);

				}
			)

		}

		$scope.storage = $localStorage;

		$scope.testNotification = function (messageClass) {
			Notifications.push(messageClass, messages.clone().shuffle().pop())
		};

		$scope.login = function() {
			Auth.requireLogin();
		};

		$scope.logout = function() {
			Auth.logout();
		};

		$scope.testGetTenant = function() {
			$scope.tenant = Tenants.get({id: tenant_id});
		};

		$scope.testGetChildren = function() {
			$scope.child = Children.get({id: child_id});
		};

	});

})();
(function() {

	angular.module('BuscaAtivaEscolar').controller('FirstTimeSetupCtrl', function ($scope, $rootScope, $window, $location, Auth, Modals, MockData, Identity) {

		$rootScope.section = 'first_time_setup';

		$scope.identity = Identity;
		$scope.step = 2; // Step 1 is sign-up
		$scope.isEditing = false;

		$scope.causes = MockData.alertReasonsPriority;
		$scope.newGroupName = "";
		$scope.groups = [
			{name: 'Secretaria Municipal de Educação', canChange: false},
			{name: 'Secretaria Municipal de Assistência Social', canChange: true},
			{name: 'Secretaria Municipal da Saúde', canChange: true}
		];

		Identity.clearSession();

		$scope.range = function (start, end) {
			var arr = [];

			for(var i = start; i <= end; i++) {
				arr.push(i);
			}

			return arr;
		};

		$scope.goToStep = function (step) {
			$scope.step = step;
			$window.scrollTo(0, 0);
		};

		$scope.nextStep = function() {
			$scope.step++;
			$window.scrollTo(0, 0);
			if($scope.step > 7) $scope.step = 7;
		};

		$scope.prevStep = function() {
			$scope.step--;
			$window.scrollTo(0, 0);
			if($scope.step < 2) $scope.step = 1;
		};

		$scope.removeGroup = function(i) {
			$scope.groups.splice(i, 1);
		};

		$scope.addGroup = function() {
			$scope.groups.push({name: $scope.newGroupName, canChange: true});
			$scope.newGroupName = "";
		};

		$scope.finish = function() {
			Modals.show(Modals.Confirm(
				'Tem certeza que deseja prosseguir com o cadastro?',
				'Os dados informados poderão ser alterados por você e pelos gestores na área de Configurações.'
			)).then(function(res) {
				Auth.login('manager_sp@lqdi.net', 'demo').then(function() {
					$location.path('/dashboard');
				});
			});
		};

	});

})();
/*var lowerCaseLetters = /[a-z]/g;
if (value.match(lowerCaseLetters)) {
  check(letter)
} else {
  uncheck(letter)
}
var upperCaseLetters = /[A-Z]/g;
if (value.match(upperCaseLetters)) {
  check(capital)
} else {
  uncheck(capital)
}
var numbers = /[0-9]/g;
if (value.match(numbers)) {
  check(number)
} else {
  uncheck(number)
}
var symbols = /[-!$%^&*()_+|~#=`{}\[\]:";'<>?,.\/]/g;
if (value.match(symbols)) {
  check(symbol)
} else {
  uncheck(symbol)
}
// Validate length
if (value.length >= 8 && value.length <= 16) {
  check(length);
} else {
  uncheck(length);
}


function addErrorDate() {
  const dateText = document.getElementById('error_date');
  const curDate = new Date();
  const minDate = new Date(curDate.setFullYear(curDate.getFullYear() - 100));
  const maxDate = new Date(
    curDate.setFullYear(curDate.getFullYear() + 100 - 18)
  );
  dateText.textContent = '';
  dateText.textContent = `Data não pode ser menor que
   ${minDate.toLocaleDateString()} e maior que ${maxDate.toLocaleDateString()}`;
  document.getElementById('message_date').style.display = 'block';
}*/

(function () {
  angular
    .module('BuscaAtivaEscolar')
    .controller(
      'LoginCtrl',
      function (
        $scope,
        $rootScope,
        $cookies,
        $state,
        $location,
        Modals,
        Config,
        Auth,
        Identity
      ) {
        //console.log("[core] @Login");

        $rootScope.section = '';

        $scope.email = '';
        $scope.password = '';
        $scope.isLoading = false;

        $scope.endpoints = {
          allowed: Config.ALLOWED_ENDPOINTS,
          list: Config.API_ENDPOINTS,
        };

        if (Identity.isLoggedIn()) {
          $state.go('dashboard');
        }

        $scope.showPassowrd = function () {
          var field_password = document.getElementById('fld-password');
          field_password.type === 'password'
            ? (field_password.type = 'text')
            : (field_password.type = 'password');
        };

        function onLoggedIn(session) {
          $scope.isLoading = false;
          /*Modals.show(
            Modals.GeneralPopUpAlerts(
              'QUESTIONÁRIO SOBRE IMPLEMENTAÇÃO DA ESTRATÉGIA'
            )
          );*/
          //console.info("[login_ctrl] Logged in!", session);
          //console.info("[login_ctrl] Tenant: ", Identity.getCurrentUser().tenant);

          if (Identity.getCurrentUser().lgpd) {
            if (!Identity.isUserType('coordenador_operacional'))
              return $state.go('dashboard');
            if (!Identity.hasTenant()) return $state.go('dashboard');
            if (!Identity.getCurrentUser().tenant.is_setup)
              return $state.go('tenant_setup');

            return $state.go('dashboard');
          } else {
            return $state.go('lgpd_signup');
          }

          // Check if user should see tenant first time setup
        }

        function onError(err) {
          if (err.error === 'lgpd_validation_fail') {
            Modals.show(
              Modals.Alert(
                'Prezado(a)',
                'Seu município/estado ainda não aceitou o novo termo de adesão à estratégia, atualizado segundo a LGPD. Entre em contato com o(a) coordenador(a) operacional / coordenador(a) estadual para se certificar sobre quando esse aceite será feito.'
              )
            );
          } else {
            Modals.show(
              Modals.Alert(
                'Usuário ou senha incorretos',
                'Por favor, verifique os dados informados e tente novamente.'
              )
            );
          }

          $scope.isLoading = false;
        }

        $scope.setAPIEndpoint = function (endpointID) {
          Config.setEndpoint(endpointID);
          $cookies.put('FDENP_API_ENDPOINT', endpointID);
        };

        $scope.login = function () {
          $scope.isLoading = true;
          Auth.login($scope.email, $scope.password).then(onLoggedIn, onError);
        };

        $scope.showModalAdesao = function () {
          Modals.show(Modals.GeneralAlerts('Aviso importante!'));
        };

        $scope.showModalAdesao();
      }
    );
})();

(function() {

	angular.module('BuscaAtivaEscolar').controller('ParameterizeGroupCtrl', function ($scope, $rootScope, MockData, Identity) {

		$rootScope.section = 'settings';
		$scope.identity = Identity;

		$scope.reasons = MockData.alertReasons;

	});

})();
(function() {

	angular.module('BuscaAtivaEscolar').controller('SettingsCtrl', function ($scope, $stateParams, $state, $rootScope, $window, ngToast, MockData, Identity) {

		$rootScope.section = 'settings';
		$scope.identity = Identity;

		if(!$stateParams.step) {
			if(Identity.can('settings.manage') || Identity.can('groups.manage')) { // First tab in settings
				return $state.go('settings', {step: 4});
            }

			return $state.go('settings', {step: 8}); // Educacenso
		}

		$scope.step = $stateParams.step;
		$scope.isEditing = true;

		$scope.causes = MockData.alertReasonsPriority;
		$scope.newGroupName = "";
		$scope.groups = [
			{name: 'Secretaria Municipal de Educação', canChange: false},
			{name: 'Secretaria Municipal de Assistência Social', canChange: true},
			{name: 'Secretaria Municipal da Saúde', canChange: true}
		];

		$scope.range = function (start, end) {
			var arr = [];

			for(var i = start; i <= end; i++) {
				arr.push(i);
			}

			return arr;
		};

		$scope.goToStep = function (step) {
			$scope.step = step;
			$window.scrollTo(0, 0);
		};

		$scope.nextStep = function() {
			$scope.step++;
			$window.scrollTo(0, 0);
			if($scope.step > 7) $scope.step = 7;
		};

		$scope.prevStep = function() {
			$scope.step--;
			$window.scrollTo(0, 0);
			if($scope.step < 3) $scope.step = 3;
		};

		$scope.removeGroup = function(i) {
			$scope.groups.splice(i, 1);
		};

		$scope.addGroup = function() {
			$scope.groups.push({name: $scope.newGroupName, canChange: true});
			$scope.newGroupName = "";
		};

		$scope.save = function() {
			ngToast.create({
				className: 'success',
				content: 'Configurações salvas!'
			});
		};

	});

})();
(function () {

    angular.module('BuscaAtivaEscolar').directive('casesMap', function ($rootScope, moment, $timeout, uiGmapGoogleMapApi, Identity, Platform, Children, Decorators) {

        function init(scope, element, attrs) {


            function synchronizeMaps(firstMap, secondMap) {
                // get view model objects for both maps, view model contains all data and
                // utility functions that're related to map's geo state
                var viewModel1 = firstMap.getViewModel(),
                    viewModel2 = secondMap.getViewModel();

                // set up view change listener on interactive map
                firstMap.addEventListener('mapviewchange', function () {
                    // on every view change take a "snapshot" of a current geo data for
                    // interactive map and set this values to the second, non-interactive, map
                    viewModel2.setLookAtData(viewModel1.getLookAtData());
                });
            }

            function addMarkerToGroup(group, coordinate, html) {
                var marker = new H.map.Marker(coordinate);
                // add custom data to the marker
                marker.setData(html);
                group.addObject(marker);

                group.addEventListener('pointerleave', function (evt) {
                    //console.log(evt);
                    if (scope.bubble !== undefined) {
                        scope.bubble.close();
                    }
                }, false);

            }

            function addInfoBubble(map, coordinates) {
                var group = new H.map.Group();

                map.addObject(group);

                // add 'tap' event listener, that opens info bubble, to the group
                scope.bubble = '';

                group.addEventListener('tap', function (evt) {

                    if (scope.bubble) {
                        scope.bubble.close();
                    }

                    // event target is the marker itself, group is a parent event target
                    // for all objects that it contains
                    scope.bubble = new H.ui.InfoBubble(evt.target.getGeometry(), {
                        // read custom data
                        content: evt.target.getData()
                    });
                    // show info bubble
                    scope.ui.addBubble(scope.bubble);
                }, false);

                angular.forEach(coordinates, function (value, key) {
                    addMarkerToGroup(group, {lat: value.latitude, lng: value.longitude},
                        '<div style="width: 250px"><a href="/children/view/' + value.id + '">' + value.name + '</a>');
                });

                var markers = document.getElementById("map-markes");
                markers.style.display = "none";
            }


            function startClustering(map, data) {

                var dataPoints = data.map(function (item) {
                    return new H.clustering.DataPoint(item.latitude, item.longitude);
                });

                var clusteredDataProvider = new H.clustering.Provider(dataPoints, {
                    clusteringOptions: {
                        eps: 32,
                        minWeight: 2
                    }
                });

                var clusteringLayer = new H.map.layer.ObjectLayer(clusteredDataProvider);

                var locations = data.map(function (item) {
                    return new H.map.Marker({lat: item.latitude, lng: item.longitude});
                });
                var group = new H.map.Group();

                // group.addEventListener('tap', function (evt) {
                //     alert()
                //     var target = evt.target;
                //     // retrieve maximum zoom level
                //     var maxZoom = target.getData().maxZoom;
                //     // get the shape's bounding box and adjust the camera position
                //     map.getViewModel().setLookAtData({
                //         zoom: maxZoom,
                //         bounds: target.getBoundingBox()
                //     });
                // });

                group.addObjects(locations);

                map.getViewModel().setLookAtData({
                    bounds: group.getBoundingBox()
                });

                scope.dataMap = map.getViewModel().getLookAtData();

                map.addLayer(clusteringLayer);
            }

            /**
             * Boilerplate map initialization code starts below:
             */

            var platform = new H.service.Platform({
                apikey: 'fgRnSsPLJX3oJiiDsKfxhuuA5EAXrZlTc7P4Oei_vHA'
            });
            var defaultLayers = platform.createDefaultLayers();
            var defaultLayersSync = platform.createDefaultLayers();


            var refresh = function () {
                // console.log('[widget.cases_map] Loading data...');
                Children.getMap({city_id: attrs.cityId}, function (data) {

                    scope.coordinates = data.coordinates;
                    scope.mapCenter = data.center;
                    scope.mapZoom = data.center.zoom;
                    scope.mapReady = true;
                    document.getElementById('map').innerHTML = '';

                    scope.map = new H.Map(document.getElementById('map'),
                        defaultLayers.vector.normal.map, {
                            center: {lat: -13.5013846, lng: -51.901559},
                            zoom: 5,
                            pixelRatio: window.devicePixelRatio || 1
                        });

                    var mapTileService = platform.getMapTileService({
                        // type: 'aerial'
                    });

                    scope.tileLayer = mapTileService.createTileLayer(
                        'maptile',
                        'reduced.day',
                        256,
                        'png8'
                    );
                    scope.map.setBaseLayer(scope.tileLayer);

                    // map.getViewModel().setLookAtData({tilt: 45});

                    window.addEventListener('resize', () => scope.map.getViewPort().resize());


                    var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(scope.map));

                    scope.ui = H.ui.UI.createDefault(scope.map, defaultLayersSync);


                    var mapMarkSync = new H.Map(document.getElementById('map-markes'),
                        defaultLayersSync.vector.normal.map, {
                            center: {lat: -13.5013846, lng: -51.901559},
                            zoom: 5,
                            pixelRatio: window.devicePixelRatio || 1
                        });
                    var mapTileServiceSync = platform.getMapTileService({
                        // type: 'aerial'
                    });

                    scope.tileLayer = mapTileService.createTileLayer(
                        'maptile',
                        'reduced.day',
                        256,
                        'png8'
                    );
                    mapMarkSync.setBaseLayer(scope.tileLayer);

                    window.addEventListener('resize', () => mapMarkSync.getViewPort().resize());

                    var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(mapMarkSync));

                    scope.ui = H.ui.UI.createDefault(mapMarkSync, defaultLayersSync);

                    startClustering(scope.map, data.coordinates);
                    addInfoBubble(mapMarkSync, scope.coordinates);
                    synchronizeMaps(scope.map, mapMarkSync);

                });
            };

            refresh();

            scope.$watch('objectToInject', function (value) {
                if (value) {
                    scope.Obj = value;
                    scope.Obj.invoke = function (city_id) {
                        attrs.cityId = city_id;
                        refresh();
                    }
                }
            });
        }

        return {
            link: init,
            scope: {
                /*The object that passed from the cntroller*/
                objectToInject: '='
            },
            replace: true,
            templateUrl: '/views/components/cases_map.html'
        };
    });

})();

(function () {

    angular.module('BuscaAtivaEscolar').directive('casesMapMarkes', function ($rootScope, $window, moment, $timeout, uiGmapGoogleMapApi, Identity, Platform, Children, Decorators) {

        function init(scope, element, attrs, tabsCtrl) {

            //console.log('Controlador', tabsCtrl);

            /**
             * Creates a new marker and adds it to a group
             * @param {H.map.Group} group       The group holding the new marker
             * @param {H.geo.Point} coordinate  The location of the marker
             * @param {String} html             Data associated with the marker
             */
            function addMarkerToGroup(group, coordinate, html) {
                var marker = new H.map.Marker(coordinate);
                // add custom data to the marker
                marker.setData(html);
                group.addObject(marker);

                marker.addEventListener('pointerleave', function (evt) {
                    scope.bubble.close();
                }, false);

            }

            /**
             * Add two markers showing the position of Liverpool and Manchester City football clubs.
             * Clicking on a marker opens an infobubble which holds HTML content related to the marker.
             * @param  {H.Map} map      A HERE Map instance within the application
             */
            function addInfoBubble(map, coordinates) {
                var group = new H.map.Group();

                map.addObject(group);

                // add 'tap' event listener, that opens info bubble, to the group
                scope.bubble;
                group.addEventListener('tap', function (evt) {
                    // if (scope.bubble !== undefined) {
                    //     scope.bubble.close();
                    // }

                    // event target is the marker itself, group is a parent event target
                    // for all objects that it contains
                    scope.bubble = new H.ui.InfoBubble(evt.target.getGeometry(), {
                        // read custom data
                        content: evt.target.getData()
                    });
                    // show info bubble
                    scope.ui.addBubble(scope.bubble);
                }, false);


                angular.forEach(coordinates, function (value, key) {
                    addMarkerToGroup(group, {lat: value.latitude, lng: value.longitude},
                        '<div style="width: 250px"><a href="/children/view/' + value.id + '">' + value.name + '</a>');
                });


                // map.getViewModel().setLookAtData({
                //     bounds: group.getBoundingBox()
                // });
            }

            /**
             * Boilerplate map initialization code starts below:
             */

// initialize communication with the platform
// In your own code, replace variable window.apikey with your own apikey
            var platform = new H.service.Platform({
                apikey: 'fgRnSsPLJX3oJiiDsKfxhuuA5EAXrZlTc7P4Oei_vHA'
            });
            var defaultLayers = platform.createDefaultLayers();

            // if(scope.status)

            var refresh = function () {

                Children.getMap({city_id: attrs.cityId}, function (data) {

                    scope.coordinates = data.coordinates;
                    scope.mapCenter = data.center;
                    scope.mapZoom = data.center.zoom;
                    scope.mapReady = true;

                    //console.log(H);

// initialize a map - this map is centered over Europe
                    var map = new H.Map(document.getElementById('map-markes'),
                        defaultLayers.vector.normal.map, {
                            center: {lat: scope.mapCenter.latitude, lng: scope.mapCenter.longitude},
                            zoom: 7,
                            pixelRatio: window.devicePixelRatio || 1
                        });



                    var mapTileService = platform.getMapTileService({
                        // type: 'aerial'
                    });

                    scope.tileLayer = mapTileService.createTileLayer(
                        'maptile',
                        'reduced.day',
                        256,
                        'png8'
                    );
                    map.setBaseLayer(scope.tileLayer);


// add a resize listener to make sure that the map occupies the whole container
                    window.addEventListener('resize', () => map.getViewPort().resize());

// MapEvents enables the event system
// Behavior implements default interactions for pan/zoom (also on mobile touch environments)
                    var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

// create default UI with layers provided by the platform
                    scope.ui = H.ui.UI.createDefault(map, defaultLayers);


// Now use the map as required...
                    addInfoBubble(map, scope.coordinates);

                });
            };

            scope.$watch('status', function (value) {
                refresh();
            });

        }

        return {
            link: init,
            scope: {
                /*The object that passed from the cntroller*/
                objectToInject: '=',
                status: '='
            },
            replace: true,
            templateUrl: '/views/components/cases_map_markes.html'
        };
    });

})();

(function () {

    angular.module('BuscaAtivaEscolar').directive('casesMarkerMap', function () {

        function init(scope) {
            /**
             * Adds a  draggable marker to the map..
             *
             * @param {H.Map} map                      A HERE Map instance within the
             *                                         application
             * @param {H.mapevents.Behavior} behavior  Behavior implements
             *                                         default interactions for pan/zoom
             */
            function addDraggableMarker(map, behavior) {

                scope.marker = new H.map.Marker({
                    lat: scope.$parent.fields.place_lat,
                    lng: scope.$parent.fields.place_lng,
                }, {
                    // mark the object as volatile for the smooth dragging
                    volatility: true
                });
                // Ensure that the marker can receive drag events
                scope.marker.draggable = true;
                scope.map.addObject(scope.marker);
                scope.map.addEventListener('dragstart', function (ev) {
                    // scope.$parent.fields.place_lat = ev.target.b.lat;
                    // scope.$parent.fields.place_lng = ev.target.b.lng;
                    // scope.$apply();
                    var target = ev.target,
                        pointer = ev.currentPointer;
                    if (target instanceof H.map.Marker) {
                        var targetPosition = map.geoToScreen(target.getGeometry());
                        target['offset'] = new H.math.Point(pointer.viewportX - targetPosition.x, pointer.viewportY - targetPosition.y);
                        behavior.disable();
                    }
                }, false);

                // re-enable the default draggability of the underlying map
                // when dragging has completed
                scope.map.addEventListener('dragend', function (ev) {
                    scope.$parent.fields.place_lat = ev.target.b.lat;
                    scope.$parent.fields.place_lng = ev.target.b.lng;

                    //IDENTIFICAR AQUI QUE HOUVE UMA MUDANCA DE POSICAO MANUAL
                    scope.$parent.fields.moviment = true;

                    scope.$apply();
                    var target = ev.target;
                    if (target instanceof H.map.Marker) {
                        behavior.enable();
                    }
                }, false);

                // Listen to the drag event and move the position of the marker
                // as necessary
                scope.map.addEventListener('drag', function (ev) {
                    // scope.$parent.fields.place_lat = ev.target.b.lat;
                    // scope.$parent.fields.place_lng = ev.target.b.lng;
                    // scope.$apply();
                    var target = ev.target,
                        pointer = ev.currentPointer;
                    if (target instanceof H.map.Marker) {
                        target.setGeometry(map.screenToGeo(pointer.viewportX - target['offset'].x, pointer.viewportY - target['offset'].y));
                    }
                }, false);
            }

            scope.$watchGroup(['fields.place_lat','fields.place_lng'], function (newVal, oldVal) {

                if (newVal !== oldVal) {
                    scope.map.removeObject(scope.marker);
                    scope.marker = new H.map.Marker({
                        lat: scope.$parent.fields.place_lat || oldVal[0],
                        lng: scope.$parent.fields.place_lng || oldVal[1],
                    }, {
                        // mark the object as volatile for the smooth dragging
                        volatility: true
                    });
                    // Ensure that the marker can receive drag events
                    scope.marker.draggable = true;
                    scope.map.addObject(scope.marker);
                    scope.map.setCenter({lat: scope.$parent.fields.place_lat, lng: scope.$parent.fields.place_lng});
                    scope.map.setZoom(18);
                }
            });


            /**
             * Boilerplate map initialization code starts below:
             */

            //Step 1: initialize communication with the platform
            // In your own code, replace variable window.apikey with your own apikey
            var platform = new H.service.Platform({
                apikey: 'fgRnSsPLJX3oJiiDsKfxhuuA5EAXrZlTc7P4Oei_vHA'
            });

            var defaultLayers = platform.createDefaultLayers();

            //Step 2: initialize a map - this map is centered over Boston
            scope.map = new H.Map(document.getElementById('map-marker'),
                defaultLayers.vector.normal.map, {
                    center: {
                        lat: scope.$parent.fields.place_lat,
                        lng: scope.$parent.fields.place_lng
                    },
                    zoom: 18,
                    pixelRatio: window.devicePixelRatio || 1
                });


            //Configuração do mapa
            var mapTileService = platform.getMapTileService({
                type: 'aerial'
            });
            var parameters = {
                lg: 'pt'
            };
            var tileLayer = mapTileService.createTileLayer(
                'maptile',
                'hybrid.day',
                256,
                'png8',
                parameters
            );
            scope.map.setBaseLayer(tileLayer);

            // add a resize listener to make sure that the map occupies the whole container
            window.addEventListener('resize', () => scope.map.getViewPort().resize());

            //Step 3: make the map interactive
            // MapEvents enables the event system
            // Behavior implements default interactions for pan/zoom (also on mobile touch environments)
            var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(scope.map));

            // Step 4: Create the default UI:
            var ui = H.ui.UI.createDefault(scope.map, defaultLayers, 'pt-BR');

            // Add the click event listener.
            addDraggableMarker(scope.map, behavior);

        }

        return {
            link: init,
            scope: true,
            templateUrl: '/views/components/cases_marker_map.html'
        };
    });

})();

(function () {

    angular.module('BuscaAtivaEscolar').directive('causesChart', function ($timeout, moment, Platform, Reports, Charts) {

        function init(scope, element, attrs) {

            var causesData = {};
            var causesChart = {};
            var causesReady = false;

            var isReadyForCausesChart = false;
            var hasEnoughDataForCausesChart = false;

            scope.showFilter = false;

            scope.sort = 'maxToMin';

            scope.getCausesConfig = getCausesConfig;

            scope.isReadyForCausesChart = function () {
                return isReadyForCausesChart;
            };

            scope.hasEnoughDataForCausesChart = function () {
                return hasEnoughDataForCausesChart;
            };

            scope.filterShow = function () {
                scope.showFilter = !scope.showFilter;
            }
  
            scope.menuFilter = [
                {name: 'Tudo', title: 'Todos os registros', qtd_days: null},
                {name: 'Semanal', title: 'Ũltimos 7 dias', qtd_days: 7},
                {name: 'Mensal', title: 'Últimos 30 dias', qtd_days: 30},
                {name: 'Trimestral', title: 'Últimos 90 dias', qtd_days: 90},
                {name: 'Semestral', title: 'Últimos 180 dias', qtd_days: 180}
              ]

            scope.fetchCausesData = function (value) {

                if(value === null || typeof value === 'number'){
                    scope.showFilter = false;
                }

                scope.selectedMenu = value;

                var searchData = {
                    view: 'linear',
                    entity: 'children',
                    dimension: 'case_cause_ids',
                    filters: {
                        case_status: ['in_progress','cancelled', 'completed', 'interrupted', 'transferred'],
                        alert_status: ['accepted']
                    }
                }

                if(typeof value === 'number'){
                    searchData.filters.created_at = {
                        gte: moment().subtract(value, 'days').format('YYYY-MM-DD'),
                        lte: moment().format('YYYY-MM-DD'),
                        format: "YYYY-MM-dd"
                    }
                }

                if (value == 'filter') {
                    if(scope.dt_inicial && scope.dt_final) {
                        searchData.filters.created_at = {
                            gte: moment(scope.dt_inicial).format('YYYY-MM-DD'),
                            lte: moment(scope.dt_final).format('YYYY-MM-DD'),
                            format: "YYYY-MM-dd"
                        }
                    }
                }

                return Reports.query(searchData, function (data) {
                    causesData = data;
                    causesChart = getCausesChart();
                    causesReady = true;

                    isReadyForCausesChart = true;
                    hasEnoughDataForCausesChart = (
                        causesData &&
                        causesData.response &&
                        !angular.equals({}, causesData.response.report) &&
                        !angular.equals([], causesData.response.report)
                    );

                    $timeout(function () {
                        scope.$broadcast('highchartsng.reflow');
                    }, 1000);
                });

            }

            function getCausesChart() {
                var report = causesData.response.report;
                var chartName = 'Divisão dos casos por motivo de evasão escolar';
                var labels = causesData.labels ? causesData.labels : {};

                var sortable = [];
                var objSorted = {};
                var finalLabels = {};

                for (var value in report) {
                    sortable.push([value, report[value]]);
                }

                if(scope.sort == 'minToMax'){
                    sortable.sort(function(a, b) {
                        return a[1] - b[1];
                    });
                }

                if(scope.sort == 'maxToMin'){
                    sortable.sort(function(a, b) {
                        return b[1] - a[1];
                    });
                }

                sortable.forEach(function(item){
                    objSorted["_"+item[0]]=item[1]
                });

                for (var key in labels){
                    finalLabels["_"+key] = labels[key];
                }

                return Charts.generateDimensionChart(objSorted, chartName, finalLabels, 'bar');
            }

            function getCausesConfig() {
                if (!causesReady) return;
                return causesChart;
            }

            Platform.whenReady(function () {
                scope.fetchCausesData(null);
            });
            //Date Picker and Masks

            scope.today = function() {
                scope.dt = new Date();
            };

            scope.today();

            scope.clear = function() {
                scope.dt = null;
            };

            scope.inlineOptions = {
                minDate: new Date(),
                showWeeks: false
            };

            scope.dateOptions1 = {
                formatYear: 'yyyy',
                showWeeks: false

            };

            scope.dateOptions2 = {
                formatYear: 'yyyy',
                maxDate: new Date(),
                showWeeks: false
            };

            scope.open1 = function() {
                scope.popup1.opened = true;
            };

            scope.open2 = function() {
                scope.popup2.opened = true;
            };

            scope.format = 'ddMMyyyy';

            scope.altInputFormats = ['M!/d!/yyyy'];

            scope.popup1 = {
                opened: false
            };

            scope.popup2 = {
                opened: false
            };

            scope.refresByMinToMax = function () {
                scope.sort = 'minToMax';
                scope.fetchCausesData(null);
            };

            scope.refresByMaxToMin = function () {
                scope.sort = 'maxToMin';
                scope.fetchCausesData(null);
            }
        }

        return {
            link: init,
            replace: true,
            templateUrl: '/views/components/causes_chart.html'
        };
    });

})();
(function() {

	angular.module('BuscaAtivaEscolar').directive('appCitySelect', function (Cities, StaticData) {


		function init(scope, element, attrs) {
			scope.static = StaticData;

			scope.fetch = fetch;
			scope.renderSelected = renderSelected;
			scope.onUFChanged = onUFChanged;
			scope.onCityChanged = onCityChanged;

			function fetch(query) {
				var data = {name: query, $hide_loading_feedback: true};
				if(scope.uf) data.uf = scope.uf;

				//console.log("[components.city_select] Looking for cities: ", data);

				return Cities.search(data).$promise.then(function (res) {
					return res.results;
				});
			}

			function onUFChanged() {
				scope.city = null;
				updateModel(scope.uf, null);
				if(scope.onSelect) scope.onSelect(scope.uf, scope.city);
			}

			function onCityChanged(city) {
				scope.uf = city.uf;
				updateModel(city.uf, city);
				if(scope.onSelect) scope.onSelect(scope.uf, city);
			}

			function updateModel(uf, city) {
				if(!scope.model) return;
				if(scope.ufField) scope.model[scope.ufField] = uf;
				if(scope.cityField) scope.model[scope.cityField] = city;
			}

			function renderSelected(city) {
				if(!city) return '';
				scope.uf = city.uf;
				return city.uf + ' / ' + city.name;
			}

		}

		return {
			scope: {
				'onSelect': '=?',
				'isUfRequired': '=?',
				'isCityRequired': '=?',
				'city': '=?',
				'uf': '=?',
				'model': '=?',
				'ufField': '=?',
				'cityField': '=?'
			},
			link: init,
			replace: true,
			templateUrl: '/views/components/city_select.html'
		};
	});

})();
(function() {

	angular.module('BuscaAtivaEscolar').directive('columnSorter', function (Identity, Platform, Auth) {

		function init(scope, element, attrs) {

			var sortModes = [undefined, 'asc', 'desc'];

			scope.sortMode = (scope.model && scope.model[scope.field]) ? scope.model[scope.field] : null;
			scope.sortModeIndex = (scope.sortMode) ? sortModes.indexOf(scope.sortMode) : 0;

			scope.toggleSorting = function() {
				scope.sortModeIndex++;

				if(scope.sortModeIndex >= sortModes.length) {
					scope.sortModeIndex = 0;
				}

				scope.sortMode = sortModes[scope.sortModeIndex];
				scope.model[scope.field] = scope.sortMode;

				if(scope.onChange) {
					scope.onChange(scope.field, scope.sortMode);
				}
			};
			//Default order
            scope.model['created_at'] = 'desc';
		}

		return {
			scope: {
				'model': '=',
				'field': '=',
				'onChange': '=?',
			},
			link: init,
			replace: true,
			transclude: true,
			templateUrl: '/views/components/column_sorter.html'
		};
	});

})();
(function() {

	angular.module('BuscaAtivaEscolar').directive('debugStats', function (Config, Identity, Auth) {

		function init(scope, element, attrs) {
			scope.isEnabled = false;
			scope.identity = Identity;
			scope.auth = Auth;
			scope.config = Config;
		}

		return {
			link: init,
			replace: true,
			templateUrl: '/views/components/debug_stats.html'
		};
	});

})();
(function () {

    angular.module('BuscaAtivaEscolar').directive('donutsChart', function ($timeout, moment, Platform, Reports, Charts) {

        function getDadosRematricula(scope, element, attrs) {
            Reports.getStatusBar(function (data) {
                if (data.status !== 'ok') {
                    init(scope, element, attrs, data);
                }
            });
        }

        function init(scope, element, attrs, data) {

            var meta = data.goal_box.goal;
            var atingido = data.goal_box.reinsertions_classes && data.goal_box.reinsertions_classes || 0;
            scope.showDonuts = 0;

            if (atingido !== 0) {
                scope.showDonuts = 1;
            }

            var percentualAtingido = Math.floor((atingido * 100) / meta);
            // var percentualAtingido = 100;

            var color = '#EEEEEE';
            var text = '';

            switch (true) {
                case (percentualAtingido <= 19):
                    color = '#ab0000';
                    text = 'Alto Risco'
                    break;
                case (percentualAtingido > 19 && percentualAtingido < 50):
                    color = '#cd7c00';
                    text = 'Médio Risco'
                    break;
                case (percentualAtingido >= 50 && percentualAtingido < 100):
                    color = '#008b00';
                    text = 'Baixo Risco';
                    break;
                case (percentualAtingido >= 100):
                    color = '#2280aa';
                    text = 'Meta Atingida!';
                    break;
                default:
                    color = color
                    //console.log('Algum problema com o Donuts');
            }

            var colors = Highcharts.getOptions().colors,
                categories = [
                    'alcancado',
                    'meta'
                ],
                data = [
                    {
                        color: color,
                        drilldown: {
                            name: 'estou',
                            categories: [
                                'Onde estou'
                            ],
                            data: [
                                percentualAtingido
                            ]
                        }
                    },
                    {
                        color: '#9d9d9d',
                        drilldown: {
                            name: 'falta',
                            categories: [
                                'Ainda falta'
                            ],
                            data: [
                                100 - percentualAtingido
                            ]
                        }
                    }
                ],
                browserData = [],
                versionsData = [],
                i,
                j,
                dataLen = data.length,
                drillDataLen,
                brightness;


// Build the data arrays
            for (i = 0; i < dataLen; i += 1) {

                // add browser data
                browserData.push({
                    name: categories[i],
                    y: data[i].y,
                    color: data[i].color
                });

                // add version data
                drillDataLen = data[i].drilldown.data.length;
                for (j = 0; j < drillDataLen; j += 1) {
                    brightness = 0.2 - (j / drillDataLen) / 5;
                    versionsData.push({
                        name: data[i].drilldown.categories[j],
                        y: data[i].drilldown.data[j],
                        color: Highcharts.Color(data[i].color).brighten(brightness).get()
                    });
                }
            }

// Create the chart
            Highcharts.chart('donuts-chart', {
                chart: {
                    type: 'pie'
                },
                title: {
                    text: '<span style="color:' + color + '">' +text+ '</span>',
                    align: 'center',
                    verticalAlign: 'middle',
                    y: 0
                },
                plotOptions: {
                    pie: {
                        shadow: false,
                        center: ['50%', '50%']
                    }
                },
                tooltip: {
                    valueSuffix: '%'
                },
                series: [{
                    name: 'Browsers',
                    data: browserData,
                    size: '60%',
                    dataLabels: {
                        formatter: function () {
                            return this.y > 5 ? this.point.name : null;
                        },
                        color: '#ffffff',
                        distance: -30
                    }
                }, {
                    name: 'Porcentagem',
                    data: versionsData,
                    size: '80%',
                    innerSize: '60%',
                    id: 'versions'
                }],
                responsive: {
                    rules: [{
                        condition: {
                            maxWidth: 400
                        },
                        chartOptions: {
                            series: [{}, {
                                id: 'versions',
                                dataLabels: {
                                    enabled: false
                                }
                            }]
                        }
                    }]
                },
                credits: {
                    enabled: false
                },
                exporting: {enabled: false}
            });
        }

        return {
            link: getDadosRematricula,
            replace: true,
            templateUrl: '/views/components/donuts_chart.html'
        };
    });

})();
(function() {

	angular.module('BuscaAtivaEscolar').directive('evolutionGraph', function (moment, Platform, Reports, Report, Charts, Identity, Tenants, StaticData, Config) {
		
		function init(scope, element, attrs) {

			var metrics = {};

			scope.static = StaticData;

			scope.options_selo =['TODOS', 'PARTICIPA DO SELO', 'NÃO PARTICIPA DO SELO'];

			scope.query_evolution_graph = {
				uf: '',
				tenant_id: '',
				selo: 'TODOS'
			};

			scope.schema = [
				{
					"name": "Date",
					"type": "date",
					"format": "%Y-%m-%d"
				},
				{
					"name": "Rematricula",
					"type": "string"
				},
				{
					"name": "Unemployment",
					"type": "number"
				}
			];

			scope.dataSource = {
				caption: {
					text: "Evolução (Re)Matrículas"
				},
				subcaption: {
					text: "Período de "+moment().subtract(100, "days").format('DD/MM/YYYY')+" até "+moment().format('DD/MM/YYYY')
				},
				series: "Rematricula",
				yaxis: [
					{
						format: {
							formatter: function(obj){
								var val=null;
								if( obj.type === "axis")
								{
									val= obj.value
								}
								else
								{
									val= obj.value.toString().replace(".",",");
								}
								return val;
							}

						},
						plot: [
							{
								value: "Unemployment",
								type: "column"
							}
						],
						title: "(Re)Matrículas",
						referenceline: [
							{
								label: "Meta Selo UNICEF"
							}
						],
						defaultFormat: false
					}
				],
				xAxis: {
					initialInterval: {
						from: moment().subtract(100, "days").format('YYYY-MM-DD'),
						to: moment().format('YYYY-MM-DD')
					},
					outputTimeFormat: {
						year: "%Y",
						month: "%m/%Y",
						day: "%d/%m/%Y"
					},
					timemarker: [{
						timeFormat: '%m/%Y'
					}]
				},
				tooltip: {
					enabled: "false", // Disables the Tooltip
					outputTimeFormat: {
						day: "%d/%m/%Y"
					},
					style: {
						container: {
							"border-color": "#000000",
							"background-color": "#75748D"
						},
						text: {
							"color": "#FFFFFF"
						}
					}
				}
			};

			scope.getUFs = function () {
				return StaticData.getUFs();
			};

			scope.getData = function () {

				Identity.provideToken().then(function (token) {

					var jsonify = function (res) { return res.json(); }

					var dataDaily = fetch(Config.getAPIEndpoint() + 'reports/data_rematricula_daily?uf='+scope.query_evolution_graph.uf+'&tenant_id='+scope.query_evolution_graph.tenant_id+'&selo='+scope.query_evolution_graph.selo+'&token=' + token).then(jsonify);

					Promise.all([dataDaily]).then( function( res) {
						const data = res[0];

						var data_final = [
							{date: moment().format('YYYY-MM-DD'), value: "0", tipo: "(Re)matrícula"},
							{date: moment().format('YYYY-MM-DD'), value: "0", tipo: "Cancelamento"}
						];

						if( parseInt(data.data.length) > 0 ) { data_final = data.data; }

						const fusionTable = new FusionCharts.DataStore().createDataTable(

							data_final.map(function(x) {
								return [
									x.date,
									x.tipo,
									parseFloat(x.value)
								]
							}),

							scope.schema
						);
						scope.$apply(function () {

							if( data.selo == "PARTICIPA DO SELO" && data.goal > 0) {
								scope.dataSource.yaxis[0].Max = data.goal;
								scope.dataSource.yaxis[0].referenceline[0].label = "Meta Selo UNICEF";
								scope.dataSource.yaxis[0].referenceline[0].value = data.goal;
							}

							if( data.selo == "NÃO PARTICIPA DO SELO" || data.selo == "TODOS") {
								scope.dataSource.yaxis[0].Max = 0;
								scope.dataSource.yaxis[0].referenceline[0] = {};
							}

							scope.dataSource.data = fusionTable;
						});

						scope.initTenants();
					});

				});
			}

			scope.initTenants = function(){
				if (Identity.getType() === 'coordenador_estadual') {
					scope.tenants = Tenants.findByUfPublic({'uf': scope.identity.getCurrentUser().uf});
				}
			};

			scope.atualizaDash = function () {
				scope.tenants = Tenants.findByUfPublic({'uf': scope.query_evolution_graph.uf});
				scope.getData();
			};

			scope.onSelectCity = function () {
				scope.getData();
			};

			scope.refresh = function () {
				if ((scope.query.uf !== undefined) && (scope.query.tenant_id !== undefined)) {
					scope.tenants = Graph.getReinsertEvolution({'uf': scope.query.uf});
				}
			};

			scope.getTenants = function () {
				if (!scope.tenants || !scope.tenants.data) return [];
				return scope.tenants.data;
			};


		}

		return {
			link: init,
			replace: true,
			templateUrl: '/views/dashboards/grafico_evolucao_rematriculas.html'
		};
	});

})();
(function() {

	angular.module('BuscaAtivaEscolar').directive('appHeaderWarnings', function (Identity, Platform, Auth) {

		function init(scope, element, attrs) {
			scope.identity = Identity;
			scope.auth = Auth;
			scope.platform = Platform;
		}

		return {
			link: init,
			replace: true,
			templateUrl: '/views/components/header_warnings.html'
		};
	});

})();
(function() {

	angular.module('BuscaAtivaEscolar').directive('lastMonthTimeline', function ($timeout, moment, Platform, Reports, Charts) {

		function init(scope, element, attrs) {

			var timelineData = {};
			var timelineChart = {};
			var timelineReady = false;

			var isReady = false;
			var hasEnoughData = false;

			scope.getTimelineConfig = getTimelineConfig;

			scope.isReady = function() {
				return isReady;
			};

			scope.hasEnoughData = function() {
				return hasEnoughData;
			};

            scope.firstDate = null;
            scope.finalDate = null;

            //----------------------------
            scope.popupStart = {
                opened: false
            };

            scope.popupFinish = {
                opened: false
            };

			scope.formatDates = 'ddMMyyyy';

            scope.dateOptionsStart = {
                formatYear: 'yyyy',
                showWeeks: false
            };

            scope.dateOptionsFinish = {
                formatYear: 'yyyy',
                maxDate: new Date(),
                showWeeks: false
            };

			scope.openStartDate = function () {
                scope.popupStart.opened = true;
            };

            scope.openFinishDate = function () {
                scope.popupFinish.opened = true;
            };
            //----------------------------

			scope.fetchTimelineData= function() {

				var startDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
				var endDate = moment().format('YYYY-MM-DD');

                if( scope.firstDate != null ) startDate = moment(scope.firstDate).format('YYYY-MM-DD');
                if( scope.finalDate != null ) endDate = moment(scope.finalDate).format('YYYY-MM-DD');

				return Reports.query({
					view: 'time_series',
					entity: 'children',
					dimension: 'child_status',
					filters: {
						date: {from: startDate, to: endDate},
						case_status: ['in_progress', 'completed', 'interrupted', 'cancelled', 'transferred'],
						alert_status: ['accepted']
					}
				}, function (data) {
					timelineData = data;
					timelineChart = getTimelineChart();
					timelineReady = true;

					isReady = true;
					hasEnoughData = (
						timelineData &&
						timelineData.response &&
						timelineData.response.report.length &&
						timelineData.response.report.length > 0
					);

					$timeout(function() {
						scope.$broadcast('highchartsng.reflow');
					}, 1000);
				});
			}

			function getTimelineChart() {
				var report = timelineData.response.report;
				var chartName = 'Evolução do status dos casos';
				var labels = timelineData.labels ? timelineData.labels : {};

				return Charts.generateTimelineChart(report, chartName, labels);

			}

			function getTimelineConfig() {
				if(!timelineReady) return;
				return timelineChart;
			}

			Platform.whenReady(function () {
				scope.fetchTimelineData();
			});
		}

		return {
			link: init,
			replace: true,
			templateUrl: '/views/components/last_month_timeline.html'
		};
	});

})();
(function() {

	angular.module('BuscaAtivaEscolar').directive('appLoadingFeedback', function (API) {

		function init(scope, element, attrs) {
			scope.isVisible = API.hasOngoingRequests;
		}

		return {
			link: init,
			replace: true,
			templateUrl: '/views/components/loading_feedback.html'
		};
	});

})();
(function () {
  angular
    .module('BuscaAtivaEscolar')
    .directive('metricsCountry', function (moment, Platform, Reports, Charts) {
      function init(scope, element, attrs) {
        scope.availableOptions = [
          { id: 1, name: 'Ciclo Estratégia | 2021 - 2024 (Status atual)' },
          { id: 2, name: 'Ciclo Estratégia 2014-2020 (Status em 31/12/2020)' },
          { id: 3, name: 'Ciclo Estratégia 2014-2020 (Status em 31/12/2019)' },
          { id: 4, name: 'Ciclo Estratégia 2014-2020 (Status em 31/12/2018)' },
          { id: 5, name: 'Ciclo Estratégia 2014-2020 (Status em 31/12/2017)' }
        ];
        scope.selectedOption = {
          id: 1,
          name: 'Ciclo Estratégia | 2021 - 2024 (Status atual)'
        };

        scope.stats = {};

        scope.stats_ciclo_2 = {
          num_tenants: 2518,
          num_ufs: 21,
          num_signups: 3214,
          num_pending_setup: 695,
          num_alerts: 160719,
          num_pending_alerts: 110836,
          num_rejected_alerts: 79865,
          num_total_alerts: 351420,
          num_cases_in_progress: 121644,
          num_children_reinserted: 79595,
          num_pending_signups: 1,
          num_pending_state_signups: 1,
          num_children_in_school: 6050,
          num_children_in_observation: 73545,
          num_children_out_of_school: 48060,
          num_children_cancelled: 32299,
          num_children_transferred: 188,
          num_children_interrupted: 577
        };

        scope.stats_ciclo_3 = {
          num_tenants: 2518,
          num_ufs: 21,
          num_signups: 3214,
          num_pending_setup: 695,
          num_alerts: 55106,
          num_pending_alerts: 88518,
          num_rejected_alerts: 42081,
          num_total_alerts: 185705,
          num_cases_in_progress: 121644,
          num_children_reinserted: 79595,
          num_pending_signups: 1,
          num_pending_state_signups: 1,
          num_children_in_school: 307,
          num_children_in_observation: 16800,
          num_children_out_of_school: 26040,
          num_children_cancelled: 11959,
          num_children_transferred: 0,
          num_children_interrupted: 0
        };
        scope.stats_ciclo_4 = {
          num_tenants: 2518,
          num_ufs: 21,
          num_signups: 3214,
          num_pending_setup: 695,
          num_alerts: 5776,
          num_pending_alerts: 24866,
          num_rejected_alerts: 11663,
          num_total_alerts: 42305,
          num_cases_in_progress: 121644,
          num_children_reinserted: 79595,
          num_pending_signups: 1,
          num_pending_state_signups: 1,
          num_children_in_school: 143,
          num_children_in_observation: 316,
          num_children_out_of_school: 4655,
          num_children_cancelled: 662,
          num_children_transferred: 0,
          num_children_interrupted: 0
        };

        scope.stats_ciclo_5 = {
          num_tenants: 2518,
          num_ufs: 21,
          num_signups: 3214,
          num_pending_setup: 695,
          num_alerts: 114,
          num_pending_alerts: 149,
          num_rejected_alerts: 10,
          num_total_alerts: 273,
          num_cases_in_progress: 121644,
          num_children_reinserted: 79595,
          num_pending_signups: 1,
          num_pending_state_signups: 1,
          num_children_in_school: 2,
          num_children_in_observation: 1,
          num_children_out_of_school: 102,
          num_children_cancelled: 9,
          num_children_transferred: 0,
          num_children_interrupted: 0
        };

        function refreshMetrics() {
          return Reports.getCountryStats(function (data) {
            if (data.status !== 'ok') {
              ngToast.danger(
                'Ocorreu um erro ao carregar os números gerais da plataforma. (err: ' +
                  data.reason +
                  ')'
              );
              return;
            }

            scope.stats = data.stats;
          });
        }

        Platform.whenReady(function () {
          refreshMetrics();
        });
      }

      return {
        link: init,
        replace: true,
        templateUrl: '/views/components/metrics_country.html'
      };
    });
})();

(function() {

	angular.module('BuscaAtivaEscolar').directive('metricsOverview', function (moment, Platform, Reports, Report, Charts, Identity) {

		function init(scope, element, attrs) {

			var metrics = {};

			function refreshMetrics() {

				if( attrs.ibgeId && attrs.uf){
					Report.getStatusCityByCountry({ibge_id: attrs.ibgeId, uf: attrs.uf}, function (data) {
						metrics = data._data;
					});
				}else{
					Report.getStatusCity({city: Identity.getCurrentUser().tenant.city.name, uf: Identity.getCurrentUser().tenant.city.uf}, function (data) {
						metrics = data._data;
					});
				}

			}

			scope.getMetrics = function() {
				return metrics;
			};

			Platform.whenReady(function () {
				refreshMetrics();
			});

			scope.$watch('objectToInjectInMetrics', function (value) {
				if(value){
					scope.Obj = value;
					scope.Obj.invoke = function(ibgeId){
						attrs.ibgeId = ibgeId;
						refreshMetrics();
					}
				}
			});

		}

		return {
			link: init,
			scope: {
				objectToInjectInMetrics: '='
			},
			replace: true,
			templateUrl: '/views/components/metrics_overview.html'
		};
	});

})();
(function() {

	angular.module('BuscaAtivaEscolar').directive('metricsPlatform', function (moment, Platform, SystemHealth) {

		function init(scope, element, attrs) {

			scope.search = {};

			function refreshMetrics() {
				SystemHealth.getStats({}, function (stats) {
					scope.search = stats.search;
				})
			}

			scope.renderPctPanelClass = function (value, warn_mark, danger_mark) {
				if(value === null || value === undefined) return 'panel-danger';
				var val = parseFloat(value);
				if(val >= danger_mark) return 'panel-danger';
				if(val >= warn_mark) return 'panel-warning';
				return 'panel-success';
			};

			scope.renderSearchPanelClass = function (status) {
				if(status === 'green') return 'panel-success';
				if(status === 'yellow') return 'panel-warning';
				return 'panel-danger';
			};

			scope.getMetrics = function() {
				return metrics;
			};

			Platform.whenReady(function () {
				refreshMetrics();
			});

		}

		return {
			link: init,
			replace: true,
			templateUrl: '/views/components/metrics_platform.html'
		};
	});

})();
(function() {

	angular.module('BuscaAtivaEscolar').directive('metricsState', function (moment, Platform, Reports, ngToast) {

		function init(scope, element, attrs) {
			scope.stats = {};

			function refreshMetrics() {
				return Reports.getStateStats(function (data) {
					if(data.status !== 'ok') {
						ngToast.danger('Ocorreu um erro ao carregar os números gerais da plataforma. (err: ' + data.reason + ')');
						return;
					}

					scope.stats = data.stats;
				});
			}

			Platform.whenReady(function () {
				refreshMetrics();
			});
		}

		return {
			link: init,
			replace: true,
			templateUrl: '/views/components/metrics_state.html'
		};
	});

})();
(function() {

	angular.module('BuscaAtivaEscolar').directive('myAlerts', function (moment, Identity, Platform, Alerts) {

		var alerts = [];
		var isReady = false;

		function refresh() {
			Alerts.mine({}, function(data) {
				alerts = data.data;
				isReady = true;
			});
		}

		function init(scope, element, attrs) {

			scope.getAlerts = function() {
				return alerts;
			};

			scope.isReady = function() {
				return isReady;
			};

			scope.hasAlerts = function() {
				return (alerts && alerts.length > 0);
			};

			Platform.whenReady(function () {
				refresh();
			});
		}

		return {
			link: init,
			replace: true,
			templateUrl: '/views/components/my_alerts.html'
		};
	});

})();
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
                //console.log("[widget.my_assignments] Loading assignments...");
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
(function () {

    angular.module('BuscaAtivaEscolar').directive('appNavbar', function ($localStorage, $location, $state, Identity, StaticData, Notifications, Platform, Auth, Children) {

        function init(scope, element, attrs) {

            scope.identity = Identity;
            scope.auth = Auth;
            scope.notifications = Notifications;
            scope.pending_requests = 0;

            scope.showNotifications = true;

            scope.location = $location.url();
            scope.state = window.location.pathname;


            scope.isHidden = function () {
                return !!Platform.getFlag('HIDE_NAVBAR');
            };

            scope.renderTenantName = function () {
                if (Identity.getCurrentUser().tenant) return Identity.getCurrentUser().tenant.name;
                if (Identity.getCurrentUser().uf) return StaticData.getCurrentUF().name;
                return '';
            };

            scope.onMenuToggle = function (isOpen) {
                if (isOpen) Notifications.refresh();
            };

            scope.toggleNotifications = function ($event) {
                scope.showNotifications = !scope.showNotifications;

                $event.stopPropagation();
                $event.stopImmediatePropagation();
                $event.preventDefault();

                return false;
            };

            if(Identity.isLoggedIn()) {

                if( Identity.isUserType("supervisor_institucional") || Identity.isUserType("coordenador_operacional") ) {

                    Children.requests().$promise.then(function (value) {
                        value.data.forEach(function (request) {
                            if (Identity.isUserType("supervisor_institucional") && Identity.getCurrentUserID() === request.requester_id && request.status === "requested") {
                                scope.pending_requests += 1;
                            }
                            if (Identity.isUserType("coordenador_operacional") && request.status == "requested") {
                                scope.pending_requests += 1;
                            }
                        });
                    });
                }
            }

            Platform.whenReady(function () {
                //verify signature LGPD
                if (!Identity.getCurrentUser().lgpd) {
                    return $state.go('lgpd_signup', {id: Identity.getCurrentUser().id});
                }
            });

        }

        return {
            link: init,
            replace: true,
            templateUrl: '/views/navbar.html'
        };
    });

})();
(function () {
    angular.module('BuscaAtivaEscolar').filter('dtFormat', function () {
        return function (input) {
            //console.log('Cliente Date ' + typeof input)
            if (input) {
                return moment(input).format('DD/MM/YYYY');
            } else {
                return 'aguardando'
            }
        };
    });
})();
(function () {
    angular.module('BuscaAtivaEscolar').filter('cep', function () {
        return function (input) {
            var str = input + '';
            str = str.replace(/\D/g, '');
            str = str.replace(/^(\d{2})(\d{3})(\d)/, "$1.$2-$3");
            return str;
        };
    });
})();
(function () {
    angular.module('BuscaAtivaEscolar').filter('cpf', function() {
        return function(input) {
            var str = input+ '';
            str = str.replace(/\D/g,'');
            str = str.replace(/(\d{3})(\d)/,"$1.$2");
            str = str.replace(/(\d{3})(\d)/,"$1.$2");
            str = str.replace(/(\d{3})(\d{1,2})$/,"$1-$2");
            return str;
        };
    });
})();
(function () {
    angular.module('BuscaAtivaEscolar').filter('dateFormatBr', function () {
        return function (firtDate) {
            var data = new Date(firtDate),
                dia  = data.getDate().toString(),
                diaF = (dia.length == 1) ? '0'+dia : dia,
                mes  = (data.getMonth()+1).toString(), //+1 pois no getMonth Janeiro começa com zero.
                mesF = (mes.length == 1) ? '0'+mes : mes,
                anoF = data.getFullYear();
            return diaF+"/"+mesF+"/"+anoF;

        };
    });
})();
(function () {
    angular.module('BuscaAtivaEscolar').filter('dateFormat', function () {
        return function (firtDate) {
            var now = new Date();
            var fDate = new Date(firtDate);
            var dateNow = moment([now.getFullYear(), now.getMonth(), now.getDate()]);
            var startDate = moment([fDate.getFullYear(), fDate.getMonth(), fDate.getDate()]);
            var diffDuration = moment.duration(dateNow.diff(startDate));

            var year = diffDuration.years() > 0 ? diffDuration.years() + (diffDuration.years() === 1 ? ' ano ' : ' anos ') : '';
            var month = diffDuration.months() > 0 ? diffDuration.months() + (diffDuration.months() === 1 ? ' mês ' : ' meses ') : '';
            var days = diffDuration.days() > 0 ? diffDuration.days() + (diffDuration.days() === 1 ? ' dia ' : ' dias') : '';

            if(year || month || days) {
                return 'Há ' + year + month + days;
            }

            return 'Hoje';

        };
    });
})();
(function() {

	angular.module('BuscaAtivaEscolar').directive('ngEnter', function () {

        return function(scope, element, attrs) {
            element.bind("keydown keypress", function(event) {
                if(event.which === 13) {
                    scope.$apply(function(){
                        scope.$eval(attrs.ngEnter);
                    });
                    event.preventDefault();
                }
            });
        };
	});

})();
(function() {

	angular.module('BuscaAtivaEscolar').directive('ngFocusOut', function( $timeout ) {
        return function( $scope, elem, attrs ) {
            $scope.$watch(attrs.ngFocusOut, function( newval ) {
                if ( newval ) {
                    $timeout(function() {
                        elem[0].focusout();
                    }, 0, false);
                }
            });
        };
    });

})();
(function () {


    angular.module('BuscaAtivaEscolar').directive('numbersOnly', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attr, ngModelCtrl) {
                function fromUser(text) {
                    if (text) {
                        var transformedInput = text.replace(/[^0-9]/g, '');

                        if (transformedInput !== text) {
                            ngModelCtrl.$setViewValue(transformedInput);
                            ngModelCtrl.$render();
                        }
                        return transformedInput;
                    }
                    return undefined;
                }

                ngModelCtrl.$parsers.push(fromUser);
            }
        };
    });

})();

(function () {
    angular.module('BuscaAtivaEscolar').filter('phone', function() {
        return function(input) {
            var str = input+ '';
            str = str.replace(/\D/g,'');
            if(str.length === 11 ){
                str=str.replace(/^(\d{2})(\d{5})(\d{4})/,'($1) $2-$3');
            }else{
                str=str.replace(/^(\d{2})(\d{4})(\d{4})/,'($1) $2-$3');
            }
            return str;
        };
    });
})();
(function () {

    angular.module('BuscaAtivaEscolar').directive("scroll", function () {
        return function (scope, element, attrs) {
            angular.element(element).bind("scroll", function () {
                var divHeight = this.children[0].offsetHeight;
                var divHeightVisibleScroll = this.offsetHeight;
                console.log(divHeight, divHeightVisibleScroll, this.scrollTop)
                if (this.scrollTop >= (divHeight - divHeightVisibleScroll - 50)) {
                    scope.$parent.$parent.term = true;
                } else {
                    scope.$parent.$parent.term = false;
                }
                scope.$apply();
            });
        };
    });
})();
(function() {

	angular.module('BuscaAtivaEscolar').directive('appPaginator', function () {


		function init(scope, element, attrs) {

			scope.pageInput = 1;

			function validatePageLimits() {
				if(scope.query.page > scope.collection.meta.total_pages) {
					scope.query.page = scope.collection.meta.total_pages
				}

				if(scope.query.page < 1) {
					scope.query.page = 1
				}
			}

			scope.nextPage = function() {
				if(!scope.query) return;
				if(!scope.collection) return;

				scope.query.page++;

				validatePageLimits();

				scope.onRefresh();
			};

			scope.prevPage = function() {
				if(!scope.query) return;
				if(!scope.collection) return;

				scope.query.page--;

				validatePageLimits();

				scope.onRefresh();
			};

			scope.jumpToPage = function(page) {
				if(!scope.query) return;
				if(!scope.collection) return;

				scope.query.page = page;

				validatePageLimits();

				scope.onRefresh();
			}

		}

		return {
			scope: {
				'onRefresh': '=?',
				'collection': '=?',
				'query': '=?',
			},

			link: init,
			replace: true,

			templateUrl: '/views/components/paginator.html'
		};
	});

})();
(function() {

	angular.module('BuscaAtivaEscolar').directive('widgetPlatformUpdates', function ($q, $http) {

		var repositories = [
			{label: 'api', name: 'lqdi/busca-ativa-escolar-api'},
			{label: 'panel', name: 'lqdi/busca-ativa-escolar-web'},
		];
		var baseURL = "https://api.github.com/repos/";

		var repositoryData = {};
		var commits = [];

		function init(scope, element, attrs) {
			repositoryData = {};
			commits = [];

			scope.commits = commits;
			refresh();
		}

		function refresh() {
			var queries = [];
			for(var i in repositories) {
				if(!repositories.hasOwnProperty(i)) continue;
				queries.push( fetchRepository(repositories[i]) );
			}

			$q.all(queries).then(parseRepositoryData)
		}

		function getCommitsURI(repo) {
			return baseURL + repo.name + '/commits';
		}

		function fetchRepository(repo) {
			//console.log("[widget.platform_updates] Getting latest commits for repository: ", repo);
			return $http.get(getCommitsURI(repo)).then(function (res) {
				if(!res.data) {
					console.error("[widget.platform_updates] Failed! ", res, repo);
					return;
				}

				console.info("[widget.platform_updates] Done! ", repo);
				repositoryData[repo.label] = res.data;
				return res.data;
			});
		}

		function parseRepositoryData() {
			//console.log("[widget.platform_updates] Parsing repository data...");

			for(var rl in repositoryData) {
				if(!repositoryData.hasOwnProperty(rl)) continue;

				for(var i in repositoryData[rl]) {
					if(!repositoryData[rl].hasOwnProperty(i)) continue;

					var c = repositoryData[rl][i];

					commits.push({
						id: c.sha,
						repo: rl,
						author: {
							name: c.commit.author.name,
							email: c.commit.author.email,
							username: c.author.login,
							avatar_url: c.author.avatar_url
						},
						date: c.commit.author.date,
						message: c.commit.message,
						url: c.html_url
					})
				}
			}
		}

		return {
			link: init,
			replace: true,
			templateUrl: '/views/components/platform_updates.html'
		};
	});

})();
(function() {

	angular.module('BuscaAtivaEscolar').directive('appPrintHeader', function (Identity, Platform, Auth) {

		function init(scope, element, attrs) {
			scope.identity = Identity;
			scope.auth = Auth;
			scope.platform = Platform;
		}

		return {
			link: init,
			replace: true,
			templateUrl: '/views/components/print_header.html'
		};
	});

})();
(function() {

	angular.module('BuscaAtivaEscolar').directive('recentActivity', function (moment, Platform, Tenants) {

		var log = [];
		var isReady = false;

		function refresh() {
			return Tenants.getRecentActivity({max: 9}, function (data) {
				log = data.data;
				isReady = true;
			});
		}

		function init(scope, element, attrs) {
			scope.getActivity = function() {
				return log;
			};

			scope.isReady = function() {
				return isReady;
			};

			scope.hasRecentActivity = function() {
				return (log && log.length > 0);
			};

			Platform.whenReady(function () {
				refresh();
			});
		}

		return {
			link: init,
			replace: true,
			templateUrl: '/views/components/activity_feed.html'
		};
	});

})();
(function () {

    angular.module('BuscaAtivaEscolar').directive('searchableCasesMap', function (moment, $timeout, uiGmapGoogleMapApi, Utils, Identity, Platform, Children, StaticData) {

        function init(scope, element, attrs) {

            scope.clustererOptions = {
                imagePath: '/images/clusterer/m'
            };

            scope.ctrl = {
                events: {
                    tilesloaded: function (map) {
                        scope.ctrl.map = map;
                    }
                }
            };

            scope.onSearch = function (givenUf, givenCity) {
                //console.log("[widget.searchable_cases_map] Searching for: ", givenUf, givenCity);

                var uf = Utils.search(StaticData.getUFs(), function (uf) {
                    return (uf.code === givenUf);
                });

                if (uf) {
                    scope.lookAt(parseFloat(uf.lat), parseFloat(uf.lng), 6);
                }

            };

            scope.refresh = function () {
                //console.log('[widget.searchable_cases_map] Loading data...');

                Children.getMap({}, function (data) {
                    scope.coordinates = data.coordinates;
                    scope.mapCenter = data.center;
                    scope.mapZoom = data.center.zoom;
                    scope.mapReady = true;

                    //console.log("[widget.searchable_cases_map] Data loaded: ", data.coordinates, data.center);
                });
            };

            scope.onMarkerClick = function (marker, event, coords) {
                //console.log('[widget.searchable_cases_map] Marker clicked: ', marker, event, coords);
            };


            scope.reloadMap = function () {
                scope.mapReady = false;
                $timeout(function () {
                    scope.mapReady = true;
                }, 10);
            };

            scope.lookAt = function (lat, lng, zoom) {
                //console.log("[widget.searchable_cases_map] Look at @ ", lat, lng, zoom, scope.ctrl);

                scope.ctrl.map.panTo({lat: lat, lng: lng});
                scope.ctrl.map.setZoom(zoom);

            };

            scope.isMapReady = function () {
                return scope.mapReady;
            };


            uiGmapGoogleMapApi.then(function (maps) {
                scope.refresh();
            });

        }

        return {
            link: init,
            replace: true,
            templateUrl: '/views/components/searchable_cases_map.html'
        };
    });

})();

(function() {

	angular.module('BuscaAtivaEscolar').directive('appSupportWidget', function (Modals) {

		function init(scope, element, attrs) {
			scope.createNewTicket = function() {
				Modals.show(Modals.NewSupportTicketModal());
			}
		}

		return {
			link: init,
			replace: true,
			templateUrl: '/views/components/support_widget.html'
		};
	});

})();
(function() {

	angular.module('BuscaAtivaEscolar').filter('digits', function () {
        return function(input) {
            if (input < 10) {
                input = '0' + input;
            }
            return input;
        }
	});

})();

(function() {

	angular
		.module('BuscaAtivaEscolar')
		.factory('AppDependencies', function() {
			return [
				["Back-end", "Laravel Framework",           "5.3",      "http://laravel.com", "MIT"],
				["Back-end", "PHP",                         "7.1",      "http://php.net", "PHP License 3.01"],
				["Back-end", "MariaDB",                     "10.0.20",  "http://mariadb.org", "GPLv2"],
				["Back-end", "memcached",                   "1.4.31",   "http://memcached.org", "BSD"],
				["Back-end", "ElasticSearch",               "",         "http://elastic.co", "Apache"],
				["Back-end", "Laravel Excel",               "",         "https://github.com/maatwebsite/laravel-excel", "LGPL"],
				["Back-end", "PHP-JWT",                     "",         "https://github.com/firebase/php-jwt", "BSD"],
				["Back-end", "JWT-Auth",                    "",         "https://github.com/tymondesigns/jwt-auth", "MIT"],
				["Back-end", "Intervention Image",          "",         "http://image.intervention.io/", "MIT"],
				["Back-end", "Laravel-UUID",                "",         "https://github.com/webpatser/laravel-uuid", "MIT"],
				["Back-end", "Barryvdh's Laravel CORS",     "",         "https://github.com/barryvdh/laravel-cors", "MIT"],
				["Back-end", "Barryvdh's Debugbar",         "",         "https://github.com/barryvdh/laravel-debugbar", "MIT"],
				["Back-end", "Barryvdh's IDE Helper",       "",         "https://github.com/barryvdh/laravel-ide-helper", "MIT"],
				["Back-end", "Fractal",                     "",         "http://fractal.thephpleague.com/transformers/", "MIT"],
				["Back-end", "Spatie/Laravel-Fractal",      "",         "https://github.com/spatie/laravel-fractal", "MIT"],
				["Back-end", "Spatie/Laravel-Sluggable",    "",         "https://github.com/spatie/laravel-sluggable", "MIT"],
				["Back-end", "Ixudra/Curl",                 "",         "https://github.com/ixudra/curl", "MIT"],
				["Back-end", "Whoops",                      "",         "https://github.com/filp/whoops", "MIT"],
				["Front-end", "AngularJS",                   "1.5.5",    "http://angularjs.org", "MIT"],
				["Front-end", "jQuery",                      "3.1.0",    "http://jquery.org", "MIT"],
				["Front-end", "Twitter Bootstrap",           "3.0.0",    "http://getbootstra.com", "MIT"],
				["Front-end", "Bootstrap Material Design",   "",         "http://fezvrasta.github.io/bootstrap-material-design/", "MIT"],
				["Front-end", "TinyMCE",                     "4.4.3",    "http://www.tinymce.com", "LGPL"],
				["Front-end", "Highcharts",                  "",         "http://highcharts.com", "Creative Commons BY-NC 3.0"],
				["Front-end", "ngFileUpload",                "",         "https://github.com/danialfarid/ng-file-upload", "MIT"],
				["Front-end", "ngToast",                     "",         "https://github.com/tameraydin/ngToast", "MIT"],
				["Front-end", "ArriveJS",                    "",         "https://github.com/uzairfarooq/arrive", "MIT"],
				["Front-end", "AngularUI",                   "",         "https://angular-ui.github.io/", "MIT"],
				["Front-end", "Angular Bootstrap Lightbox",  "",         "https://github.com/compact/angular-bootstrap-lightbox", "MIT"],
				["Aplicativo", "Apache Cordova",             "6.x",      "https://cordova.apache.org/", "Apache"],
				["Aplicativo", "Ionic Framework",            "",         "http://ionicframework.com/", "MIT"],
				["Aplicativo", "Axios HTTP Library",         "",         "https://github.com/mzabriskie/axios", "MIT"],
			];
		});

})();
Highcharts.maps["countries/br/br-all"] = {
	"title": "Brazil",
	"version": "1.1.2",
	"type": "FeatureCollection",
	"copyright": "Copyright (c) 2015 Highsoft AS, Based on data from Natural Earth",
	"copyrightShort": "Natural Earth",
	"copyrightUrl": "http://www.naturalearthdata.com",
	"crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:EPSG:29101"}},
	"hc-transform": {
		"default": {
			"crs": "+proj=poly +lat_0=0 +lon_0=-54 +x_0=5000000 +y_0=10000000 +ellps=aust_SA +towgs84=-57,1,-41,0,0,0,0 +units=m +no_defs",
			"scale": 0.000161701268187,
			"jsonres": 15.5,
			"jsonmarginX": -999,
			"jsonmarginY": 9851.0,
			"xoffset": 2791531.40873,
			"yoffset": 10585904.489
		}
	},
	"features": [{
		"type": "Feature",
		"id": "BR.SP",
		"properties": {
			"hc-group": "admin1",
			"hc-middle-x": 0.43,
			"hc-middle-y": 0.34,
			"hc-key": "br-sp",
			"hc-a2": "SP",
			"labelrank": "2",
			"hasc": "BR.SP",
			"alt-name": null,
			"woe-id": "2344868",
			"subregion": null,
			"fips": "BR32",
			"postal-code": "SP",
			"name": "São Paulo",
			"country": "Brazil",
			"type-en": "State",
			"region": null,
			"longitude": "-48.5206",
			"woe-name": "São Paulo",
			"latitude": "-22.2267",
			"woe-label": "Sao Paulo, BR, Brazil",
			"type": "Estado"
		},
		"geometry": {
			"type": "MultiPolygon",
			"coordinates": [[[[6776, 1722], [6767, 1687], [6733, 1678], [6718, 1696], [6752, 1736], [6776, 1722]]], [[[4751, 2087], [4803, 2154], [4835, 2165], [4878, 2200], [4919, 2219], [4958, 2253], [4973, 2297], [5015, 2352], [5044, 2372], [5028, 2404], [5091, 2461], [5089, 2509], [5154, 2590], [5158, 2639], [5236, 2731], [5286, 2749], [5324, 2802], [5357, 2831], [5414, 2852], [5440, 2882], [5475, 2885], [5497, 2863], [5617, 2843], [5705, 2842], [5747, 2826], [5776, 2829], [5770, 2774], [5788, 2738], [5806, 2737], [5835, 2778], [5853, 2754], [5852, 2706], [5879, 2704], [5875, 2745], [5887, 2771], [6051, 2780], [6089, 2768], [6112, 2802], [6128, 2777], [6142, 2807], [6185, 2814], [6200, 2798], [6249, 2816], [6256, 2794], [6308, 2744], [6290, 2684], [6326, 2654], [6336, 2624], [6307, 2576], [6303, 2547], [6322, 2527], [6326, 2485], [6343, 2466], [6355, 2408], [6404, 2418], [6482, 2386], [6485, 2368], [6436, 2289], [6446, 2241], [6424, 2219], [6449, 2199], [6421, 2147], [6435, 2122], [6499, 2085], [6475, 2044], [6501, 2024], [6501, 1997], [6556, 1982], [6617, 1998], [6630, 1986], [6660, 2002], [6646, 2030], [6688, 2059], [6717, 2040], [6748, 2039], [6842, 2085], [6901, 2098], [6916, 2092], [6948, 2041], [6972, 2033], [7056, 2036], [7067, 2005], [7037, 1973], [6985, 1968], [6900, 1934], [6895, 1893], [6879, 1874], [6911, 1831], [6869, 1837], [6827, 1815], [6821, 1791], [6801, 1800], [6786, 1777], [6761, 1778], [6725, 1755], [6730, 1711], [6614, 1736], [6541, 1715], [6533, 1677], [6489, 1683], [6423, 1653], [6325, 1599], [6315, 1569], [6267, 1537], [6171, 1483], [6109, 1435], [6082, 1404], [6099, 1444], [6070, 1406], [6082, 1399], [6064, 1360], [6029, 1332], [6043, 1353], [6013, 1356], [5996, 1415], [5950, 1432], [5924, 1398], [5910, 1406], [5919, 1475], [5934, 1492], [5902, 1512], [5860, 1509], [5798, 1529], [5782, 1514], [5730, 1522], [5727, 1560], [5750, 1613], [5706, 1685], [5659, 1748], [5673, 1790], [5649, 1848], [5659, 1875], [5655, 1916], [5633, 1960], [5587, 1980], [5572, 2015], [5490, 2006], [5403, 2017], [5363, 2012], [5339, 2046], [5280, 2062], [5218, 2096], [5168, 2087], [5084, 2109], [5035, 2135], [4996, 2101], [4808, 2123], [4751, 2087]]]]
		}
	}, {
		"type": "Feature",
		"id": "BR.MA",
		"properties": {
			"hc-group": "admin1",
			"hc-middle-x": 0.51,
			"hc-middle-y": 0.42,
			"hc-key": "br-ma",
			"hc-a2": "MA",
			"labelrank": "2",
			"hasc": "BR.MA",
			"alt-name": "São Luíz de Maranhão",
			"woe-id": "2344854",
			"subregion": null,
			"fips": "BR13",
			"postal-code": "MA",
			"name": "Maranhão",
			"country": "Brazil",
			"type-en": "State",
			"region": null,
			"longitude": "-45.389",
			"woe-name": "Maranhão",
			"latitude": "-5.01897",
			"woe-label": "Maranhao, BR, Brazil",
			"type": "Estado"
		},
		"geometry": {
			"type": "MultiPolygon",
			"coordinates": [[[[7179, 7589], [7184, 7554], [7156, 7523], [7171, 7612], [7179, 7589]]], [[[7924, 7599], [7924, 7523], [7878, 7467], [7818, 7411], [7751, 7399], [7739, 7407], [7689, 7337], [7692, 7312], [7672, 7274], [7600, 7186], [7610, 7143], [7634, 7112], [7609, 7067], [7608, 7034], [7635, 6989], [7647, 6925], [7639, 6882], [7577, 6803], [7562, 6796], [7567, 6674], [7597, 6636], [7629, 6617], [7625, 6552], [7608, 6500], [7590, 6479], [7529, 6477], [7456, 6454], [7397, 6495], [7296, 6479], [7234, 6413], [7220, 6384], [7180, 6374], [7106, 6305], [7077, 6316], [7019, 6281], [6943, 6264], [6894, 6232], [6874, 6178], [6863, 6099], [6817, 6021], [6792, 5947], [6762, 5923], [6746, 5884], [6766, 5813], [6768, 5772], [6794, 5734], [6782, 5714], [6773, 5583], [6746, 5534], [6747, 5495], [6709, 5527], [6638, 5539], [6605, 5586], [6596, 5627], [6552, 5659], [6590, 5712], [6584, 5728], [6531, 5754], [6511, 5783], [6507, 5822], [6481, 5850], [6443, 5860], [6492, 5916], [6500, 5986], [6526, 6026], [6606, 6035], [6595, 6058], [6618, 6127], [6611, 6156], [6589, 6173], [6506, 6160], [6466, 6137], [6429, 6190], [6376, 6246], [6335, 6304], [6332, 6352], [6295, 6345], [6269, 6377], [6297, 6386], [6333, 6428], [6341, 6514], [6364, 6575], [6374, 6643], [6360, 6680], [6364, 6745], [6346, 6781], [6350, 6824], [6331, 6854], [6280, 6879], [6248, 6882], [6241, 6911], [6204, 6924], [6161, 6918], [6110, 6944], [6065, 6939], [6034, 6899], [6002, 6892], [6000, 6897], [6260, 7101], [6301, 7098], [6322, 7114], [6357, 7172], [6378, 7190], [6404, 7244], [6467, 7310], [6479, 7378], [6501, 7434], [6535, 7453], [6579, 7518], [6586, 7574], [6605, 7586], [6580, 7617], [6647, 7681], [6652, 7757], [6683, 7774], [6707, 7843], [6707, 7877], [6680, 7898], [6711, 7913], [6712, 7967], [6744, 8044], [6778, 8085], [6768, 8046], [6794, 8054], [6831, 8029], [6846, 8065], [6864, 8026], [6858, 8000], [6895, 8027], [6899, 7986], [6916, 7999], [6910, 7961], [6960, 8011], [6964, 7986], [6944, 7970], [6956, 7893], [6983, 7911], [6990, 7955], [7021, 7972], [7059, 7961], [7083, 7984], [7071, 7948], [7101, 7904], [7179, 7864], [7184, 7812], [7131, 7746], [7148, 7745], [7186, 7779], [7213, 7765], [7223, 7733], [7214, 7707], [7182, 7718], [7181, 7689], [7147, 7625], [7132, 7537], [7149, 7526], [7104, 7485], [7104, 7470], [7143, 7492], [7202, 7554], [7221, 7666], [7304, 7708], [7310, 7664], [7285, 7632], [7229, 7600], [7271, 7607], [7267, 7576], [7290, 7607], [7306, 7601], [7320, 7641], [7345, 7666], [7389, 7671], [7376, 7692], [7396, 7703], [7412, 7745], [7434, 7747], [7427, 7718], [7476, 7663], [7488, 7690], [7476, 7723], [7516, 7721], [7683, 7659], [7754, 7604], [7807, 7602], [7814, 7581], [7857, 7590], [7896, 7579], [7876, 7606], [7851, 7598], [7811, 7608], [7814, 7624], [7850, 7600], [7855, 7624], [7924, 7599]]]]
		}
	}, {
		"type": "Feature",
		"id": "BR.PA",
		"properties": {
			"hc-group": "admin1",
			"hc-middle-x": 0.39,
			"hc-middle-y": 0.55,
			"hc-key": "br-pa",
			"hc-a2": "PA",
			"labelrank": "2",
			"hasc": "BR.PA",
			"alt-name": null,
			"woe-id": "2344857",
			"subregion": null,
			"fips": "BR16",
			"postal-code": "PA",
			"name": "Pará",
			"country": "Brazil",
			"type-en": "State",
			"region": null,
			"longitude": "-52.6491",
			"woe-name": "Pará",
			"latitude": "-4.44313",
			"woe-label": "Para, BR, Brazil",
			"type": "Estado"
		},
		"geometry": {
			"type": "MultiPolygon",
			"coordinates": [[[[6148, 8097], [6123, 8117], [6156, 8154], [6165, 8126], [6148, 8097]]], [[[5421, 8221], [5417, 8184], [5347, 8153], [5355, 8195], [5421, 8221]]], [[[5311, 8228], [5331, 8206], [5293, 8096], [5281, 8102], [5252, 8053], [5154, 7980], [5124, 7971], [5107, 7988], [5130, 8038], [5187, 8089], [5185, 8148], [5232, 8214], [5287, 8239], [5311, 8228]]], [[[5269, 8255], [5300, 8322], [5327, 8344], [5332, 8309], [5317, 8287], [5269, 8255]]], [[[5403, 8298], [5363, 8317], [5388, 8379], [5439, 8395], [5477, 8359], [5403, 8298]]], [[[5796, 8402], [5834, 8380], [5809, 8349], [5732, 8342], [5699, 8354], [5756, 8399], [5796, 8402]]], [[[5530, 8383], [5496, 8382], [5475, 8402], [5482, 8434], [5528, 8418], [5530, 8383]]], [[[5592, 8456], [5622, 8444], [5642, 8466], [5674, 8464], [5750, 8490], [5775, 8490], [5784, 8466], [5738, 8440], [5700, 8386], [5651, 8368], [5633, 8387], [5556, 8396], [5550, 8442], [5592, 8456]]], [[[5556, 8529], [5562, 8477], [5533, 8429], [5508, 8441], [5538, 8499], [5532, 8535], [5550, 8555], [5556, 8529]]], [[[5644, 8545], [5640, 8524], [5574, 8482], [5568, 8530], [5585, 8547], [5634, 8562], [5644, 8545]]], [[[5784, 7914], [5744, 7890], [5701, 7878], [5651, 7898], [5645, 7921], [5609, 7888], [5589, 7900], [5586, 7932], [5569, 7882], [5539, 7874], [5483, 7893], [5488, 7915], [5428, 7987], [5431, 8081], [5496, 8054], [5431, 8100], [5435, 8199], [5470, 8309], [5490, 8329], [5538, 8337], [5550, 8353], [5626, 8346], [5749, 8316], [5803, 8321], [5871, 8343], [5965, 8337], [5962, 8323], [6036, 8320], [6091, 8310], [6106, 8279], [6083, 8247], [6060, 8134], [6025, 8103], [6031, 8081], [5975, 8045], [5989, 8026], [5978, 7989], [5947, 8022], [5936, 8012], [5976, 7981], [5913, 7956], [5889, 7993], [5878, 7935], [5849, 7933], [5821, 7958], [5827, 7925], [5790, 7942], [5784, 7914]]], [[[6744, 8044], [6712, 7967], [6711, 7913], [6680, 7898], [6707, 7877], [6707, 7843], [6683, 7774], [6652, 7757], [6647, 7681], [6580, 7617], [6605, 7586], [6586, 7574], [6579, 7518], [6535, 7453], [6501, 7434], [6479, 7378], [6467, 7310], [6404, 7244], [6378, 7190], [6357, 7172], [6322, 7114], [6301, 7098], [6260, 7101], [6000, 6897], [6002, 6892], [6049, 6876], [6101, 6878], [6163, 6810], [6122, 6787], [6140, 6735], [6109, 6718], [6122, 6684], [6082, 6664], [6092, 6611], [6061, 6614], [6032, 6591], [6010, 6528], [5919, 6496], [5866, 6463], [5860, 6446], [5869, 6373], [5816, 6297], [5811, 6270], [5833, 6238], [5873, 6212], [5863, 6141], [5831, 6052], [5811, 6037], [5759, 5933], [5706, 5903], [5623, 5794], [5595, 5688], [5571, 5648], [5279, 5666], [4236, 5731], [3859, 5756], [3799, 5781], [3774, 5775], [3755, 5809], [3698, 5821], [3681, 5870], [3627, 5896], [3576, 5941], [3549, 5951], [3520, 6040], [3531, 6097], [3492, 6148], [3460, 6246], [3413, 6323], [3392, 6343], [3369, 6407], [3320, 6449], [3299, 6520], [3346, 6577], [3768, 7499], [3870, 7720], [3868, 7752], [3840, 7783], [3802, 7766], [3770, 7779], [3772, 7813], [3698, 7846], [3675, 7880], [3606, 7903], [3517, 7941], [3469, 7982], [3376, 8039], [3312, 8091], [3297, 8143], [3245, 8170], [3211, 8210], [3214, 8263], [3182, 8285], [3177, 8445], [3149, 8748], [3170, 8721], [3205, 8717], [3230, 8739], [3276, 8735], [3277, 8783], [3313, 8797], [3328, 8825], [3379, 8805], [3413, 8804], [3425, 8843], [3479, 8856], [3543, 8857], [3580, 8910], [3605, 8929], [3633, 8923], [3671, 8944], [3697, 8915], [3754, 8902], [3800, 8920], [3876, 8918], [3973, 8891], [4000, 8906], [4002, 8948], [3946, 9030], [3975, 9048], [3982, 9082], [4056, 9047], [4088, 9057], [4146, 9056], [4173, 9081], [4264, 9087], [4291, 9061], [4320, 9064], [4337, 9011], [4315, 8940], [4331, 8874], [4434, 8871], [4489, 8842], [4515, 8800], [4535, 8805], [4567, 8772], [4631, 8776], [4660, 8761], [4665, 8727], [4693, 8732], [4685, 8703], [4699, 8644], [4742, 8599], [4784, 8582], [4780, 8490], [4804, 8451], [4811, 8398], [4839, 8329], [4864, 8333], [4919, 8273], [4918, 8228], [4947, 8203], [4950, 8140], [4983, 8142], [4994, 8086], [5079, 8046], [5121, 8062], [5116, 8015], [5076, 7993], [5040, 8010], [4962, 7971], [4904, 7954], [4897, 7939], [4976, 7948], [5016, 7962], [5025, 7910], [5060, 7934], [5118, 7947], [5186, 7994], [5298, 8044], [5328, 8076], [5364, 8095], [5371, 8123], [5423, 8123], [5420, 8089], [5385, 8069], [5423, 8041], [5424, 7984], [5460, 7935], [5469, 7900], [5421, 7847], [5456, 7853], [5468, 7882], [5528, 7845], [5532, 7810], [5573, 7857], [5607, 7851], [5621, 7869], [5658, 7875], [5687, 7860], [5691, 7814], [5705, 7854], [5748, 7849], [5777, 7885], [5781, 7865], [5836, 7906], [5853, 7891], [5828, 7856], [5806, 7775], [5776, 7712], [5778, 7683], [5738, 7641], [5783, 7652], [5809, 7696], [5811, 7724], [5838, 7770], [5866, 7841], [5896, 7891], [5940, 7938], [5961, 7938], [5939, 7886], [5983, 7931], [6031, 7997], [6061, 7942], [6092, 7925], [6075, 7962], [6119, 7973], [6069, 7979], [6075, 8026], [6115, 8016], [6125, 8052], [6081, 8058], [6093, 8082], [6155, 8096], [6171, 8132], [6167, 8165], [6200, 8198], [6221, 8165], [6219, 8206], [6260, 8197], [6284, 8232], [6323, 8194], [6326, 8221], [6351, 8169], [6383, 8168], [6360, 8217], [6469, 8194], [6468, 8149], [6501, 8184], [6519, 8163], [6540, 8184], [6573, 8137], [6601, 8140], [6599, 8115], [6628, 8136], [6634, 8097], [6678, 8097], [6720, 8125], [6706, 8063], [6742, 8082], [6744, 8044]]]]
		}
	}, {
		"type": "Feature",
		"id": "BR.SC",
		"properties": {
			"hc-group": "admin1",
			"hc-middle-x": 0.73,
			"hc-middle-y": 0.33,
			"hc-key": "br-sc",
			"hc-a2": "SC",
			"labelrank": "2",
			"hasc": "BR.SC",
			"alt-name": "Santa Catharina",
			"woe-id": "2344867",
			"subregion": null,
			"fips": "BR26",
			"postal-code": "SC",
			"name": "Santa Catarina",
			"country": "Brazil",
			"type-en": "State",
			"region": null,
			"longitude": "-51.1586",
			"woe-name": "Santa Catarina",
			"latitude": "-27.0392",
			"woe-label": "Santa Catarina, BR, Brazil",
			"type": "Estado"
		},
		"geometry": {
			"type": "MultiPolygon",
			"coordinates": [[[[5884, 638], [5879, 659], [5895, 707], [5895, 746], [5918, 756], [5929, 736], [5918, 698], [5884, 638]]], [[[5891, 1027], [5862, 1058], [5902, 1097], [5916, 1077], [5891, 1027]]], [[[5896, 1149], [5894, 1100], [5855, 1083], [5843, 1128], [5848, 1065], [5884, 1023], [5868, 990], [5862, 945], [5887, 928], [5876, 911], [5876, 837], [5899, 831], [5905, 806], [5875, 804], [5886, 770], [5862, 733], [5878, 700], [5860, 686], [5877, 626], [5851, 529], [5817, 454], [5815, 486], [5796, 494], [5799, 458], [5817, 443], [5807, 420], [5776, 411], [5674, 338], [5621, 283], [5580, 230], [5522, 268], [5492, 255], [5497, 224], [5469, 245], [5471, 269], [5495, 297], [5511, 294], [5526, 336], [5526, 379], [5567, 425], [5590, 432], [5578, 468], [5547, 474], [5478, 467], [5465, 477], [5366, 501], [5330, 563], [5308, 572], [5304, 600], [5273, 626], [5257, 658], [5221, 674], [5166, 730], [5142, 730], [5115, 756], [5086, 744], [5056, 752], [5028, 799], [4988, 817], [4975, 803], [4938, 812], [4922, 832], [4859, 817], [4817, 848], [4791, 833], [4772, 866], [4707, 840], [4716, 861], [4693, 874], [4661, 859], [4660, 841], [4617, 852], [4576, 849], [4608, 929], [4600, 979], [4605, 1068], [4621, 1100], [4672, 1092], [4698, 1105], [4756, 1069], [4833, 1077], [4876, 1059], [4986, 1044], [5034, 1007], [5067, 1001], [5160, 1000], [5179, 972], [5226, 996], [5214, 1047], [5224, 1068], [5269, 1099], [5312, 1086], [5354, 1097], [5377, 1142], [5425, 1153], [5460, 1144], [5552, 1153], [5640, 1091], [5716, 1121], [5763, 1151], [5896, 1149]]]]
		}
	}, {
		"type": "Feature",
		"id": "BR.BA",
		"properties": {
			"hc-group": "admin1",
			"hc-middle-x": 0.56,
			"hc-middle-y": 0.35,
			"hc-key": "br-ba",
			"hc-a2": "BA",
			"labelrank": "2",
			"hasc": "BR.BA",
			"alt-name": "Ba¡a",
			"woe-id": "2344848",
			"subregion": null,
			"fips": "BR05",
			"postal-code": "BA",
			"name": "Bahia",
			"country": "Brazil",
			"type-en": "State",
			"region": null,
			"longitude": "-41.8027",
			"woe-name": "Bahia",
			"latitude": "-12.3651",
			"woe-label": "Bahia, BR, Brazil",
			"type": "Estado"
		},
		"geometry": {
			"type": "MultiPolygon",
			"coordinates": [[[[8631, 4546], [8615, 4470], [8613, 4516], [8597, 4547], [8631, 4546]]], [[[8195, 3262], [8199, 3323], [8130, 3387], [8133, 3413], [8100, 3437], [8115, 3473], [8114, 3509], [8131, 3566], [8147, 3582], [8193, 3576], [8211, 3665], [8242, 3669], [8266, 3710], [8299, 3731], [8323, 3787], [8229, 3877], [8166, 3893], [8150, 3888], [8115, 3913], [8090, 3909], [8042, 3930], [7983, 3903], [7938, 3924], [7934, 3987], [7821, 4103], [7783, 4088], [7743, 4087], [7614, 4165], [7601, 4163], [7517, 4241], [7444, 4256], [7371, 4217], [7314, 4234], [7271, 4258], [7268, 4285], [7295, 4345], [7283, 4354], [7154, 4379], [7087, 4354], [7011, 4308], [6998, 4287], [6937, 4255], [6904, 4250], [6877, 4219], [6838, 4197], [6813, 4199], [6768, 4148], [6711, 4149], [6670, 4117], [6699, 4190], [6687, 4223], [6719, 4271], [6707, 4315], [6720, 4366], [6666, 4415], [6633, 4504], [6631, 4564], [6657, 4633], [6682, 4648], [6686, 4675], [6662, 4686], [6670, 4739], [6688, 4769], [6649, 4804], [6671, 4857], [6672, 4885], [6630, 4909], [6626, 4991], [6661, 5026], [6699, 5045], [6678, 5072], [6653, 5070], [6655, 5103], [6694, 5119], [6700, 5137], [6671, 5154], [6607, 5168], [6569, 5220], [6599, 5258], [6626, 5316], [6664, 5339], [6646, 5374], [6706, 5421], [6770, 5452], [6799, 5490], [6841, 5489], [6876, 5444], [6884, 5407], [6917, 5361], [6990, 5326], [7062, 5335], [7071, 5356], [7131, 5397], [7164, 5407], [7219, 5394], [7246, 5405], [7282, 5442], [7304, 5447], [7365, 5556], [7373, 5622], [7362, 5638], [7340, 5728], [7372, 5723], [7398, 5753], [7441, 5761], [7459, 5729], [7513, 5726], [7529, 5738], [7583, 5712], [7604, 5686], [7631, 5693], [7668, 5680], [7680, 5702], [7704, 5697], [7755, 5750], [7799, 5752], [7829, 5776], [7882, 5761], [7915, 5794], [7916, 5837], [7981, 5848], [8019, 5910], [8077, 5909], [8150, 5864], [8147, 5813], [8157, 5780], [8197, 5760], [8200, 5724], [8180, 5693], [8217, 5682], [8278, 5717], [8300, 5718], [8317, 5788], [8361, 5786], [8423, 5821], [8424, 5862], [8481, 5873], [8483, 5909], [8563, 5941], [8595, 5932], [8612, 5898], [8664, 5880], [8680, 5863], [8712, 5868], [8752, 5846], [8764, 5809], [8801, 5850], [8804, 5813], [8831, 5787], [8856, 5799], [8876, 5700], [8885, 5676], [8935, 5655], [8939, 5640], [8924, 5618], [8943, 5540], [8990, 5478], [8986, 5414], [8970, 5381], [8982, 5321], [8929, 5287], [8869, 5301], [8855, 5250], [8887, 5211], [8897, 5170], [8919, 5148], [8910, 5114], [8951, 5088], [8965, 5063], [9001, 5051], [9050, 5060], [9082, 5071], [9062, 5045], [8994, 4910], [8876, 4746], [8798, 4667], [8745, 4645], [8755, 4675], [8751, 4731], [8719, 4738], [8694, 4763], [8676, 4711], [8653, 4701], [8701, 4690], [8725, 4656], [8620, 4583], [8619, 4552], [8596, 4555], [8610, 4466], [8604, 4420], [8569, 4454], [8595, 4408], [8579, 4393], [8597, 4374], [8616, 4401], [8616, 4371], [8594, 4312], [8594, 4284], [8565, 4182], [8574, 4141], [8572, 4021], [8583, 3882], [8596, 3844], [8533, 3679], [8504, 3576], [8505, 3548], [8477, 3475], [8474, 3349], [8484, 3326], [8444, 3275], [8381, 3240], [8344, 3190], [8328, 3154], [8200, 3253], [8195, 3262]]]]
		}
	}, {
		"type": "Feature",
		"id": "BR.AP",
		"properties": {
			"hc-group": "admin1",
			"hc-middle-x": 0.61,
			"hc-middle-y": 0.58,
			"hc-key": "br-ap",
			"hc-a2": "AP",
			"labelrank": "2",
			"hasc": "BR.AP",
			"alt-name": null,
			"woe-id": "2344846",
			"subregion": null,
			"fips": "BR03",
			"postal-code": "AP",
			"name": "Amapá",
			"country": "Brazil",
			"type-en": "State",
			"region": null,
			"longitude": "-51.6842",
			"woe-name": "Amapá",
			"latitude": "1.41157",
			"woe-label": "Amapa, BR, Brazil",
			"type": "Estado"
		},
		"geometry": {
			"type": "MultiPolygon",
			"coordinates": [[[[5632, 8641], [5624, 8649], [5673, 8680], [5623, 8593], [5575, 8590], [5589, 8621], [5632, 8641]]], [[[5524, 8971], [5522, 8990], [5565, 8923], [5524, 8905], [5506, 8938], [5524, 8971]]], [[[5121, 8062], [5079, 8046], [4994, 8086], [4983, 8142], [4950, 8140], [4947, 8203], [4918, 8228], [4919, 8273], [4864, 8333], [4839, 8329], [4811, 8398], [4804, 8451], [4780, 8490], [4784, 8582], [4742, 8599], [4699, 8644], [4685, 8703], [4693, 8732], [4665, 8727], [4660, 8761], [4631, 8776], [4567, 8772], [4535, 8805], [4515, 8800], [4489, 8842], [4434, 8871], [4331, 8874], [4315, 8940], [4337, 9011], [4320, 9064], [4340, 9061], [4340, 9027], [4379, 9024], [4403, 8996], [4499, 8968], [4583, 9023], [4667, 9005], [4719, 9034], [4750, 9007], [4826, 8986], [4849, 9009], [4897, 9037], [4940, 9096], [4934, 9114], [4995, 9231], [4993, 9251], [5030, 9287], [5090, 9386], [5096, 9410], [5139, 9455], [5153, 9487], [5195, 9511], [5205, 9552], [5233, 9521], [5215, 9591], [5227, 9615], [5263, 9592], [5309, 9538], [5321, 9500], [5323, 9395], [5339, 9467], [5349, 9460], [5346, 9320], [5388, 9166], [5399, 9158], [5444, 9043], [5462, 8985], [5522, 8887], [5601, 8888], [5651, 8869], [5677, 8845], [5687, 8760], [5676, 8736], [5614, 8714], [5674, 8721], [5683, 8706], [5605, 8637], [5565, 8610], [5522, 8562], [5482, 8486], [5432, 8430], [5393, 8426], [5354, 8377], [5285, 8357], [5303, 8347], [5283, 8323], [5249, 8252], [5179, 8175], [5171, 8094], [5121, 8062]]]]
		}
	}, {
		"type": "Feature",
		"id": "BR.MS",
		"properties": {
			"hc-group": "admin1",
			"hc-middle-x": 0.46,
			"hc-middle-y": 0.47,
			"hc-key": "br-ms",
			"hc-a2": "MS",
			"labelrank": "2",
			"hasc": "BR.MS",
			"alt-name": null,
			"woe-id": "2344853",
			"subregion": null,
			"fips": "BR11",
			"postal-code": "MS",
			"name": "Mato Grosso do Sul",
			"country": "Brazil",
			"type-en": "State",
			"region": null,
			"longitude": "-54.5502",
			"woe-name": "Mato Grosso do Sul",
			"latitude": "-20.6756",
			"woe-label": "Mato Grosso do Sul, BR, Brazil",
			"type": "Estado"
		},
		"geometry": {
			"type": "Polygon",
			"coordinates": [[[4517, 1742], [4474, 1713], [4428, 1751], [4373, 1781], [4296, 1735], [4230, 1721], [4180, 1732], [4167, 1799], [4145, 1835], [4148, 1898], [4143, 1939], [4116, 2003], [4109, 2053], [4116, 2106], [4087, 2131], [4082, 2171], [4052, 2192], [3969, 2201], [3938, 2220], [3910, 2257], [3887, 2252], [3848, 2204], [3835, 2217], [3802, 2195], [3706, 2222], [3662, 2214], [3602, 2222], [3591, 2242], [3543, 2230], [3505, 2259], [3520, 2296], [3512, 2311], [3526, 2356], [3514, 2374], [3515, 2422], [3534, 2456], [3533, 2538], [3541, 2561], [3516, 2574], [3530, 2590], [3508, 2605], [3529, 2620], [3497, 2633], [3493, 2705], [3468, 2720], [3447, 2778], [3524, 2831], [3453, 2899], [3537, 3088], [3556, 3092], [3538, 3129], [3595, 3332], [3545, 3425], [3546, 3456], [3579, 3434], [3628, 3422], [3704, 3445], [3744, 3481], [3747, 3504], [3777, 3530], [3802, 3576], [3916, 3587], [3937, 3606], [3976, 3615], [4060, 3570], [4108, 3559], [4128, 3529], [4222, 3479], [4297, 3489], [4351, 3526], [4396, 3527], [4424, 3509], [4432, 3483], [4498, 3496], [4549, 3543], [4584, 3585], [4621, 3599], [4603, 3492], [4574, 3479], [4539, 3420], [4609, 3390], [4720, 3393], [4787, 3387], [4786, 3311], [4804, 3284], [4825, 3296], [4859, 3283], [4829, 3215], [4835, 3203], [4902, 3191], [4934, 3195], [4974, 3164], [4993, 3165], [5049, 3128], [5158, 3075], [5220, 3063], [5245, 3039], [5290, 3030], [5336, 2977], [5317, 2899], [5324, 2802], [5286, 2749], [5236, 2731], [5158, 2639], [5154, 2590], [5089, 2509], [5091, 2461], [5028, 2404], [5044, 2372], [5015, 2352], [4973, 2297], [4958, 2253], [4919, 2219], [4878, 2200], [4835, 2165], [4803, 2154], [4751, 2087], [4670, 2052], [4640, 2027], [4628, 1976], [4607, 1923], [4550, 1887], [4519, 1778], [4517, 1742]]]
		}
	}, {
		"type": "Feature",
		"id": "BR.MG",
		"properties": {
			"hc-group": "admin1",
			"hc-middle-x": 0.60,
			"hc-middle-y": 0.45,
			"hc-key": "br-mg",
			"hc-a2": "MG",
			"labelrank": "2",
			"hasc": "BR.MG",
			"alt-name": "Minas|Minas Geraes",
			"woe-id": "2344856",
			"subregion": null,
			"fips": "BR15",
			"postal-code": "MG",
			"name": "Minas Gerais",
			"country": "Brazil",
			"type-en": "State",
			"region": null,
			"longitude": "-44.4808",
			"woe-name": "Minas Gerais",
			"latitude": "-18.5895",
			"woe-label": "Minas Gerais, BR, Brazil",
			"type": "Estado"
		},
		"geometry": {
			"type": "Polygon",
			"coordinates": [[[5324, 2802], [5317, 2899], [5336, 2977], [5361, 2973], [5368, 3026], [5419, 3076], [5447, 3076], [5460, 3125], [5508, 3184], [5596, 3210], [5648, 3207], [5730, 3239], [5763, 3203], [5825, 3262], [5874, 3283], [6068, 3268], [6091, 3254], [6151, 3241], [6218, 3274], [6246, 3305], [6320, 3343], [6303, 3394], [6326, 3452], [6322, 3486], [6258, 3515], [6268, 3549], [6364, 3644], [6336, 3733], [6288, 3782], [6318, 3835], [6332, 3907], [6332, 3907], [6332, 3907], [6333, 3907], [6332, 3907], [6352, 3909], [6380, 3939], [6394, 3934], [6460, 3958], [6453, 4029], [6436, 4074], [6459, 4103], [6440, 4130], [6452, 4180], [6494, 4187], [6520, 4172], [6544, 4180], [6538, 4248], [6556, 4271], [6590, 4253], [6613, 4214], [6672, 4208], [6687, 4223], [6699, 4190], [6670, 4117], [6711, 4149], [6768, 4148], [6813, 4199], [6838, 4197], [6877, 4219], [6904, 4250], [6937, 4255], [6998, 4287], [7011, 4308], [7087, 4354], [7154, 4379], [7283, 4354], [7295, 4345], [7268, 4285], [7271, 4258], [7314, 4234], [7371, 4217], [7444, 4256], [7517, 4241], [7601, 4163], [7614, 4165], [7743, 4087], [7783, 4088], [7821, 4103], [7934, 3987], [7938, 3924], [7983, 3903], [8042, 3930], [8090, 3909], [8115, 3913], [8150, 3888], [8166, 3893], [8229, 3877], [8323, 3787], [8299, 3731], [8266, 3710], [8242, 3669], [8211, 3665], [8193, 3576], [8147, 3582], [8131, 3566], [8114, 3509], [8115, 3473], [8100, 3437], [8133, 3413], [8130, 3387], [8199, 3323], [8195, 3262], [8138, 3291], [8073, 3278], [8008, 3278], [8041, 3241], [8005, 3241], [7965, 3222], [7941, 3190], [7975, 3143], [7964, 3091], [7990, 3074], [7986, 3042], [7905, 3034], [7939, 3022], [7950, 2980], [7976, 2946], [7977, 2903], [7965, 2854], [7909, 2805], [7897, 2747], [7864, 2725], [7843, 2660], [7832, 2653], [7751, 2661], [7712, 2618], [7726, 2601], [7717, 2539], [7700, 2503], [7672, 2468], [7637, 2467], [7596, 2352], [7575, 2334], [7551, 2271], [7573, 2247], [7371, 2174], [7292, 2186], [7260, 2173], [7170, 2177], [7095, 2151], [7062, 2132], [7004, 2134], [6945, 2106], [6901, 2098], [6842, 2085], [6748, 2039], [6717, 2040], [6688, 2059], [6646, 2030], [6660, 2002], [6630, 1986], [6617, 1998], [6556, 1982], [6501, 1997], [6501, 2024], [6475, 2044], [6499, 2085], [6435, 2122], [6421, 2147], [6449, 2199], [6424, 2219], [6446, 2241], [6436, 2289], [6485, 2368], [6482, 2386], [6404, 2418], [6355, 2408], [6343, 2466], [6326, 2485], [6322, 2527], [6303, 2547], [6307, 2576], [6336, 2624], [6326, 2654], [6290, 2684], [6308, 2744], [6256, 2794], [6249, 2816], [6200, 2798], [6185, 2814], [6142, 2807], [6128, 2777], [6112, 2802], [6089, 2768], [6051, 2780], [5887, 2771], [5875, 2745], [5879, 2704], [5852, 2706], [5853, 2754], [5835, 2778], [5806, 2737], [5788, 2738], [5770, 2774], [5776, 2829], [5747, 2826], [5705, 2842], [5617, 2843], [5497, 2863], [5475, 2885], [5440, 2882], [5414, 2852], [5357, 2831], [5324, 2802]]]
		}
	}, {
		"type": "Feature",
		"id": "BR.GO",
		"properties": {
			"hc-group": "admin1",
			"hc-middle-x": 0.51,
			"hc-middle-y": 0.54,
			"hc-key": "br-go",
			"hc-a2": "GO",
			"labelrank": "2",
			"hasc": "BR.GO",
			"alt-name": "Goiáz|Goyáz",
			"woe-id": "2344852",
			"subregion": null,
			"fips": "BR29",
			"postal-code": "GO",
			"name": "Goiás",
			"country": "Brazil",
			"type-en": "State",
			"region": null,
			"longitude": "-49.5786",
			"woe-name": "Goiás",
			"latitude": "-15.863",
			"woe-label": "Goias, BR, Brazil",
			"type": "Estado"
		},
		"geometry": {
			"type": "Polygon",
			"coordinates": [[[6318, 3835], [6288, 3782], [6336, 3733], [6364, 3644], [6268, 3549], [6258, 3515], [6322, 3486], [6326, 3452], [6303, 3394], [6320, 3343], [6246, 3305], [6218, 3274], [6151, 3241], [6091, 3254], [6068, 3268], [5874, 3283], [5825, 3262], [5763, 3203], [5730, 3239], [5648, 3207], [5596, 3210], [5508, 3184], [5460, 3125], [5447, 3076], [5419, 3076], [5368, 3026], [5361, 2973], [5336, 2977], [5290, 3030], [5245, 3039], [5220, 3063], [5158, 3075], [5049, 3128], [4993, 3165], [4974, 3164], [4934, 3195], [4902, 3191], [4835, 3203], [4829, 3215], [4859, 3283], [4825, 3296], [4804, 3284], [4786, 3311], [4787, 3387], [4738, 3513], [4749, 3591], [4791, 3653], [4798, 3706], [4855, 3740], [4902, 3799], [4907, 3828], [4893, 3865], [4929, 3883], [4928, 3899], [4985, 3935], [5006, 3969], [5105, 3999], [5161, 4116], [5167, 4163], [5206, 4203], [5259, 4232], [5298, 4226], [5318, 4251], [5355, 4353], [5348, 4386], [5369, 4463], [5387, 4468], [5387, 4576], [5405, 4586], [5416, 4623], [5442, 4656], [5468, 4709], [5464, 4751], [5489, 4786], [5493, 4816], [5504, 4856], [5530, 4899], [5586, 4938], [5589, 4916], [5550, 4831], [5559, 4790], [5709, 4720], [5790, 4699], [5815, 4767], [5860, 4840], [5893, 4862], [5898, 4836], [5944, 4800], [5958, 4738], [5955, 4667], [5980, 4670], [5988, 4714], [6067, 4710], [6129, 4740], [6121, 4711], [6252, 4659], [6242, 4716], [6265, 4726], [6291, 4674], [6414, 4727], [6486, 4732], [6536, 4771], [6649, 4804], [6688, 4769], [6670, 4739], [6662, 4686], [6686, 4675], [6682, 4648], [6657, 4633], [6631, 4564], [6633, 4504], [6666, 4415], [6720, 4366], [6707, 4315], [6719, 4271], [6687, 4223], [6672, 4208], [6613, 4214], [6590, 4253], [6556, 4271], [6538, 4248], [6544, 4180], [6520, 4172], [6494, 4187], [6452, 4180], [6440, 4130], [6459, 4103], [6436, 4074], [6453, 4029], [6460, 3958], [6394, 3934], [6380, 3939], [6352, 3909], [6332, 3907], [6318, 3923], [6335, 4033], [6305, 4059], [6102, 4067], [6084, 4011], [6093, 3999], [6072, 3971], [6097, 3914], [6332, 3907], [6332, 3907], [6332, 3907], [6318, 3835]]]
		}
	}, {
		"type": "Feature",
		"id": "BR.RS",
		"properties": {
			"hc-group": "admin1",
			"hc-middle-x": 0.52,
			"hc-middle-y": 0.36,
			"hc-key": "br-rs",
			"hc-a2": "RS",
			"labelrank": "2",
			"hasc": "BR.RS",
			"alt-name": null,
			"woe-id": "2344864",
			"subregion": null,
			"fips": "BR23",
			"postal-code": "RS",
			"name": "Rio Grande do Sul",
			"country": "Brazil",
			"type-en": "State",
			"region": null,
			"longitude": "-53.656",
			"woe-name": "Rio Grande do Sul",
			"latitude": "-29.7277",
			"woe-label": "Rio Grande do Sul, BR, Brazil",
			"type": "Estado"
		},
		"geometry": {
			"type": "Polygon",
			"coordinates": [[[5580, 230], [5555, 198], [5494, 96], [5423, -82], [5321, -241], [5215, -359], [5115, -439], [5043, -481], [4989, -539], [5007, -485], [4990, -459], [4999, -445], [5029, -463], [5081, -443], [5152, -368], [5193, -354], [5209, -325], [5217, -244], [5252, -246], [5265, -205], [5320, -170], [5334, -129], [5334, -49], [5353, -86], [5371, -41], [5356, -5], [5339, -31], [5284, -35], [5279, -70], [5251, -53], [5256, -26], [5204, 4], [5193, 51], [5181, -9], [5214, -47], [5187, -120], [5165, -129], [5169, -191], [5146, -193], [5138, -227], [5148, -246], [5104, -260], [5100, -294], [5032, -307], [5013, -340], [5010, -401], [5003, -379], [4989, -413], [4963, -422], [4955, -465], [4975, -473], [4954, -489], [4959, -522], [4991, -508], [4988, -545], [4949, -576], [4919, -636], [4895, -720], [4859, -803], [4812, -864], [4707, -961], [4681, -979], [4643, -953], [4666, -918], [4662, -838], [4695, -790], [4710, -800], [4733, -762], [4742, -718], [4772, -725], [4799, -752], [4833, -735], [4868, -658], [4868, -634], [4841, -588], [4854, -546], [4837, -551], [4813, -593], [4825, -603], [4775, -634], [4771, -657], [4731, -679], [4674, -652], [4619, -589], [4614, -558], [4590, -508], [4520, -461], [4504, -469], [4426, -404], [4421, -379], [4395, -348], [4341, -338], [4291, -293], [4277, -309], [4235, -282], [4212, -234], [4155, -177], [4090, -242], [4055, -244], [4054, -165], [3999, -101], [3965, -80], [3901, -15], [3852, 24], [3793, 22], [3762, -30], [3684, -28], [3665, -3], [3690, 8], [3732, 55], [3739, 101], [3786, 120], [3885, 244], [3898, 287], [3947, 319], [3952, 346], [3974, 366], [3977, 395], [4002, 405], [4041, 450], [4043, 475], [4070, 485], [4084, 517], [4117, 501], [4127, 523], [4100, 549], [4141, 582], [4181, 593], [4212, 639], [4246, 656], [4283, 660], [4269, 677], [4311, 689], [4314, 720], [4404, 759], [4450, 785], [4465, 775], [4492, 827], [4514, 815], [4545, 852], [4576, 849], [4617, 852], [4660, 841], [4661, 859], [4693, 874], [4716, 861], [4707, 840], [4772, 866], [4791, 833], [4817, 848], [4859, 817], [4922, 832], [4938, 812], [4975, 803], [4988, 817], [5028, 799], [5056, 752], [5086, 744], [5115, 756], [5142, 730], [5166, 730], [5221, 674], [5257, 658], [5273, 626], [5304, 600], [5308, 572], [5330, 563], [5366, 501], [5465, 477], [5478, 467], [5547, 474], [5578, 468], [5590, 432], [5567, 425], [5526, 379], [5526, 336], [5511, 294], [5495, 297], [5471, 269], [5469, 245], [5497, 224], [5492, 255], [5522, 268], [5580, 230]]]
		}
	}, {
		"type": "Feature",
		"id": "BR.TO",
		"properties": {
			"hc-group": "admin1",
			"hc-middle-x": 0.47,
			"hc-middle-y": 0.58,
			"hc-key": "br-to",
			"hc-a2": "TO",
			"labelrank": "2",
			"hasc": "BR.TO",
			"alt-name": null,
			"woe-id": "2344870",
			"subregion": null,
			"fips": "BR31",
			"postal-code": "TO",
			"name": "Tocantins",
			"country": "Brazil",
			"type-en": "State",
			"region": null,
			"longitude": "-48.2502",
			"woe-name": "Tocantins",
			"latitude": "-10.223",
			"woe-label": "Tocantins, BR, Brazil",
			"type": "Estado"
		},
		"geometry": {
			"type": "Polygon",
			"coordinates": [[[6747, 5495], [6780, 5490], [6799, 5490], [6770, 5452], [6706, 5421], [6646, 5374], [6664, 5339], [6626, 5316], [6599, 5258], [6569, 5220], [6607, 5168], [6671, 5154], [6700, 5137], [6694, 5119], [6655, 5103], [6653, 5070], [6678, 5072], [6699, 5045], [6661, 5026], [6626, 4991], [6630, 4909], [6672, 4885], [6671, 4857], [6649, 4804], [6536, 4771], [6486, 4732], [6414, 4727], [6291, 4674], [6265, 4726], [6242, 4716], [6252, 4659], [6121, 4711], [6129, 4740], [6067, 4710], [5988, 4714], [5980, 4670], [5955, 4667], [5958, 4738], [5944, 4800], [5898, 4836], [5893, 4862], [5860, 4840], [5815, 4767], [5790, 4699], [5709, 4720], [5559, 4790], [5550, 4831], [5589, 4916], [5586, 4938], [5530, 4899], [5504, 4856], [5493, 4816], [5463, 4826], [5444, 4876], [5460, 4931], [5444, 4998], [5442, 5051], [5451, 5085], [5436, 5131], [5452, 5160], [5427, 5190], [5464, 5320], [5458, 5346], [5469, 5424], [5491, 5451], [5517, 5511], [5531, 5576], [5552, 5599], [5571, 5648], [5595, 5688], [5623, 5794], [5706, 5903], [5759, 5933], [5811, 6037], [5831, 6052], [5863, 6141], [5873, 6212], [5833, 6238], [5811, 6270], [5816, 6297], [5869, 6373], [5860, 6446], [5866, 6463], [5919, 6496], [6010, 6528], [6032, 6591], [6061, 6614], [6092, 6611], [6082, 6664], [6122, 6684], [6109, 6718], [6140, 6735], [6122, 6787], [6163, 6810], [6101, 6878], [6049, 6876], [6002, 6892], [6034, 6899], [6065, 6939], [6110, 6944], [6161, 6918], [6204, 6924], [6241, 6911], [6248, 6882], [6280, 6879], [6331, 6854], [6350, 6824], [6346, 6781], [6364, 6745], [6360, 6680], [6374, 6643], [6364, 6575], [6341, 6514], [6333, 6428], [6297, 6386], [6269, 6377], [6295, 6345], [6332, 6352], [6335, 6304], [6376, 6246], [6429, 6190], [6466, 6137], [6506, 6160], [6589, 6173], [6611, 6156], [6618, 6127], [6595, 6058], [6606, 6035], [6526, 6026], [6500, 5986], [6492, 5916], [6443, 5860], [6481, 5850], [6507, 5822], [6511, 5783], [6531, 5754], [6584, 5728], [6590, 5712], [6552, 5659], [6596, 5627], [6605, 5586], [6638, 5539], [6709, 5527], [6747, 5495]]]
		}
	}, {
		"type": "Feature",
		"id": "BR.PI",
		"properties": {
			"hc-group": "admin1",
			"hc-middle-x": 0.51,
			"hc-middle-y": 0.66,
			"hc-key": "br-pi",
			"hc-a2": "PI",
			"labelrank": "2",
			"hasc": "BR.PI",
			"alt-name": "Piauhy",
			"woe-id": "2344861",
			"subregion": null,
			"fips": "BR20",
			"postal-code": "PI",
			"name": "Piauí",
			"country": "Brazil",
			"type-en": "State",
			"region": null,
			"longitude": "-43.1974",
			"woe-name": "Piauí",
			"latitude": "-8.086980000000001",
			"woe-label": "Piaui, BR, Brazil",
			"type": "Estado"
		},
		"geometry": {
			"type": "Polygon",
			"coordinates": [[[6799, 5490], [6780, 5490], [6747, 5495], [6746, 5534], [6773, 5583], [6782, 5714], [6794, 5734], [6768, 5772], [6766, 5813], [6746, 5884], [6762, 5923], [6792, 5947], [6817, 6021], [6863, 6099], [6874, 6178], [6894, 6232], [6943, 6264], [7019, 6281], [7077, 6316], [7106, 6305], [7180, 6374], [7220, 6384], [7234, 6413], [7296, 6479], [7397, 6495], [7456, 6454], [7529, 6477], [7590, 6479], [7608, 6500], [7625, 6552], [7629, 6617], [7597, 6636], [7567, 6674], [7562, 6796], [7577, 6803], [7639, 6882], [7647, 6925], [7635, 6989], [7608, 7034], [7609, 7067], [7634, 7112], [7610, 7143], [7600, 7186], [7672, 7274], [7692, 7312], [7689, 7337], [7739, 7407], [7751, 7399], [7818, 7411], [7878, 7467], [7924, 7523], [7924, 7599], [7934, 7605], [7971, 7566], [8063, 7553], [8089, 7527], [8087, 7509], [8039, 7440], [8032, 7407], [8057, 7330], [8076, 7301], [8090, 7234], [8120, 7196], [8133, 7153], [8086, 7094], [8098, 6986], [8132, 6914], [8128, 6874], [8161, 6842], [8174, 6673], [8196, 6603], [8203, 6535], [8219, 6487], [8283, 6464], [8299, 6442], [8251, 6334], [8261, 6278], [8218, 6268], [8236, 6208], [8224, 6174], [8255, 6152], [8253, 6096], [8240, 6070], [8195, 6037], [8145, 5985], [8119, 5989], [8064, 5930], [8019, 5910], [7981, 5848], [7916, 5837], [7915, 5794], [7882, 5761], [7829, 5776], [7799, 5752], [7755, 5750], [7704, 5697], [7680, 5702], [7668, 5680], [7631, 5693], [7604, 5686], [7583, 5712], [7529, 5738], [7513, 5726], [7459, 5729], [7441, 5761], [7398, 5753], [7372, 5723], [7340, 5728], [7362, 5638], [7373, 5622], [7365, 5556], [7304, 5447], [7282, 5442], [7246, 5405], [7219, 5394], [7164, 5407], [7131, 5397], [7071, 5356], [7062, 5335], [6990, 5326], [6917, 5361], [6884, 5407], [6876, 5444], [6841, 5489], [6799, 5490]]]
		}
	}, {
		"type": "Feature",
		"id": "BR.AL",
		"properties": {
			"hc-group": "admin1",
			"hc-middle-x": 0.62,
			"hc-middle-y": 0.61,
			"hc-key": "br-al",
			"hc-a2": "AL",
			"labelrank": "2",
			"hasc": "BR.AL",
			"alt-name": null,
			"woe-id": "2344845",
			"subregion": null,
			"fips": "BR02",
			"postal-code": "AL",
			"name": "Alagoas",
			"country": "Brazil",
			"type-en": "State",
			"region": null,
			"longitude": "-36.6917",
			"woe-name": "Alagoas",
			"latitude": "-9.773910000000001",
			"woe-label": "Alagoas, BR, Brazil",
			"type": "Estado"
		},
		"geometry": {
			"type": "Polygon",
			"coordinates": [[[9731, 5780], [9683, 5700], [9638, 5658], [9569, 5567], [9542, 5594], [9538, 5551], [9469, 5458], [9407, 5408], [9361, 5337], [9347, 5365], [9319, 5366], [9306, 5412], [9288, 5407], [9251, 5426], [9222, 5460], [9221, 5486], [9148, 5523], [9127, 5551], [9054, 5577], [8939, 5640], [8935, 5655], [8885, 5676], [8876, 5700], [8917, 5740], [8951, 5750], [8996, 5796], [9015, 5829], [9032, 5794], [9078, 5802], [9167, 5712], [9232, 5676], [9263, 5701], [9332, 5689], [9397, 5713], [9461, 5764], [9493, 5797], [9552, 5801], [9573, 5786], [9643, 5807], [9664, 5792], [9731, 5780]]]
		}
	}, {
		"type": "Feature",
		"id": "BR.PB",
		"properties": {
			"hc-group": "admin1",
			"hc-middle-x": 0.73,
			"hc-middle-y": 0.46,
			"hc-key": "br-pb",
			"hc-a2": "PB",
			"labelrank": "2",
			"hasc": "BR.PB",
			"alt-name": "Parahyba",
			"woe-id": "2344858",
			"subregion": null,
			"fips": "BR17",
			"postal-code": "PB",
			"name": "Paraíba",
			"country": "Brazil",
			"type-en": "State",
			"region": null,
			"longitude": "-36.2726",
			"woe-name": "Paraíba",
			"latitude": "-7.34234",
			"woe-label": "Paraiba, BR, Brazil",
			"type": "Estado"
		},
		"geometry": {
			"type": "Polygon",
			"coordinates": [[[9813, 6481], [9809, 6448], [9825, 6368], [9837, 6360], [9819, 6297], [9842, 6337], [9851, 6288], [9841, 6176], [9820, 6176], [9774, 6218], [9718, 6228], [9688, 6207], [9654, 6209], [9635, 6152], [9551, 6125], [9547, 6111], [9393, 6112], [9386, 6088], [9352, 6085], [9326, 6061], [9334, 6040], [9290, 6002], [9239, 5986], [9195, 6022], [9191, 6076], [9138, 6072], [9189, 6139], [9183, 6194], [9234, 6211], [9234, 6241], [9170, 6282], [9119, 6262], [9086, 6225], [9042, 6206], [8965, 6145], [8917, 6147], [8887, 6125], [8862, 6169], [8814, 6152], [8768, 6196], [8817, 6288], [8778, 6328], [8766, 6405], [8798, 6442], [8790, 6461], [8827, 6550], [8893, 6512], [8935, 6506], [8956, 6527], [9016, 6555], [9041, 6602], [9180, 6642], [9203, 6614], [9140, 6537], [9129, 6501], [9107, 6491], [9104, 6455], [9153, 6448], [9184, 6410], [9250, 6442], [9304, 6422], [9307, 6375], [9323, 6361], [9362, 6374], [9384, 6415], [9376, 6458], [9401, 6461], [9383, 6503], [9390, 6533], [9421, 6553], [9446, 6552], [9456, 6520], [9546, 6502], [9618, 6511], [9674, 6497], [9717, 6477], [9789, 6472], [9813, 6481]]]
		}
	}, {
		"type": "Feature",
		"id": "BR.CE",
		"properties": {
			"hc-group": "admin1",
			"hc-middle-x": 0.42,
			"hc-middle-y": 0.43,
			"hc-key": "br-ce",
			"hc-a2": "CE",
			"labelrank": "2",
			"hasc": "BR.CE",
			"alt-name": null,
			"woe-id": "2344849",
			"subregion": null,
			"fips": "BR06",
			"postal-code": "CE",
			"name": "Ceará",
			"country": "Brazil",
			"type-en": "State",
			"region": null,
			"longitude": "-39.3429",
			"woe-name": "Ceará",
			"latitude": "-5.37602",
			"woe-label": "Ceara, BR, Brazil",
			"type": "Estado"
		},
		"geometry": {
			"type": "Polygon",
			"coordinates": [[[8827, 6550], [8790, 6461], [8798, 6442], [8766, 6405], [8778, 6328], [8817, 6288], [8768, 6196], [8734, 6184], [8690, 6133], [8661, 6132], [8652, 6162], [8615, 6184], [8588, 6223], [8537, 6245], [8505, 6275], [8452, 6284], [8392, 6269], [8261, 6278], [8251, 6334], [8299, 6442], [8283, 6464], [8219, 6487], [8203, 6535], [8196, 6603], [8174, 6673], [8161, 6842], [8128, 6874], [8132, 6914], [8098, 6986], [8086, 7094], [8133, 7153], [8120, 7196], [8090, 7234], [8076, 7301], [8057, 7330], [8032, 7407], [8039, 7440], [8087, 7509], [8089, 7527], [8083, 7565], [8120, 7563], [8276, 7577], [8299, 7589], [8442, 7569], [8519, 7514], [8543, 7514], [8580, 7483], [8615, 7471], [8692, 7415], [8718, 7409], [8737, 7377], [8767, 7365], [8807, 7327], [8858, 7320], [8885, 7270], [8920, 7243], [8959, 7186], [9028, 7122], [9051, 7115], [9067, 7080], [9095, 7053], [9173, 7026], [9197, 6987], [9111, 6960], [9060, 6923], [9003, 6809], [8965, 6766], [8941, 6691], [8892, 6636], [8860, 6641], [8812, 6584], [8804, 6546], [8827, 6550]]]
		}
	}, {
		"type": "Feature",
		"id": "BR.SE",
		"properties": {
			"hc-group": "admin1",
			"hc-middle-x": 0.60,
			"hc-middle-y": 0.73,
			"hc-key": "br-se",
			"hc-a2": "SE",
			"labelrank": "2",
			"hasc": "BR.SE",
			"alt-name": null,
			"woe-id": "2344869",
			"subregion": null,
			"fips": "BR28",
			"postal-code": "SE",
			"name": "Sergipe",
			"country": "Brazil",
			"type-en": "State",
			"region": null,
			"longitude": "-37.3836",
			"woe-name": "Sergipe",
			"latitude": "-10.5918",
			"woe-label": "Sergipe, BR, Brazil",
			"type": "Estado"
		},
		"geometry": {
			"type": "Polygon",
			"coordinates": [[[9361, 5337], [9314, 5325], [9221, 5266], [9180, 5217], [9145, 5150], [9114, 5126], [9097, 5090], [9066, 5092], [9050, 5060], [9001, 5051], [8965, 5063], [8951, 5088], [8910, 5114], [8919, 5148], [8897, 5170], [8887, 5211], [8855, 5250], [8869, 5301], [8929, 5287], [8982, 5321], [8970, 5381], [8986, 5414], [8990, 5478], [8943, 5540], [8924, 5618], [8939, 5640], [9054, 5577], [9127, 5551], [9148, 5523], [9221, 5486], [9222, 5460], [9251, 5426], [9288, 5407], [9306, 5412], [9319, 5366], [9347, 5365], [9361, 5337]]]
		}
	}, {
		"type": "Feature",
		"id": "BR.RR",
		"properties": {
			"hc-group": "admin1",
			"hc-middle-x": 0.59,
			"hc-middle-y": 0.51,
			"hc-key": "br-rr",
			"hc-a2": "RR",
			"labelrank": "2",
			"hasc": "BR.RR",
			"alt-name": "Rio Branco",
			"woe-id": "2344866",
			"subregion": null,
			"fips": "BR25",
			"postal-code": "RR",
			"name": "Roraima",
			"country": "Brazil",
			"type-en": "State",
			"region": null,
			"longitude": "-61.3325",
			"woe-name": "Roraima",
			"latitude": "1.93803",
			"woe-label": "Roraima, BR, Brazil",
			"type": "Estado"
		},
		"geometry": {
			"type": "Polygon",
			"coordinates": [[[1919, 9011], [1920, 9063], [1796, 9066], [1736, 9078], [1750, 9144], [1720, 9212], [1688, 9262], [1683, 9345], [1695, 9395], [1662, 9432], [1605, 9469], [1569, 9510], [1528, 9582], [1547, 9592], [1589, 9544], [1652, 9552], [1719, 9533], [1735, 9483], [1754, 9475], [1788, 9494], [1858, 9489], [1889, 9466], [1913, 9497], [1952, 9484], [2031, 9392], [2049, 9382], [2087, 9391], [2100, 9409], [2090, 9476], [2097, 9510], [2154, 9514], [2161, 9539], [2203, 9552], [2256, 9529], [2300, 9547], [2329, 9543], [2389, 9572], [2431, 9570], [2462, 9618], [2508, 9625], [2507, 9647], [2547, 9637], [2586, 9644], [2617, 9695], [2656, 9710], [2698, 9750], [2702, 9777], [2682, 9837], [2742, 9826], [2810, 9851], [2874, 9800], [2859, 9700], [2826, 9641], [2883, 9638], [2954, 9603], [2943, 9546], [2997, 9477], [2955, 9414], [2911, 9388], [2915, 9320], [2876, 9237], [2864, 9133], [2890, 9068], [2891, 9040], [2936, 9013], [2933, 8898], [2962, 8895], [2952, 8874], [2982, 8864], [3074, 8766], [3149, 8748], [3177, 8445], [2927, 8447], [2855, 8445], [2827, 8419], [2776, 8317], [2753, 8238], [2774, 8210], [2768, 8186], [2732, 8176], [2719, 8151], [2657, 8146], [2635, 8191], [2603, 8228], [2553, 8245], [2455, 8204], [2435, 8179], [2422, 8118], [2427, 8097], [2411, 8026], [2416, 7986], [2372, 8002], [2339, 8000], [2297, 8062], [2247, 8090], [2187, 8151], [2163, 8166], [2171, 8188], [2199, 8182], [2217, 8203], [2201, 8252], [2201, 8287], [2171, 8320], [2143, 8387], [2158, 8409], [2146, 8432], [2156, 8503], [2169, 8534], [2155, 8588], [2180, 8608], [2131, 8779], [2086, 8832], [2106, 8870], [2108, 8929], [2069, 8949], [2026, 8950], [1986, 8994], [1942, 8990], [1919, 9011]]]
		}
	}, {
		"type": "Feature",
		"id": "BR.PE",
		"properties": {
			"hc-group": "admin1",
			"hc-middle-x": 0.55,
			"hc-middle-y": 0.52,
			"hc-key": "br-pe",
			"hc-a2": "PE",
			"labelrank": "2",
			"hasc": "BR.PE",
			"alt-name": "Pernambouc",
			"woe-id": "2344860",
			"subregion": null,
			"fips": "BR30",
			"postal-code": "PE",
			"name": "Pernambuco",
			"country": "Brazil",
			"type-en": "State",
			"region": null,
			"longitude": "-37.2958",
			"woe-name": "Pernambuco",
			"latitude": "-8.47283",
			"woe-label": "Pernambuco, BR, Brazil",
			"type": "Estado"
		},
		"geometry": {
			"type": "Polygon",
			"coordinates": [[[9731, 5780], [9664, 5792], [9643, 5807], [9573, 5786], [9552, 5801], [9493, 5797], [9461, 5764], [9397, 5713], [9332, 5689], [9263, 5701], [9232, 5676], [9167, 5712], [9078, 5802], [9032, 5794], [9015, 5829], [8996, 5796], [8951, 5750], [8917, 5740], [8876, 5700], [8856, 5799], [8831, 5787], [8804, 5813], [8801, 5850], [8764, 5809], [8752, 5846], [8712, 5868], [8680, 5863], [8664, 5880], [8612, 5898], [8595, 5932], [8563, 5941], [8483, 5909], [8481, 5873], [8424, 5862], [8423, 5821], [8361, 5786], [8317, 5788], [8300, 5718], [8278, 5717], [8217, 5682], [8180, 5693], [8200, 5724], [8197, 5760], [8157, 5780], [8147, 5813], [8150, 5864], [8077, 5909], [8019, 5910], [8064, 5930], [8119, 5989], [8145, 5985], [8195, 6037], [8240, 6070], [8253, 6096], [8255, 6152], [8224, 6174], [8236, 6208], [8218, 6268], [8261, 6278], [8392, 6269], [8452, 6284], [8505, 6275], [8537, 6245], [8588, 6223], [8615, 6184], [8652, 6162], [8661, 6132], [8690, 6133], [8734, 6184], [8768, 6196], [8814, 6152], [8862, 6169], [8887, 6125], [8917, 6147], [8965, 6145], [9042, 6206], [9086, 6225], [9119, 6262], [9170, 6282], [9234, 6241], [9234, 6211], [9183, 6194], [9189, 6139], [9138, 6072], [9191, 6076], [9195, 6022], [9239, 5986], [9290, 6002], [9334, 6040], [9326, 6061], [9352, 6085], [9386, 6088], [9393, 6112], [9547, 6111], [9551, 6125], [9635, 6152], [9654, 6209], [9688, 6207], [9718, 6228], [9774, 6218], [9820, 6176], [9843, 6152], [9829, 6094], [9838, 6069], [9800, 5973], [9796, 5941], [9738, 5811], [9731, 5780]]]
		}
	}, {
		"type": "Feature",
		"id": "BR.PR",
		"properties": {
			"hc-group": "admin1",
			"hc-middle-x": 0.45,
			"hc-middle-y": 0.50,
			"hc-key": "br-pr",
			"hc-a2": "PR",
			"labelrank": "2",
			"hasc": "BR.PR",
			"alt-name": null,
			"woe-id": "2344859",
			"subregion": null,
			"fips": "BR18",
			"postal-code": "PR",
			"name": "Paraná",
			"country": "Brazil",
			"type-en": "State",
			"region": null,
			"longitude": "-51.3228",
			"woe-name": "Paraná",
			"latitude": "-24.6618",
			"woe-label": "Parana, BR, Brazil",
			"type": "Estado"
		},
		"geometry": {
			"type": "Polygon",
			"coordinates": [[[4621, 1100], [4595, 1164], [4580, 1180], [4577, 1225], [4559, 1275], [4505, 1297], [4509, 1311], [4435, 1286], [4420, 1271], [4385, 1290], [4383, 1330], [4431, 1347], [4422, 1367], [4494, 1386], [4441, 1393], [4440, 1413], [4465, 1435], [4436, 1448], [4442, 1490], [4465, 1474], [4453, 1505], [4467, 1527], [4499, 1528], [4469, 1546], [4465, 1585], [4479, 1646], [4461, 1682], [4474, 1713], [4517, 1742], [4519, 1778], [4550, 1887], [4607, 1923], [4628, 1976], [4640, 2027], [4670, 2052], [4751, 2087], [4808, 2123], [4996, 2101], [5035, 2135], [5084, 2109], [5168, 2087], [5218, 2096], [5280, 2062], [5339, 2046], [5363, 2012], [5403, 2017], [5490, 2006], [5572, 2015], [5587, 1980], [5633, 1960], [5655, 1916], [5659, 1875], [5649, 1848], [5673, 1790], [5659, 1748], [5706, 1685], [5750, 1613], [5727, 1560], [5730, 1522], [5782, 1514], [5798, 1529], [5860, 1509], [5902, 1512], [5934, 1492], [5919, 1475], [5910, 1406], [5924, 1398], [5950, 1432], [5996, 1415], [6013, 1356], [6043, 1353], [6029, 1332], [5996, 1291], [5955, 1274], [5969, 1356], [5958, 1335], [5936, 1352], [5945, 1307], [5932, 1290], [5888, 1299], [5863, 1322], [5892, 1275], [5916, 1279], [5956, 1261], [5937, 1248], [5896, 1149], [5763, 1151], [5716, 1121], [5640, 1091], [5552, 1153], [5460, 1144], [5425, 1153], [5377, 1142], [5354, 1097], [5312, 1086], [5269, 1099], [5224, 1068], [5214, 1047], [5226, 996], [5179, 972], [5160, 1000], [5067, 1001], [5034, 1007], [4986, 1044], [4876, 1059], [4833, 1077], [4756, 1069], [4698, 1105], [4672, 1092], [4621, 1100]]]
		}
	}, {
		"type": "Feature",
		"id": "BR.ES",
		"properties": {
			"hc-group": "admin1",
			"hc-middle-x": 0.35,
			"hc-middle-y": 0.81,
			"hc-key": "br-es",
			"hc-a2": "ES",
			"labelrank": "2",
			"hasc": "BR.ES",
			"alt-name": "Espiritu Santo",
			"woe-id": "2344851",
			"subregion": null,
			"fips": "BR08",
			"postal-code": "ES",
			"name": "Espírito Santo",
			"country": "Brazil",
			"type-en": "State",
			"region": null,
			"longitude": "-40.5436",
			"woe-name": "Espírito Santo",
			"latitude": "-19.6916",
			"woe-label": "Espirito Santo, BR, Brazil",
			"type": "Estado"
		},
		"geometry": {
			"type": "Polygon",
			"coordinates": [[[7700, 2503], [7717, 2539], [7726, 2601], [7712, 2618], [7751, 2661], [7832, 2653], [7843, 2660], [7864, 2725], [7897, 2747], [7909, 2805], [7965, 2854], [7977, 2903], [7976, 2946], [7950, 2980], [7939, 3022], [7905, 3034], [7986, 3042], [7990, 3074], [7964, 3091], [7975, 3143], [7941, 3190], [7965, 3222], [8005, 3241], [8041, 3241], [8008, 3278], [8073, 3278], [8138, 3291], [8195, 3262], [8200, 3253], [8328, 3154], [8301, 3053], [8297, 2991], [8301, 2894], [8294, 2844], [8255, 2778], [8203, 2752], [8156, 2676], [8134, 2611], [8102, 2626], [8101, 2601], [8129, 2599], [8101, 2550], [8021, 2460], [7994, 2461], [7968, 2408], [7923, 2344], [7898, 2363], [7846, 2362], [7802, 2375], [7733, 2406], [7731, 2488], [7700, 2503]]]
		}
	}, {
		"type": "Feature",
		"id": "BR.RJ",
		"properties": {
			"hc-group": "admin1",
			"hc-middle-x": 0.72,
			"hc-middle-y": 0.56,
			"hc-key": "br-rj",
			"hc-a2": "RJ",
			"labelrank": "2",
			"hasc": "BR.RJ",
			"alt-name": null,
			"woe-id": "2344862",
			"subregion": null,
			"fips": "BR21",
			"postal-code": "RJ",
			"name": "Rio de Janeiro",
			"country": "Brazil",
			"type-en": "State",
			"region": null,
			"longitude": "-43.1152",
			"woe-name": "Rio de Janeiro",
			"latitude": "-22.4049",
			"woe-label": "Rio de Janeiro, BR, Brazil",
			"type": "Estado"
		},
		"geometry": {
			"type": "Polygon",
			"coordinates": [[[6911, 1831], [6879, 1874], [6895, 1893], [6900, 1934], [6985, 1968], [7037, 1973], [7067, 2005], [7056, 2036], [6972, 2033], [6948, 2041], [6916, 2092], [6901, 2098], [6945, 2106], [7004, 2134], [7062, 2132], [7095, 2151], [7170, 2177], [7260, 2173], [7292, 2186], [7371, 2174], [7573, 2247], [7551, 2271], [7575, 2334], [7596, 2352], [7637, 2467], [7672, 2468], [7700, 2503], [7731, 2488], [7733, 2406], [7802, 2375], [7846, 2362], [7898, 2363], [7923, 2344], [7921, 2319], [7890, 2276], [7907, 2154], [7898, 2136], [7831, 2104], [7719, 2074], [7636, 2009], [7625, 1963], [7649, 1938], [7623, 1928], [7603, 1893], [7458, 1909], [7439, 1902], [7353, 1907], [7329, 1931], [7356, 1963], [7348, 1995], [7296, 1975], [7321, 1932], [7304, 1905], [7101, 1892], [7205, 1908], [7141, 1941], [7114, 1938], [7044, 1900], [7080, 1871], [7017, 1861], [7007, 1877], [7042, 1902], [7042, 1922], [6992, 1926], [6922, 1899], [6919, 1869], [6968, 1850], [6948, 1828], [6911, 1831]]]
		}
	}, {
		"type": "Feature",
		"id": "BR.RN",
		"properties": {
			"hc-group": "admin1",
			"hc-middle-x": 0.53,
			"hc-middle-y": 0.53,
			"hc-key": "br-rn",
			"hc-a2": "RN",
			"labelrank": "2",
			"hasc": "BR.RN",
			"alt-name": null,
			"woe-id": "2344863",
			"subregion": null,
			"fips": "BR22",
			"postal-code": "RN",
			"name": "Rio Grande do Norte",
			"country": "Brazil",
			"type-en": "State",
			"region": null,
			"longitude": "-36.5472",
			"woe-name": "Rio Grande do Norte",
			"latitude": "-5.66157",
			"woe-label": "Rio Grande do Norte, BR, Brazil",
			"type": "Estado"
		},
		"geometry": {
			"type": "Polygon",
			"coordinates": [[[8827, 6550], [8804, 6546], [8812, 6584], [8860, 6641], [8892, 6636], [8941, 6691], [8965, 6766], [9003, 6809], [9060, 6923], [9111, 6960], [9197, 6987], [9224, 6957], [9290, 6953], [9319, 6919], [9382, 6897], [9421, 6908], [9502, 6902], [9539, 6915], [9674, 6883], [9698, 6862], [9740, 6782], [9767, 6653], [9778, 6631], [9780, 6575], [9795, 6560], [9813, 6481], [9789, 6472], [9717, 6477], [9674, 6497], [9618, 6511], [9546, 6502], [9456, 6520], [9446, 6552], [9421, 6553], [9390, 6533], [9383, 6503], [9401, 6461], [9376, 6458], [9384, 6415], [9362, 6374], [9323, 6361], [9307, 6375], [9304, 6422], [9250, 6442], [9184, 6410], [9153, 6448], [9104, 6455], [9107, 6491], [9129, 6501], [9140, 6537], [9203, 6614], [9180, 6642], [9041, 6602], [9016, 6555], [8956, 6527], [8935, 6506], [8893, 6512], [8827, 6550]]]
		}
	}, {
		"type": "Feature",
		"id": "BR.AM",
		"properties": {
			"hc-group": "admin1",
			"hc-middle-x": 0.56,
			"hc-middle-y": 0.56,
			"hc-key": "br-am",
			"hc-a2": "AM",
			"labelrank": "2",
			"hasc": "BR.AM",
			"alt-name": "Amazone",
			"woe-id": "2344847",
			"subregion": null,
			"fips": "BR04",
			"postal-code": "AM",
			"name": "Amazonas",
			"country": "Brazil",
			"type-en": "State",
			"region": null,
			"longitude": "-63.7853",
			"woe-name": "Amazonas",
			"latitude": "-4.21774",
			"woe-label": "Amazonas, BR, Brazil",
			"type": "Estado"
		},
		"geometry": {
			"type": "Polygon",
			"coordinates": [[[1919, 9011], [1942, 8990], [1986, 8994], [2026, 8950], [2069, 8949], [2108, 8929], [2106, 8870], [2086, 8832], [2131, 8779], [2180, 8608], [2155, 8588], [2169, 8534], [2156, 8503], [2146, 8432], [2158, 8409], [2143, 8387], [2171, 8320], [2201, 8287], [2201, 8252], [2217, 8203], [2199, 8182], [2171, 8188], [2163, 8166], [2187, 8151], [2247, 8090], [2297, 8062], [2339, 8000], [2372, 8002], [2416, 7986], [2411, 8026], [2427, 8097], [2422, 8118], [2435, 8179], [2455, 8204], [2553, 8245], [2603, 8228], [2635, 8191], [2657, 8146], [2719, 8151], [2732, 8176], [2768, 8186], [2774, 8210], [2753, 8238], [2776, 8317], [2827, 8419], [2855, 8445], [2927, 8447], [3177, 8445], [3182, 8285], [3214, 8263], [3211, 8210], [3245, 8170], [3297, 8143], [3312, 8091], [3376, 8039], [3469, 7982], [3517, 7941], [3606, 7903], [3675, 7880], [3698, 7846], [3772, 7813], [3770, 7779], [3802, 7766], [3840, 7783], [3868, 7752], [3870, 7720], [3768, 7499], [3346, 6577], [3299, 6520], [3320, 6449], [3369, 6407], [3392, 6343], [3372, 6321], [3372, 6273], [3326, 6209], [3346, 6127], [3338, 6088], [3312, 6044], [3317, 6008], [3283, 5950], [2438, 5931], [2408, 5953], [2375, 5936], [2365, 5905], [2294, 5928], [2282, 5972], [2245, 5982], [2225, 6034], [2179, 6039], [2126, 6122], [2076, 6136], [1901, 6135], [1887, 6088], [1851, 6080], [1844, 6053], [1798, 6038], [1779, 6008], [1799, 5982], [1779, 5941], [1743, 5938], [1748, 5867], [1650, 5860], [1616, 5839], [1566, 5848], [1527, 5809], [1533, 5783], [1484, 5719], [1446, 5768], [1393, 5729], [1335, 5710], [1299, 5676], [1253, 5717], [1124, 5715], [1124, 5682], [1097, 5649], [1033, 5615], [1010, 5588], [175, 5951], [16, 6030], [-624, 6168], [-946, 6292], [-937, 6356], [-916, 6384], [-831, 6454], [-784, 6467], [-767, 6500], [-799, 6603], [-775, 6663], [-738, 6713], [-733, 6785], [-713, 6842], [-720, 6883], [-640, 6917], [-538, 6997], [-489, 7043], [-407, 7081], [-377, 7074], [-333, 7092], [-293, 7090], [-273, 7113], [-184, 7114], [-147, 7174], [-92, 7193], [-78, 7171], [-36, 7190], [-2, 7180], [-1, 7154], [28, 7131], [41, 7152], [88, 7140], [99, 7173], [241, 8043], [226, 8096], [201, 8118], [176, 8172], [189, 8197], [175, 8237], [88, 8295], [52, 8347], [57, 8552], [179, 8570], [211, 8592], [250, 8567], [313, 8569], [299, 8588], [309, 8632], [271, 8681], [249, 8688], [114, 8688], [114, 8874], [191, 8891], [255, 8877], [586, 8874], [554, 8905], [577, 8956], [604, 8932], [633, 8882], [691, 8900], [746, 8968], [789, 8992], [817, 8978], [878, 8869], [890, 8821], [883, 8739], [892, 8716], [945, 8730], [1075, 8610], [1145, 8590], [1196, 8611], [1260, 8658], [1305, 8659], [1323, 8627], [1304, 8592], [1311, 8568], [1342, 8578], [1376, 8640], [1411, 8644], [1430, 8701], [1462, 8704], [1513, 8741], [1543, 8734], [1593, 8783], [1633, 8807], [1637, 8775], [1711, 8827], [1725, 8846], [1733, 8916], [1749, 8934], [1814, 8941], [1855, 8973], [1912, 8986], [1919, 9011]]]
		}
	}, {
		"type": "Feature",
		"id": "BR.MT",
		"properties": {
			"hc-group": "admin1",
			"hc-middle-x": 0.49,
			"hc-middle-y": 0.55,
			"hc-key": "br-mt",
			"hc-a2": "MT",
			"labelrank": "2",
			"hasc": "BR.MT",
			"alt-name": "Matto Grosso",
			"woe-id": "2344855",
			"subregion": null,
			"fips": "BR14",
			"postal-code": "MT",
			"name": "Mato Grosso",
			"country": "Brazil",
			"type-en": "State",
			"region": null,
			"longitude": "-55.9235",
			"woe-name": "Mato Grosso",
			"latitude": "-13.3926",
			"woe-label": "Mato Grosso, BR, Brazil",
			"type": "Estado"
		},
		"geometry": {
			"type": "Polygon",
			"coordinates": [[[3392, 6343], [3413, 6323], [3460, 6246], [3492, 6148], [3531, 6097], [3520, 6040], [3549, 5951], [3576, 5941], [3627, 5896], [3681, 5870], [3698, 5821], [3755, 5809], [3774, 5775], [3799, 5781], [3859, 5756], [4236, 5731], [5279, 5666], [5571, 5648], [5552, 5599], [5531, 5576], [5517, 5511], [5491, 5451], [5469, 5424], [5458, 5346], [5464, 5320], [5427, 5190], [5452, 5160], [5436, 5131], [5451, 5085], [5442, 5051], [5444, 4998], [5460, 4931], [5444, 4876], [5463, 4826], [5493, 4816], [5489, 4786], [5464, 4751], [5468, 4709], [5442, 4656], [5416, 4623], [5405, 4586], [5387, 4576], [5387, 4468], [5369, 4463], [5348, 4386], [5355, 4353], [5318, 4251], [5298, 4226], [5259, 4232], [5206, 4203], [5167, 4163], [5161, 4116], [5105, 3999], [5006, 3969], [4985, 3935], [4928, 3899], [4929, 3883], [4893, 3865], [4907, 3828], [4902, 3799], [4855, 3740], [4798, 3706], [4791, 3653], [4749, 3591], [4738, 3513], [4787, 3387], [4720, 3393], [4609, 3390], [4539, 3420], [4574, 3479], [4603, 3492], [4621, 3599], [4584, 3585], [4549, 3543], [4498, 3496], [4432, 3483], [4424, 3509], [4396, 3527], [4351, 3526], [4297, 3489], [4222, 3479], [4128, 3529], [4108, 3559], [4060, 3570], [3976, 3615], [3937, 3606], [3916, 3587], [3802, 3576], [3777, 3530], [3747, 3504], [3744, 3481], [3704, 3445], [3628, 3422], [3579, 3434], [3546, 3456], [3528, 3506], [3469, 3521], [3409, 3566], [3369, 3582], [3344, 3688], [3339, 3744], [3371, 3793], [3374, 3855], [3341, 3842], [2894, 3847], [2881, 3861], [2859, 4061], [2763, 4171], [2846, 4174], [2838, 4304], [2788, 4400], [2786, 4449], [2807, 4482], [2782, 4534], [2713, 4570], [2804, 4640], [2832, 4739], [2852, 4766], [2882, 4779], [2903, 4835], [2927, 4867], [2949, 4932], [2930, 4971], [2930, 5003], [2903, 5062], [2882, 5065], [2869, 5150], [2919, 5211], [2893, 5277], [2817, 5293], [2789, 5287], [2772, 5314], [2490, 5309], [2476, 5321], [2486, 5466], [2460, 5514], [2457, 5570], [2469, 5626], [2456, 5663], [2478, 5689], [2441, 5777], [2462, 5804], [2455, 5830], [2473, 5891], [2438, 5931], [3283, 5950], [3317, 6008], [3312, 6044], [3338, 6088], [3346, 6127], [3326, 6209], [3372, 6273], [3372, 6321], [3392, 6343]]]
		}
	}, {
		"type": "Feature",
		"id": "BR.DF",
		"properties": {
			"hc-group": "admin1",
			"hc-middle-x": 0.89,
			"hc-middle-y": 0.52,
			"hc-key": "br-df",
			"hc-a2": "DF",
			"labelrank": "7",
			"hasc": "BR.DF",
			"alt-name": null,
			"woe-id": "2344850",
			"subregion": null,
			"fips": "BR07",
			"postal-code": "DF",
			"name": "Distrito Federal",
			"country": "Brazil",
			"type-en": "Federal District",
			"region": null,
			"longitude": "-47.7902",
			"woe-name": "Distrito Federal",
			"latitude": "-15.7665",
			"woe-label": "Distrito Federal, BR, Brazil",
			"type": "Distrito Federal"
		},
		"geometry": {
			"type": "Polygon",
			"coordinates": [[[6332, 3907], [6332, 3907], [6332, 3907], [6097, 3914], [6072, 3971], [6093, 3999], [6084, 4011], [6102, 4067], [6305, 4059], [6335, 4033], [6318, 3923], [6332, 3907], [6332, 3907], [6332, 3907]]]
		}
	}, {
		"type": "Feature",
		"id": "BR.AC",
		"properties": {
			"hc-group": "admin1",
			"hc-middle-x": 0.49,
			"hc-middle-y": 0.52,
			"hc-key": "br-ac",
			"hc-a2": "AC",
			"labelrank": "2",
			"hasc": "BR.",
			"alt-name": null,
			"woe-id": "2344844",
			"subregion": null,
			"fips": "BR01",
			"postal-code": "AC",
			"name": "Acre",
			"country": "Brazil",
			"type-en": "State",
			"region": null,
			"longitude": "-70.2976",
			"woe-name": "Acre",
			"latitude": "-8.9285",
			"woe-label": "Acre, BR, Brazil",
			"type": "Estado"
		},
		"geometry": {
			"type": "Polygon",
			"coordinates": [[[1060, 5568], [993, 5515], [950, 5467], [913, 5445], [876, 5444], [836, 5403], [810, 5391], [775, 5332], [736, 5343], [672, 5329], [622, 5247], [536, 5204], [489, 5198], [496, 5231], [320, 5244], [232, 5231], [167, 5241], [78, 5194], [37, 5200], [9, 5227], [-19, 5204], [-36, 5538], [-12, 5576], [-36, 5621], [-11, 5661], [-104, 5590], [-140, 5543], [-179, 5524], [-188, 5505], [-240, 5483], [-461, 5471], [-453, 5506], [-484, 5541], [-499, 5605], [-534, 5620], [-640, 5635], [-750, 5630], [-685, 5728], [-691, 5757], [-750, 5831], [-800, 5865], [-803, 5899], [-852, 5928], [-896, 6032], [-927, 6048], [-933, 6071], [-911, 6097], [-947, 6115], [-999, 6165], [-969, 6216], [-918, 6239], [-946, 6292], [-624, 6168], [16, 6030], [175, 5951], [1010, 5588], [1060, 5568]]]
		}
	}, {
		"type": "Feature",
		"id": "BR.RO",
		"properties": {
			"hc-group": "admin1",
			"hc-middle-x": 0.59,
			"hc-middle-y": 0.58,
			"hc-key": "br-ro",
			"hc-a2": "RO",
			"labelrank": "2",
			"hasc": "BR.",
			"alt-name": "Guaporé",
			"woe-id": "2344865",
			"subregion": "Guaporé",
			"fips": "BR24",
			"postal-code": "RO",
			"name": "Rondônia",
			"country": "Brazil",
			"type-en": "State",
			"region": null,
			"longitude": "-63.1439",
			"woe-name": "Rondônia",
			"latitude": "-10.9712",
			"woe-label": "Rondonia, BR, Brazil",
			"type": "Estado"
		},
		"geometry": {
			"type": "Polygon",
			"coordinates": [[[2713, 4570], [2666, 4599], [2631, 4603], [2624, 4623], [2597, 4607], [2543, 4612], [2513, 4598], [2478, 4607], [2407, 4598], [2364, 4644], [2316, 4711], [2246, 4706], [2238, 4719], [2187, 4731], [2175, 4749], [2142, 4741], [2108, 4780], [2095, 4777], [2066, 4833], [2023, 4818], [1979, 4826], [1950, 4856], [1906, 4877], [1866, 4881], [1835, 4855], [1773, 4859], [1754, 4872], [1704, 4874], [1678, 4897], [1682, 4929], [1614, 4958], [1592, 4990], [1535, 4998], [1514, 5065], [1478, 5067], [1469, 5130], [1449, 5133], [1418, 5231], [1441, 5278], [1435, 5313], [1413, 5327], [1416, 5360], [1401, 5380], [1406, 5430], [1437, 5497], [1422, 5578], [1429, 5607], [1410, 5639], [1387, 5646], [1352, 5601], [1317, 5623], [1185, 5605], [1114, 5578], [1060, 5568], [1010, 5588], [1033, 5615], [1097, 5649], [1124, 5682], [1124, 5715], [1253, 5717], [1299, 5676], [1335, 5710], [1393, 5729], [1446, 5768], [1484, 5719], [1533, 5783], [1527, 5809], [1566, 5848], [1616, 5839], [1650, 5860], [1748, 5867], [1743, 5938], [1779, 5941], [1799, 5982], [1779, 6008], [1798, 6038], [1844, 6053], [1851, 6080], [1887, 6088], [1901, 6135], [2076, 6136], [2126, 6122], [2179, 6039], [2225, 6034], [2245, 5982], [2282, 5972], [2294, 5928], [2365, 5905], [2375, 5936], [2408, 5953], [2438, 5931], [2473, 5891], [2455, 5830], [2462, 5804], [2441, 5777], [2478, 5689], [2456, 5663], [2469, 5626], [2457, 5570], [2460, 5514], [2486, 5466], [2476, 5321], [2490, 5309], [2772, 5314], [2789, 5287], [2817, 5293], [2893, 5277], [2919, 5211], [2869, 5150], [2882, 5065], [2903, 5062], [2930, 5003], [2930, 4971], [2949, 4932], [2927, 4867], [2903, 4835], [2882, 4779], [2852, 4766], [2832, 4739], [2804, 4640], [2713, 4570]]]
		}
	}]
};
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
(function () {

    angular.module('BuscaAtivaEscolar')
        .config(function ($stateProvider) {
            $stateProvider.state('frequency', {
                url: '/frequencia/{school_id}',
                templateUrl: '/views/escolas/frequencia.html',
                controller: 'FrequencyCtrl',
                unauthenticated: true
            });
        })
        .controller('FrequencyCtrl', function ($scope, $stateParams, ngToast, Classes, Modals) {

            $scope.school_id = $stateParams.school_id;

            $scope.periodicidades = ['Diaria', 'Semanal', 'Quinzenal', 'Mensal'];

            $scope.query = {
                sort: {},
                max: 5,
                page: 1,
                search: ''
            };

            $scope.classes = {
                school: {
                    periodicidade: null
                },
            };

            $scope.categories = [];

            //Configuracoes iniciais para o Hightchart
            $scope.options_graph = {

                legend: {
                    enabled: true
                },

                rangeSelector: {
                    enabled: false
                },

                chart: {
                    type: 'line',
                    renderTo: '',
                    width: 1100,
                    height: 600
                },

                title: { text: '' },

                subtitle: { text: '' },

                xAxis: {

                    tickPositioner: function() {
                        return $scope.categories;
                    },

                    step: 1,

                    startOnTick: true,

                    type: "datetime",

                    title: {
                        text: ""
                    },

                    labels: {
                        rotation: -90,
                        //x: 0,
                        //y: 50,
                        // format: '{value: %d/%m}',
                        formatter: function () {
                            return $scope.getLabelForAxisChart(new Date(this.value), this.chart.title.textStr.substr(25));
                        }
                    },
                    crosshair: true
                },

                yAxis: {
                    title: {
                        text: 'Frequência'
                    }
                },

                plotOptions: {
                    series: {
                        allowPointSelect: true,
                        marker: {
                            enabled: true,
                            radius: 3
                        }
                    },
                },

                credits:{
                    enabled:false,
                },

                series: []
            };

            $scope.onModifyFrequency = function(frequency, turma){
                var newValuePresenca = angular.element('#frequency_'+frequency.id).val();
                if( parseInt(turma.qty_enrollment) < parseInt(newValuePresenca) ){
                    Modals.show(Modals.Alert("A frequência não pode ser maior que a quantidade de alunos presentes"));
                    $scope.refresh();
                }else{
                    frequency.qty_presence = parseInt(newValuePresenca);
                    Classes.updateFrequency(frequency).$promise
                        .then(function (res) {
                            $scope.refresh();
                        });
                }
            };

            $scope.getLabelForAxisChart = function(date, periodicidade){

                if(periodicidade == 'Diária'){
                    var splitDate = date.toISOString().substr(0, 10).split('-');
                    return splitDate[2]+"/"+splitDate[1];
                }

                if(periodicidade == 'Semanal'){
                    var splitDate1 = $scope.subtractDaysOfDayInstance(date, 4).toISOString().substr(0, 10).split('-');
                    var splitDate2 = date.toISOString().substr(0, 10).split('-');
                    return splitDate1[2]+"/"+splitDate1[1] +" até "+ splitDate2[2]+"/"+splitDate2[1];
                }

                if(periodicidade == 'Quinzenal'){
                    var splitDate1 = $scope.subtractFortnightOfDayInstance(date).toISOString().substr(0, 10).split('-');
                    var splitDate2 = date.toISOString().substr(0, 10).split('-');
                    return splitDate1[2]+"/"+splitDate1[1] +" até "+ splitDate2[2]+"/"+splitDate2[1];
                }

                if(periodicidade == 'Mensal'){
                    var splitDate1 = $scope.subtractMonthOfDayInstance(date).toISOString().substr(0, 10).split('-');
                    var splitDate2 = date.toISOString().substr(0, 10).split('-');
                    return splitDate1[2]+"/"+splitDate1[1] +" até "+ splitDate2[2]+"/"+splitDate2[1];
                }

            };

            $scope.initChart = function(){

                /*
                    No topo da página frequencia.html mudamos a referência para Highcharts para highstock
                    O Highcharts usado aqui é diferente do usado na plataforma como diretiva
                    A diretiva foi completamente personalizada e impede o uso personalizado aqui
                 */

                // Solução para problema de resize
                (function(H) {
                    H.wrap(
                        H.Navigator.prototype,
                        'drawMasks',
                        function(proceed, zoomedMin, zoomedMax) {
                            if (!H.isNumber(zoomedMin) || !H.isNumber(zoomedMax)) {
                                return;
                            }
                            proceed.apply(this, Array.prototype.slice.call(arguments, 1))
                        }
                    );
                })(Highcharts);

                // Configurações de idioma
                Highcharts.setOptions({
                    lang: {
                        months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
                        shortMonths: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
                        weekdays: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
                        loading: ['Atualizando o gráfico...'],
                        contextButtonTitle: 'Exportar gráfico',
                        decimalPoint: ',',
                        thousandsSep: '.',
                        downloadJPEG: 'Baixar imagem JPEG',
                        downloadPDF: 'Baixar arquivo PDF',
                        downloadPNG: 'Baixar imagem PNG',
                        downloadSVG: 'Baixar vetor SVG',
                        printChart: 'Imprimir gráfico',
                        rangeSelectorFrom: 'De',
                        rangeSelectorTo: 'Para',
                        rangeSelectorZoom: 'Zoom',
                        resetZoom: 'Voltar zoom',
                        resetZoomTitle: 'Voltar zoom para nível 1:1'
                    }
                });

                /*
                    Para cada periodicidade do array de periodicidades
                    percerremos turmas e suas respectivas frequências
                    para setar as configuraçoes do gráfico
                    Cada gráfico recebe um objeto de configuracao
                 */
                $scope.periodicidades.forEach( function (period) {

                    $scope.options_graph.series = [];
                    $scope.options_graph.chart.renderTo = 'chart_classes_'+period;
                    $scope.options_graph.title.text = 'Frequências das turmas - '+$scope.getNamePeriodicidades(period);

                    $scope.classes.turmas.forEach( function(element) {

                        var data = [];

                        element.frequencies.forEach( function (frequency) {

                            if(frequency.periodicidade == period){

                                $scope.options_graph.chart.renderTo = "graph_"+period;

                                var dataSplit = frequency.created_at.substr(0, 10).split('-');

                                data.push([
                                    Date.UTC(parseInt(dataSplit[0]), parseInt(dataSplit[1])-1, parseInt(dataSplit[2])),
                                    parseInt(frequency.qty_presence),
                                ]);

                                $scope.categories.push(
                                    Date.UTC(parseInt(dataSplit[0]), parseInt(dataSplit[1])-1, parseInt(dataSplit[2]))
                                );
                            }

                        });

                        $scope.options_graph.series.push({
                            name: element.name,
                            data: data,
                        });

                    });

                    //console.log($scope.options_graph.xAxis.tickPositions);

                    var chart = new Highcharts.stockChart( 'chart_classes_'+period, $scope.options_graph);

                });

            };

            $scope.calculatePercentualFrequencies = function(arrayFrequencies, totalStudents){
                return ( ( 100* ( arrayFrequencies[(arrayFrequencies.length)-1].qty_presence ) ) / totalStudents ).toFixed(2);
            };

            $scope.finish = function(){
                Modals.show(Modals.ConfirmLarge("Suas informações do registro de frequência foram salvas. A Busca Ativa Escolar é uma estratégia que conta com uma metodologia social e uma plataforma tecnológica e visa apoiar municípios e estados no enfrentamento da exclusão escolar. Em períodos de crises e emergências, como a que ocorre nesse momento, com a covid-19, a estratégia pode colaborar de maneira efetiva para prevenir ou mitigar o abandono e a evasão escolares. Deseja acessar o guia Busca Ativa Escolar em crises e emergências e verificar como seu município e estado podem proceder?"))
                    .then(function () {
                        window.location.href = "https://buscaativaescolar.org.br/criseseemergencias";
                    });
            };

            $scope.getNamePeriodicidade = function(){
              var periodicidades = {
                  Diaria: 'Diária',
                  Semanal: 'Semanal',
                  Quinzenal: 'Quinzenal',
                  Mensal: 'Mensal'
              };
              return periodicidades[$scope.classes.school.periodicidade];
            };

            $scope.getNamePeriodicidades = function(period){
                var periodicidades = {
                    Diaria: 'Diária',
                    Semanal: 'Semanal',
                    Quinzenal: 'Quinzenal',
                    Mensal: 'Mensal'
                };
                return periodicidades[period];
            };

            $scope.addPeriodFrequency = function(turma){
                Modals.show(
                    Modals.AddPeriodFrequency(
                        turma.name,
                        'Atualização de períodos anteriores | Frequência ' + $scope.getNamePeriodicidade().toLowerCase(),
                        turma,
                        $scope.classes.school.periodicidade
                    )).then(function () {
                        $scope.refresh();
                    });
            };

            $scope.refresh = function () {

                Classes.frequencies({id: $scope.school_id}).$promise
                    .then(function (res) {

                        $scope.classes = res;
                        $scope.initChart();

                        document.getElementById("aba_"+$scope.classes.school.periodicidade.toLowerCase()).classList.add("active"); //ativa a aba correta dos graficos
                        document.getElementById("aba_"+$scope.classes.school.periodicidade.toLowerCase()).classList.add("in");
                        document.getElementById("li_"+$scope.classes.school.periodicidade.toLowerCase()).classList.add("active");
                        document.getElementById("link_"+$scope.classes.school.periodicidade.toLowerCase()).setAttribute("aria-expanded", "true");

                    });

            };

            $scope.refresh();

            //subtrair um dia considerando finais de semana
            $scope.subtractDaysOfDayInstance = function(date, days) {
                var copy = new Date(Number(date));
                copy.setDate(date.getDate() - days);
                if( copy.getUTCDay() == 0 ) //domingo
                { copy.setDate(copy.getDate() - 2); }
                if( copy.getUTCDay() == 6 ) //sabado
                { copy.setDate(copy.getDate() - 1); }
                return copy;
            };

            //pega a ultima sexta-feira para periodicidade semanal
            $scope.subtractAWeekOfDayInstance = function(date){
                var lastFriday = new Date(Number(date));
                if(date.getDay() == 5){
                    lastFriday = $scope.subtractDaysOfDayInstance(date, 7);
                }
                while (lastFriday.getDay() != 5){
                    lastFriday = $scope.subtractDaysOfDayInstance(lastFriday, 1);
                }
                return lastFriday;
            };

            //pega o ultimo dia 15 ou dia 1o
            $scope.subtractFortnightOfDayInstance = function(date){
                var date2 = new Date(Number(date));
                if(date.getUTCDate() > 15){
                    date2.setUTCDate(15);
                }else{ //se é de 1 a 15 pega ultima data do mes anterior
                    date2 = new Date(date.getFullYear(), date.getMonth(), 0);
                }
                return date2;
            };

            //menos um mês completo- ultimo dia do mês anterior
            $scope.subtractMonthOfDayInstance = function(date) {
                return new Date(date.getFullYear(), date.getMonth(), 0);
            };

        });
})();
(function() {
	angular
		.module('BuscaAtivaEscolar')
		.service('AddAuthorizationHeadersInterceptor', function ($q, $rootScope, Identity) {

			this.request = function (config) {

				// No indication sent in headers
				if(!config.headers['X-Require-Auth']) return config;

				// Auth is optional, but not logged in
				if(config.headers['X-Require-Auth'] === 'auth-optional' && !Identity.isLoggedIn()) return config;

				// Auth is neither optional nor required (header has invalid value)
				if(config.headers['X-Require-Auth'] !== 'auth-optional' && config.headers['X-Require-Auth'] !== 'auth-required') return config;

				// Auth is required
				return Identity.provideToken().then(function (access_token) {
					config.headers.Authorization = 'Bearer ' + access_token;
					return config;
				}, function (error) {
					console.error("[auth.interceptor] Token provider returned error: ", error);

					if(error && error.error === 'token_refresh_fail') {
						console.warn("[auth.interceptor] Token refresh failed, likely due to expiration; requesting re-login");
						$rootScope.$broadcast('unauthorized');
					}

					throw error;
				});

			};

			this.responseError = function (response) {

				if (response.status === 401 || response.data && response.data.error === 'token_refresh_fail') {
					$rootScope.$broadcast('unauthorized');
				}

				return response;
			};

		});

})();
(function() {
	angular.module('BuscaAtivaEscolar').run(function ($rootScope, $state, Identity) {
		$rootScope.$on('$stateChangeStart', handleStateChange);

		function handleStateChange(event, toState, toParams, fromState, fromParams, options) {

			//console.log("[router] to=", toState, toParams);

			if(toState.unauthenticated) return;
			if(Identity.isLoggedIn()) return;

			//console.log("[router.guard] Trying to access authenticated state, but currently logged out. Redirecting...");

			event.preventDefault();
			$state.go('login');
		}

	});
})();
(function () {
    angular
        .module('BuscaAtivaEscolar')
        .service('HandleErrorResponsesInterceptor', function () {

            function handleResponse(response) {

                if (!response) {
                    console.error('[interceptors.server_error] Empty response received!');
                    return response;
                }

                if (!response.data) {
                    console.error('[interceptors.server_error] Response missing decoded data: ', response);
                    return response;
                }

                // Handled by Exception interceptor
                if (response.data.reason && response.data.reason === 'exception') return response;

                var acceptableErrors = [200, 206, 201, 204, 202, 301, 304, 302, 303, 307, 308, 100];

                if (acceptableErrors.indexOf(response.status) === -1) {
                    console.error('[interceptors.server_error] Error #' + response.status + ': ', response.data, response);
                    console.log(response.data.error)
                    if (response.data.error === 'token_invalid') {
                        window.localStorage.clear();
                        window.location.href = "/";
                    }
                    return response;
                }

                return response;

            }

            this.response = handleResponse;
            this.responseError = handleResponse;

        });

})();
(function() {
	angular
		.module('BuscaAtivaEscolar')
		.service('HandleExceptionResponsesInterceptor', function (Utils) {

			function handleResponse(response) {

				if(!response) return response;
				if(!response.data) return response;
				if(!response.data.reason) return response;
				if(response.data.reason !== 'exception') return response;

				var knownRootPaths = [
					'/home/vagrant/projects/busca-ativa-escolar-api/',
					'/home/forge/api.busca-ativa-escolar.dev.lqdi.net/'
				];

				if(response.data.exception.stack) {
					console.error('[interceptors.api_exception] [debug=on] API error: ', response.data.exception.message);
					console.warn('[interceptors.api_exception] [debug=on] Original HTTP call: ', response.config.method, response.config.url, response.config.data);

					var messages = Utils.renderCallStack(response.data.exception.stack, knownRootPaths);

					if(messages) {

						console.group('[interceptors.api_exception] [debug=on] Error stack below: ');

						for(var i in messages) {
							if(!messages.hasOwnProperty(i)) continue;
							//console.log(messages[i]);
						}

						console.endGroup();
					}

					return response;
				}

				//console.log('[interceptors.api_exception] [debug=off] API error: ', response.data.exception);

				return response;

			}

			this.response = handleResponse;
			this.responseError = handleResponse;

		});

})();
(function() {
	angular
		.module('BuscaAtivaEscolar')
		.service('InjectAPIEndpointInterceptor', function ($q, $rootScope, Config) {

			this.request = function (config) {

				// Fixes weird bug with ng-file-uploader clearing the content type globally
				//config.headers['Content-Type'] = "application/json";

				if(!config.url) return config;

				config.url = config.url.replace(/@@API@@/g, Config.getAPIEndpoint());
				config.url = config.url.replace(/@@TOKEN@@/g, Config.getTokenEndpoint());

				return config;

			};

		});

})();
(function() {
	angular
		.module('BuscaAtivaEscolar')
		.service('TrackPendingRequestsInterceptor', function ($q, $rootScope, API) {

			this.request = function (config) {

				if(config.data && config.data.$hide_loading_feedback) return config;
				if(config.params && config.params.$hide_loading_feedback) return config;

				API.pushRequest();

				return config;
			};

			this.response = function (response) {

				if(response.config && response.config.data && response.config.data.$hide_loading_feedback) return response;
				if(response.config && response.config.params && response.config.params.$hide_loading_feedback) return response;

				API.popRequest();

				return response;
			};

		});

})();
(function() {
	angular.module('BuscaAtivaEscolar').run(function ($rootScope, $state, Identity) {
		$rootScope.$on('$stateChangeStart', handleStateChange);

		function handleStateChange(event, toState, toParams, fromState, fromParams, options) {

			$rootScope.previousState = fromState;
			$rootScope.previousStateParams = fromParams;
			$rootScope.currentState = toState;
			$rootScope.currentStateParams = toParams;
		}

	});
})();
(function() {

	angular
		.module('BuscaAtivaEscolar')
		.config(function ($stateProvider) {
			$stateProvider
				.state('maintenance_imports', {
					url: '/maintenance/imports',
					templateUrl: '/views/maintenance/imports.html',
					controller: 'ImportsCtrl'
				})
		})
		.controller('ImportsCtrl',
			function ($scope, $rootScope, $localStorage, $http, $timeout, $interval, StaticData, ImportJobs, Modals, ngToast, API) {

				$scope.static = StaticData;

				$scope.query = {
					max: 20,
					page: 1
				};

				$scope.search = {};

				$scope.refresh = function() {
					ImportJobs.all({$hide_loading_feedback: true, per_page: $scope.query.max, page: $scope.query.page}, function (jobs) {
						$scope.jobs = jobs.data;
						$scope.search = $scope.returnNewSearch(jobs);
						//console.log($scope.search);
					});
				};

				$scope.jobs = {};

				$scope.refresh();

				$scope.newImport = function (type) {
					Modals.show(
						Modals.FileUploader(
							'Nova importação',
							'Selecione o arquivo que deseja importar',
							API.getURI('maintenance/import_jobs/new'), {type: type}
						)
					).then(function (res) {
						ngToast.success('Arquivo pronto para processamento!');
						console.info("[maintenance.imports] Job ready, return: ", res);
						$scope.refresh();
					});
				};

				$scope.processJob = function(job) {
					ImportJobs.process({id: job.id, $hide_loading_feedback: true}, function (res) {
						ngToast.success('Processamento do arquivo concluído!');
						console.info("[maintenance.imports] Job processed, return: ", res);
					});
					$timeout($scope.refresh, 100);
				};

				$scope.renderProgress = function(job) {
					if(job.total_records === 0) return '100 %';
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
(function() {

	angular
		.module('BuscaAtivaEscolar')
		.config(function ($stateProvider) {
			$stateProvider
				.state('sms_conversations', {
					url: '/maintenance/sms_conversations',
					templateUrl: '/views/maintenance/sms_conversations.html',
					controller: 'SmsConversationsCtrl'
				})
		})
		.controller('SmsConversationsCtrl',
			function ($scope, $rootScope, $localStorage, $http, $timeout, $interval, StaticData, SmsConversations, Modals, ngToast, API) {

				$scope.static = StaticData;

				$scope.refresh = function() {
					SmsConversations.all({}, function (conversations) {
						$scope.conversations = conversations;
					});
				};

				$scope.conversations = {};
				$scope.refresh();
			}
		);
})();
(function() {

    angular
        .module('BuscaAtivaEscolar')
        .controller('AddPeriodFrequencyModalCtrl', function AddPeriodFrequencyModalCtrl($scope, $q, $uibModalInstance, message, subtitle, clazz, period, canDismiss, Classes) {

            $scope.message = message;
            $scope.subtitle = subtitle;
            $scope.clazz = clazz;
            $scope.canDismiss = canDismiss;
            $scope.period = period; //periodicidade
            $scope.can_forward = true;

            $scope.addFrequency = function(){
                var splitDate = $scope.getPreviousDate().toISOString().substr(0, 10) + " 00:00:00";
                $scope.clazz.frequencies.unshift({
                    created_at: splitDate,
                    qty_enrollment: 0,
                    qty_presence: 0,
                    classes_id: $scope.clazz.id,
                    periodicidade: $scope.period
                });
            };

            $scope.getPreviousDate = function(){
                var newDate = null;
                switch ( $scope.period ) {
                    case 'Diaria':
                        newDate = $scope.subtractDaysOfDayInstance(new Date($scope.clazz.frequencies[0].created_at), 1);
                        break;
                    case 'Semanal':
                        newDate = $scope.subtractAWeekOfDayInstance(new Date($scope.clazz.frequencies[0].created_at));
                        break;
                    case 'Quinzenal':
                        newDate = $scope.subtractFortnightOfDayInstance(new Date($scope.clazz.frequencies[0].created_at));
                        break;
                    case 'Mensal':
                        newDate = $scope.subtractMonthOfDayInstance(new Date($scope.clazz.frequencies[0].created_at));
                        break;
                }
                return newDate;
            };

            $scope.getlabelNewPeriod = function(){
                var label = '';
                switch ( $scope.period ) {
                    case 'Diaria':
                        label = 'dia';
                        break;
                    case 'Semanal':
                        label = 'semana';
                        break;
                    case 'Quinzenal':
                        label = 'quinzena';
                        break;
                    case 'Mensal':
                        label = 'mês';
                        break;
                }
                return label;
            };

            $scope.getPeriodLabelForNewFrequency = function(date, periodicidade){
                date = new Date(date);
                if(periodicidade == 'Diaria'){
                    var splitDate = date.toISOString().substr(0, 10).split('-');
                    return splitDate[2]+"/"+splitDate[1];
                }

                if(periodicidade == 'Semanal'){
                    var splitDate1 = $scope.subtractDaysOfDayInstance(date, 4).toISOString().substr(0, 10).split('-');
                    var splitDate2 = date.toISOString().substr(0, 10).split('-');
                    return splitDate1[2]+"/"+splitDate1[1] +" até "+ splitDate2[2]+"/"+splitDate2[1];
                }

                if(periodicidade == 'Quinzenal'){
                    var splitDate1 = $scope.subtractFortnightOfDayInstance(date).toISOString().substr(0, 10).split('-');
                    var splitDate2 = date.toISOString().substr(0, 10).split('-');
                    return splitDate1[2]+"/"+splitDate1[1] +" até "+ splitDate2[2]+"/"+splitDate2[1];
                }

                if(periodicidade == 'Mensal'){
                    var splitDate1 = $scope.subtractMonthOfDayInstance(date).toISOString().substr(0, 10).split('-');
                    var splitDate2 = date.toISOString().substr(0, 10).split('-');
                    return splitDate1[2]+"/"+splitDate1[1] +" até "+ splitDate2[2]+"/"+splitDate2[1];
                }
            };

            //subtrair um dia considerando finais de semana
            $scope.subtractDaysOfDayInstance = function(date, days) {
                var copy = new Date(Number(date));
                copy.setDate(date.getDate() - days);
                if( copy.getUTCDay() == 0 ) //domingo
                { copy.setDate(copy.getDate() - 2); }
                if( copy.getUTCDay() == 6 ) //sabado
                { copy.setDate(copy.getDate() - 1); }
                return copy;
            };

            //pega a ultima sexta-feira para periodicidade semanal
            $scope.subtractAWeekOfDayInstance = function(date){
                var lastFriday = new Date(Number(date));
                if(date.getDay() == 5){
                    lastFriday = $scope.subtractDaysOfDayInstance(date, 7);
                }
                while (lastFriday.getDay() != 5){
                    lastFriday = $scope.subtractDaysOfDayInstance(lastFriday, 1);
                }
                return lastFriday;
            };

            //pega o ultimo dia 15 ou dia 1o
            $scope.subtractFortnightOfDayInstance = function(date){
                var date2 = new Date(Number(date));
                if(date.getUTCDate() > 15){
                    date2.setUTCDate(15);
                }else{ //se é de 1 a 15 pega ultima data do mes anterior
                    date2 = new Date(date.getFullYear(), date.getMonth(), 0);
                }
                return date2;
            };

            //menos um mês completo- ultimo dia do mês anterior
            $scope.subtractMonthOfDayInstance = function(date) {
               return new Date(date.getFullYear(), date.getMonth(), 0);
            };

            $scope.agree = function() {
                $scope.can_forward = false;
                Classes.updateFrequencies($scope.clazz.frequencies).$promise
                    .then(function (res) {
                        $scope.can_forward = true;
                        $uibModalInstance.close(true);
                    });
            };

            $scope.disagree = function() {
                $uibModalInstance.dismiss(false);
            };

        });

})();
(function() {

	angular
		.module('BuscaAtivaEscolar')
		.controller('AlertModalCtrl', function AlertModalCtrl($scope, $q, $uibModalInstance, message, details) {

			$scope.message = message;
			$scope.details = details;

			$scope.dismiss = function() {
				$uibModalInstance.dismiss();
			};

		});

})();
(function() {

	angular
		.module('BuscaAtivaEscolar')
		.controller('CaseActivityLogEntryCtrl', function CaseActivityLogEntryCtrl($scope, $q, $uibModalInstance) {

			// TODO: receive case ID, fetch details and show

			//console.log("[modal] case_activity_log_entry");

			$scope.close = function() {
				$uibModalInstance.dismiss(false);
			};

		});

})();
(function() {

	angular
		.module('BuscaAtivaEscolar')
		.controller('CaseCancelModalCtrl', function CaseCancelModalCtrl($scope, $uibModalInstance, StaticData, Language) {

			//console.log("[modal] case_cancel");

			$scope.static = StaticData;
			$scope.lang = Language;
			$scope.reason = null;

			$scope.cancelCase = function() {
				if(!$scope.reason) return;
				$uibModalInstance.close({response: $scope.reason});
			};

			$scope.close = function() {
				$uibModalInstance.dismiss(false);
			}
		});

})();
(function () {

    angular
        .module('BuscaAtivaEscolar')
        .controller('CaseRejectModalCtrl', function CaseRestartModalCtrl($scope, $q, $uibModalInstance) {

            $scope.reject_reason = "";
            $scope.ok = function () {
                if (!$scope.reason) return;
                $uibModalInstance.close(
                    {
                        response:
                            {
                                reason: $scope.reason,
                            }
                    });
            };

            $scope.cancel = function () {
                $uibModalInstance.dismiss(false);
            };

        });

})();
(function() {

	angular
		.module('BuscaAtivaEscolar')
		.controller('CaseReopenModalCtrl', function CaseRestartModalCtrl($scope, $q, $uibModalInstance, $typeUser) {

			//console.log("[modal] case_restart");

			$scope.step = 1;
			$scope.reason = "";
			$scope.typeUser = $typeUser;

			$scope.ok = function() {
				if(!$scope.reason) return;
				$uibModalInstance.close({response: $scope.reason});
			};

			$scope.cancel = function() {
				$uibModalInstance.dismiss(false);
			};

		});

})();
(function () {

    angular
        .module('BuscaAtivaEscolar')
        .controller('CaseTransferModalCtrl', function CaseRestartModalCtrl($scope, $q, $uibModalInstance, $typeUser, StaticData, Identity, Tenants, Users) {

            $scope.step = 1;
            $scope.reason = "";
            $scope.typeUser = $typeUser;
            $scope.tenants = [];

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

            $scope.query = angular.merge({}, $scope.defaultQuery);
            $scope.search = {};
// Todo Criar um serviço para reaproveitar isso
            $scope.getUFs = function () {
                return StaticData.getUFs();
            };

            $scope.refresh = function () {
                $scope.tenants = Tenants.findByUfPublic({'uf': $scope.query.uf});
            };

            $scope.getTenants = function () {
                if (!$scope.tenants || !$scope.tenants.data) return [];
                return $scope.tenants.data;
            };

            $scope.ok = function () {
                if (!$scope.reason) return;
                var city = _.find($scope.tenants.data, {id: $scope.query.tenant_id})
                $uibModalInstance.close(
                    {
                        response:
                            {
                                tenant_id: $scope.query.tenant_id,
                                reason: $scope.reason,
                                city: city
                            }
                    });
            };

            $scope.cancel = function () {
                $uibModalInstance.dismiss(false);
            };

        });

})();
(function() {

	angular
		.module('BuscaAtivaEscolar')
		.controller('ConfirmModalCtrl', function ConfirmModalCtrl($scope, $q, $uibModalInstance, message, details, canDismiss) {

			//console.log("[modal] confirm_modal", message, details, canDismiss);

			$scope.message = message;
			$scope.details = details;
			$scope.canDismiss = canDismiss;

			$scope.agree = function() {
				$uibModalInstance.close(true);
			};

			$scope.disagree = function() {
				$uibModalInstance.dismiss(false);
			};

		});

})();
(function() {

	angular
		.module('BuscaAtivaEscolar')
		.controller('ConfirmEmailModalCtrl', function ConfirmEmailModalCtrl($scope, $q, $uibModalInstance, message, details, schools, canDismiss) {

			$scope.message = message;
			$scope.details = details;
			$scope.schools = schools;
			$scope.canDismiss = canDismiss;

			$scope.agree = function() {
				$uibModalInstance.close(true);
			};

			$scope.disagree = function() {
				$uibModalInstance.dismiss(false);
			};

		});

})();
(function() {

    angular
        .module('BuscaAtivaEscolar')
        .controller('ConfirmLargeModalCtrl', function ConfirmModalCtrl($scope, $q, $uibModalInstance, message, details, canDismiss) {

            $scope.message = message;
            $scope.details = details;
            $scope.canDismiss = canDismiss;

            $scope.agree = function() {
                $uibModalInstance.close(true);
            };

            $scope.disagree = function() {
                $uibModalInstance.dismiss(false);
            };

        });

})();
(function() {

	angular
		.module('BuscaAtivaEscolar')
		.controller('DownloadLinkModalCtrl', function ConfirmModalCtrl($scope, $q, $uibModalInstance, title, message, href) {

			//console.log("[modal] download_link ", title, message, href);

			$scope.title = title;
			$scope.message = message;
			$scope.href = href;

			$scope.back = function() {
				$uibModalInstance.dismiss(false);
			};

		});

})();
(function() {

	angular
		.module('BuscaAtivaEscolar')
		.controller('FileUploaderModalCtrl', function FileUploaderModalCtrl($scope, $q, $uibModalInstance, Auth, API, StaticData, Upload, uploadUrl, uploadParameters, title, message) {

			//console.log("[modal] file_uploader", uploadUrl, uploadParameters, title, message);

			$scope.title = title;
			$scope.message = message;
			$scope.allowedMimeTypes = StaticData.getAllowedMimeTypes().join(",");

			$scope.file = null;
			$scope.progress = 0;
			$scope.isUploading = false;


			$scope.upload = function(file) {
				if(!uploadParameters) uploadParameters = {};
				uploadParameters.file = file;

				$scope.isUploading = true;

				Upload.upload({url: uploadUrl, data: uploadParameters, headers: API.REQUIRE_AUTH}).then(onSuccess, onError, onProgress);

			};

			function onSuccess(res) {
				if(!res.data) return onError(res);

				//console.log('[modal.file_uploader] Uploaded: ', res.config.data.file.name, 'Response: ', res.data);
				$uibModalInstance.close({response: res.data});
				$scope.isUploading = false;
			}

			function onError(res) {
				console.error('[modal.file_uploader] Error when uploading: ', res.status, 'Response: ', res);
				$scope.isUploading = false;
			}

			function onProgress(ev) {
				$scope.progress = (ev.loaded / ev.total);
			}

			$scope.calculateProgressWidth = function() {
				return parseInt(100.0 * $scope.progress) + "%";
			};

			$scope.close = function() {
				$scope.isUploading = false;
				$uibModalInstance.dismiss(false);
			}

		});

})();
(function() {

	angular
		.module('BuscaAtivaEscolar')
		.controller('FileUploaderTituloModalCtrl', function FileUploaderTituloModalCtrl($scope, $q, $uibModalInstance, Auth, API, StaticData, Upload, uploadUrl, uploadParameters, title, message) {

			console.log("[modal] file_uploader titulo", uploadUrl, uploadParameters, title, message);

			$scope.title = title;
			$scope.message = message;
			$scope.allowedMimeTypes = StaticData.getAllowedMimeTypes().join(",");

			$scope.file = null;
			$scope.progress = 0;
			$scope.isUploading = false;


			$scope.upload = function(file) {

				if(!uploadParameters) uploadParameters = {};
				uploadParameters.file = file;
				$scope.isUploading = true;
				Upload.upload({url: uploadUrl, data: uploadParameters, headers: API.OPTIONAL_AUTH}).then(onSuccess, onError, onProgress);
			};

			function onSuccess(res) {
				if(!res.data) return onError(res);

				console.log('[modal.file_uploader] Uploaded: ', res.config.data.file.name, 'Response: ', res.data);
				$uibModalInstance.close({response: res.data});
				$scope.isUploading = false;
			}

			function onError(res) {
				console.error('[modal.file_uploader] Error when uploading: ', res.status, 'Response: ', res);
				$scope.isUploading = false;
			}

			function onProgress(ev) {
				$scope.progress = (ev.loaded / ev.total);
			}

			$scope.calculateProgressWidth = function() {
				return parseInt(100.0 * $scope.progress) + "%";
			};

			$scope.close = function() {
				$scope.isUploading = false;
				$uibModalInstance.dismiss(false);
			}

		});

})();
(function() {

    angular
        .module('BuscaAtivaEscolar')
        .controller('GeneralAlertsModalCtrl', function GeneralAlertsModalCtrl($scope, $q, $uibModalInstance, message, canDismiss) {

            $scope.message = message;
            $scope.canDismiss = canDismiss;

            $scope.agree = function() {
                $uibModalInstance.close(true);
            };

            $scope.disagree = function() {
                $uibModalInstance.dismiss(false);
            };

        });

})();
(function() {

	angular
		.module('BuscaAtivaEscolar')
		.controller('LoginModalCtrl', function LoginModalCtrl($scope, $uibModalInstance, Modals, Identity, Auth, reason, canDismiss) {

			//console.log("[modal] login", reason, canDismiss);

			$scope.email = '';
			$scope.password = '';

			$scope.reason = reason;
			$scope.canDismiss = canDismiss;

            $scope.showPassowrd = function () {
                var field_password = document.getElementById("fld-password");
                field_password.type === "password" ? field_password.type = "text" : field_password.type ="password"
            }

			function onLoggedIn(session) {
				$uibModalInstance.close({response: Identity.getCurrentUser()});
			}

			function onError() {
				Modals.show(Modals.Alert('Usuário ou senha incorretos', 'Por favor, verifique os dados informados e tente novamente.'));
			}

			$scope.login = function() {
				Auth.login($scope.email, $scope.password).then(onLoggedIn, onError);
			};

			$scope.close = function() {
				$uibModalInstance.dismiss(false);
			}

		});

})();
(function() {

	angular
		.module('BuscaAtivaEscolar')
		.controller('NewSupportTicketModalCtrl', function NewSupportTicketModalCtrl($scope, $q, $http, ngToast, Identity, SupportTicket, $uibModalInstance) {

			//console.log("[modal] new_support_ticket_modal");

			$scope.isLoading = false;

			$scope.ticket = {
				name: '',
				city_name: '',
				phone: '',
				email: '',
				message: ''
			};

			$scope.submitTicket = function() {
				$scope.isLoading = true;

				SupportTicket.submit($scope.ticket, function(res) {
					$scope.isLoading = false;

					ngToast.success('Solicitação de suporte enviada com sucesso!');
					$uibModalInstance.close({response: $scope.answer});
				});
				
				return false;
			};

			$scope.cancel = function() {
				$uibModalInstance.dismiss(false);
			};

		});

})();
(function() {

	angular
		.module('BuscaAtivaEscolar')
		.controller('PromptModalCtrl', function PromptModalCtrl($scope, $q, $uibModalInstance, question, defaultAnswer, canDismiss, answerPlaceholder) {

			//console.log("[modal] prompt_modal", question, canDismiss);

			$scope.question = question;
			$scope.answer = defaultAnswer;
			$scope.placeholder = answerPlaceholder;

			$scope.ok = function() {
				$uibModalInstance.close({response: $scope.answer});
			};

			$scope.cancel = function() {
				$uibModalInstance.dismiss(false);
			};

		});

})();
(function() {

	angular
		.module('BuscaAtivaEscolar')
		.controller('UserPickerModalCtrl', function UserPickerModalCtrl($scope, $q, ngToast, $uibModalInstance, title, message, users, canDismiss, noUsersMessage) {

			//console.log("[modal] user_picker", title, message);

			$scope.title = title;
			$scope.message = message;
			$scope.canDismiss = canDismiss;
			$scope.noUsersMessage = noUsersMessage;

			$scope.selectedUser = null;
			$scope.users = users;

			$scope.hasUsers = function() {
				if(!$scope.users) return false;
				return ($scope.users.length > 0);
			};

			$scope.onSelect = function() {
				if(!$scope.selectedUser) {
					ngToast.danger('Você não selecionou nenhum usuário!');
					return;
				}

				$uibModalInstance.close({response: $scope.selectedUser});
			};

			$scope.close = function() {
				$uibModalInstance.dismiss(false);
			}

		});

})();
(function() {

	const app = angular.module('BuscaAtivaEscolar')
		.config(function ($stateProvider) {
			$stateProvider
				.state('forgot_password', {
					url: '/forgot_password',
					templateUrl: '/views/password_reset/begin_password_reset.html',
					controller: 'ForgotPasswordCtrl',
					unauthenticated: true
				})
				.state('password_reset', {
					url: '/password_reset?email&token',
					templateUrl: '/views/password_reset/complete_password_reset.html',
					controller: 'PasswordResetCtrl',
					unauthenticated: true
				})
		})
		.controller('ForgotPasswordCtrl', function ($scope, $state, $stateParams, ngToast, PasswordReset) {

			$scope.email = "";
			$scope.isLoading = false;

			console.info("[password_reset.forgot_password] Begin password reset");

			$scope.requestReset = function() {
				$scope.isLoading = true;

				PasswordReset.begin({email: $scope.email}, function (res) {
					$scope.isLoading = false;

					if(res.status !== 'ok') {
						ngToast.danger("Erro! " + res.reason);
						return;
					}

					ngToast.success("Solicitação de troca realizada com sucesso! Verifique em seu e-mail o link para troca de senha.");
					$state.go('login');
				})
			}

		})
		.controller('PasswordResetCtrl', function ($scope, $state, $stateParams, ngToast, PasswordReset) {

			var resetEmail = $stateParams.email;
			var resetToken = $stateParams.token;

			console.info("[password_reset.password_reset] Complete password reset for ", resetEmail, ", token=", resetToken);
			$scope.email = resetEmail;
			$scope.newPassword = "";
			$scope.newPasswordConfirm = "";
			$scope.isLoading = false;

			$scope.showPassowrd = function () {
				var field_password1 = document.getElementById("fld_password");
				field_password1.type === "password" ? field_password1.type = "text" : field_password1.type = "password";
			};

			$scope.showPassowrd2 = function () {
				var field_password2 = document.getElementById("fld_password_confirm");
				field_password2.type === "password" ? field_password2.type = "text" : field_password2.type = "password";
			};

			$scope.resetPassword = function() {

				if($scope.newPassword !== $scope.newPasswordConfirm) {
					ngToast.danger("A senha e a confirmação de senha devem ser iguais!");
					return;
				}

				$scope.isLoading = true;

				PasswordReset.complete({email: resetEmail, token: resetToken, new_password: $scope.newPassword}, function (res) {
					$scope.isLoading = false;

					if(res.status !== 'ok') {
						ngToast.danger("Ocorreu um erro ao trocar a senha: " + res.reason);
						return;
					}

					ngToast.success("Sua senha foi trocada com sucesso! Você pode efetuar o login com a nova senha agora.");
					$state.go('login');
				});
			}

		});
		app.directive('myDirective', function() {
			return {
					require: 'ngModel',
					link: function(scope, element, attr, mCtrl) {
							function myValidation(value) {
									const capital = document.getElementById('capital');
									const number = document.getElementById('number');
									const length = document.getElementById('length');
									const letter = document.getElementById('letter');
									const symbol = document.getElementById('symbol')
									const check = function(entrada) {
											entrada.classList.remove('invalid');
											entrada.classList.add('valid');
											//mCtrl.$setValidity('charE', true);
									}
									const uncheck = function(entrada) {
											entrada.classList.remove('valid');
											entrada.classList.add('invalid');
									}
									if(typeof(value) === "string"){
											var lowerCaseLetters = /[a-z]/g;
											if (value.match(lowerCaseLetters)) {
													check(letter)
											} else {
													uncheck(letter)
											}
											var upperCaseLetters = /[A-Z]/g;
											if (value.match(upperCaseLetters)) {
													check(capital)
											} else {
													uncheck(capital)
											}
											var numbers = /[0-9]/g;
											if (value.match(numbers)) {
													check(number)
											} else {
													uncheck(number)
											}
											var symbols = /[!@#$%&*?]/g;
											if (value.match(symbols)) {
													check(symbol)
											} else {
													uncheck(symbol)
											}
									// Validate length
											if (value.length >= 8 && value.length <= 16) {
													check(length);
											} else {
													uncheck(length);
											}
									}
									
									/*else {
													mCtrl.$setValidity('charE', false);
											}*/
									return value;
							}
							mCtrl.$parsers.push(myValidation);
					}
			};
	});

})();
(function() {

	angular.module('BuscaAtivaEscolar')
		.config(function ($stateProvider) {
			$stateProvider.state('user_preferences', {
				url: '/user_preferences',
				templateUrl: '/views/preferences/manage_user_preferences.html',
				controller: 'ManageUserPreferencesCtrl'
			})
		})
		.controller('ManageUserPreferencesCtrl', function ($scope, $rootScope, ngToast, Identity, UserPreferences, PasswordReset, StaticData) {

			$scope.static = StaticData;
			$scope.settings = {};

			$scope.refresh = function() {
				UserPreferences.get({}, function (res) {
					$scope.settings = res.settings;
				});
			};

			$scope.save = function() {
				UserPreferences.update({settings: $scope.settings}, $scope.refresh);
			};

			$scope.resetPassword = function() {
				$scope.true = false;

				PasswordReset.begin({email: Identity.getCurrentUser().email}, function (res) {
					$scope.isLoading = false;
					ngToast.success("Solicitação de troca realizada com sucesso! Verifique em seu e-mail o link para troca de senha.");
				})
			};

			$scope.refresh();

		});

})();
(function () {

    angular.module('BuscaAtivaEscolar')
        .config(function ($stateProvider) {
            $stateProvider.state('reports', {
                url: '/reports',
                templateUrl: '/views/reports/reports.html',
                controller: 'ReportViewerCtrl'
            })
        })
        .controller('ReportViewerCtrl', function ($scope, $rootScope, moment, Platform, Modals, Utils, Cities, StaticData, Language, Reports, Identity, Charts, ngToast) {

            $scope.identity = Identity;
            $scope.static = StaticData;
            $scope.lang = Language;
            $scope.ready = false;

            $scope.filters = {};
            $scope.entities = {};
            $scope.views = {};
            $scope.totals = {};
            $scope.fields = {};

            $scope.sort = 'maxToMin';

            $scope.reportData = {};

            $scope.current = {
                entity: 'children',
                dimension: 'cause',
                view: 'chart'
            };

            $scope.avaliable_graph = true;

            $scope.showGraph = function () {
                return $scope.avaliable_graph;
            };

            function onInit() {
                $scope.ready = true;
                
                var lastWeek = moment().subtract(7, 'days').toDate();
                var today = moment().toDate();

                $scope.filters = {
                    //case_status: ['in_progress', 'cancelled', 'completed', 'interrupted', 'transferred'],
                    alert_status: ['accepted'],
                    child_status: ['in_school', 'in_observation', 'out_of_school', 'cancelled', 'interrupted', 'transferred'],
                    age: {from: 0, to: 2000},
                    age_ranges: [
                        '0-3',
                        '4-5',
                        '6-10',
                        '11-14',
                        '15-17',
                        '18',
                    ],
                    age_null: true,
                    //school_last_grade: null,
                    //school_last_grade_null: true,
                    //gender: Utils.pluck(StaticData.getGenders(), 'slug'), //['male', 'female', 'undefined'],
                    //gender_null: true,
                    //race: Utils.pluck(StaticData.getRaces(), 'slug'), //['male', 'female', 'undefined'],
                    //race_null: true,
                    //place_kind: ['rural', 'urban'],
                    //place_kind_null: true
                };

                $scope.entities = {
                    children: {
                        id: 'children',
                        name: 'Crianças e adolescentes',
                        value: 'num_children',
                        entity: 'children',
                        dimensions: ['child_status', 'step_slug', 'age', 'gender', 'parents_income', 'place_kind', 'work_activity', 'case_cause_ids', 'alert_cause_id', 'uf', 'place_uf', 'place_city_id', 'city_id', 'school_last_id', 'race', 'guardian_schooling', 'country_region', 'school_last_grade'],
                        filters: [
                            // 'date',
                            //'case_status',
                            'child_status',
                            'alert_status',
                            //'age_ranges',
                            //'gender',
                            //'place_kind',
                            //'school_last_grade',
                            //'step_slug',
                            'uf',
                            'city',
                            //'case_cause_ids'
                        ],
                        views: ['chart', 'timeline']
                    }
                };

                if (Identity.can('reports.tenants')) {
                    $scope.entities.tenants = {
                        id: 'tenants',
                        name: 'Municípios participantes',
                        value: 'num_tenants',
                        entity: 'tenant',
                        dimensions: ['uf', 'region'],
                        filters: ['uf'],
                        views: ['chart']
                    };
                }

                if (Identity.can('reports.ufs')) {
                    $scope.entities.ufs = {
                        id: 'ufs',
                        name: 'Estados participantes',
                        value: 'num_ufs',
                        entity: 'uf',
                        dimensions: ['uf', 'region'],
                        filters: [],
                        views: ['chart']
                    };
                }

                if (Identity.can('reports.signups')) {
                    $scope.entities.signups = {
                        id: 'signups',
                        name: 'Adesões municipais',
                        value: 'num_signups',
                        entity: 'signup',
                        dimensions: ['month'],
                        filters: [],
                        views: ['timeline']
                    };
                }

                $scope.views = {
                    map: {id: 'map', name: 'Mapa', allowsDimension: false, viewMode: 'linear'},
                    chart: {id: 'chart', name: 'Gráfico', allowsDimension: true, viewMode: 'linear'},
                    timeline: {id: 'timeline', name: 'Linha do tempo', allowsDimension: true, viewMode: 'time_series'}
                };

                $scope.totals = {
                    num_children: 'Número de crianças e adolescentes',
                    num_tenants: 'Número de municípios participantes',
                    num_ufs: 'Número de estados participantes',
                    num_signups: 'Número de adesões municipais',
                    num_alerts: 'Número de alertas',
                    num_assignments: 'Número de casos sob sua responsabilidade'
                };

                $scope.fields = {
                    // period: 'Período',
                    //case_status: 'Status do caso',
                    child_status: 'Status do caso',
                    deadline_status: 'Status do andamento',
                    alert_status: 'Status do alerta',
                    step_slug: 'Etapa do caso',
                    age: 'Faixa etária',
                    age_ranges: 'Faixa etária',
                    gender: 'Sexo',
                    parents_income: 'Faixa de renda familiar',
                    place_kind: 'Zona Rural/ Urbana',
                    work_activity: 'Atividade econômica',
                    case_cause_ids: 'Motivo do Caso',
                    alert_cause_id: 'Motivo do Alerta',
                    school_last_grade: 'Último ano cursado',
                    user_group: 'Grupo do usuário',
                    user_type: 'Tipo do usuário',
                    assigned_user: 'Usuário responsável',
                    parent_scholarity: 'Escolaridade do responsável',
                    place_uf: 'UF da localização da criança',
                    uf: 'UF da adesão',
                    region: 'Região',
                    city_id: 'Município da adesão',
                    place_city_id: 'Município da localização da criança',
                    school_last_id: 'Última escola que frequentou',
                    city: 'Município da adesão',
                    month: 'Mês',
                    race: 'Raça / Etnia',
                    guardian_schooling: 'Escolaridade do responsável',
                    country_region: 'Região geográfica',
                };

                $scope.chartConfig = getChartConfig();

                $scope.refresh();
            };

            $scope.clearFilter = function (name) {
                $scope.filters[name] = null;
            };

			/**
			 * * @param model
			 * Marca e desmarca de forma sincronizada os campos cancelado e interrompido do filtro child_status e case_status
			 */
            $scope.checkChild = function (model) {
                var i = _.findIndex($scope.filters.child_status, function (el) {
                    return el === model;
                });
                if (i !== -1) {
                    $scope.filters.child_status.splice(i, 1);
                } else {
                    $scope.filters.child_status.push(model);
                }
            }

            $scope.refresh = function () {

                if($scope.current.dimension !== 'alert_cause_id'){
                    $scope.filters.alert_status =  ['accepted'];
                }

                // Check if selected view is available in entity
                if ($scope.entities[$scope.current.entity].views.indexOf($scope.current.view) === -1) {
                    $scope.current.view = $scope.current.entity.views[0];
                }

                // Check if selected dimension is available in entity
                var availableDimensions = $scope.entities[$scope.current.entity].dimensions;
                if (availableDimensions.indexOf($scope.current.dimension) === -1) {
                    $scope.current.dimension = availableDimensions[0];
                }

                fetchReportData().then(function (res) {

                    if ($scope.current.view !== "list") {
                        $scope.chartConfig = getChartConfig();
                    }

                    //if response has property named 'tenant' set value to $scope.avaliable_graph
                    if (res.response.hasOwnProperty('tenant')) {
                        $scope.avaliable_graph = res.response.tenant;
                        if ($scope.avaliable_graph == false) ngToast.danger('Este município ainda não fez adesão ao Busca Ativa Escolar!');
                    } else {
                        $scope.avaliable_graph = true;
                    }

                    window.scrollTo(1, 1);

                });

            };

            $scope.exportXLS = function () {
                fetchReportData('xls').then(function (res) {
                    //console.log("Exported: ", res);
                    Modals.show(Modals.DownloadLink('Baixar arquivo XLS', 'Clique no link abaixo para baixar o relatório exportado:', res.download_url));
                })
            };

            function fetchReportData(format) {

                var params = Object.assign({}, $scope.current);
                params.view = $scope.views[$scope.current.view].viewMode;
                params.filters = $scope.filters;
                params.format = (format ? format : 'json');
                
                params.filters.place_city_id = (params.filters.place_city) ? params.filters.place_city.id : null;

                if (params.format === 'xls') {
                    return Reports.query(params).$promise;
                }

                $scope.reportData = Reports.query(params);

                return $scope.reportData.$promise;
            }

            $scope.generateRandomNumber = function (min, max) {
                return min + Math.floor(Math.random() * (max - min));
            };

            $scope.isUFScoped = function () {
                return Identity.getType() === 'gestor_estadual' || Identity.getType() === 'supervisor_estadual';
            };

            $scope.canFilterBy = function (filter_id) {
                if (!$scope.ready) return false;

                if (filter_id === 'date' && $scope.current.view !== 'timeline') {
                    return false;
                }

                // Is filter valid for entity
                if ($scope.entities[$scope.current.entity].filters.indexOf(filter_id) === -1) {
                    return false;
                }

                if (filter_id === 'uf') {
                    return Identity.getType() === 'gestor_nacional'
                        || Identity.getType() === 'superuser'
                        || Identity.getType() === 'visitante_nacional_1'
                        || Identity.getType() === 'visitante_nacional_2'
                        || Identity.getType() === 'visitante_nacional_3'
                        || Identity.getType() === 'visitante_nacional_4'
                }

                if (filter_id === 'city') {
                    return Identity.getType() === 'gestor_nacional'
                        || Identity.getType() === 'superuser'
                        || Identity.getType() === 'gestor_estadual'
                        || Identity.getType() === 'coordenador_estadual'
                        || Identity.getType() === 'supervisor_estadual'
                        || Identity.getType() === 'visitante_nacional_1'
                        || Identity.getType() === 'visitante_nacional_2'
                        || Identity.getType() === 'visitante_nacional_3'
                        || Identity.getType() === 'visitante_nacional_4'
                }

                return true;
            };

            $scope.fetchCities = function (query) {
                var data = {name: query, $hide_loading_feedback: true};
                if ($scope.filters.place_uf) data.uf = $scope.filters.place_uf;
                if ($scope.isUFScoped()) data.uf = Identity.getCurrentUser().uf;

                //console.log("[create_alert] Looking for cities: ", data);

                return Cities.search(data).$promise.then(function (res) {
                    return res.results;
                });
            };

            $scope.renderSelectedCity = function (city) {
                if (!city) return '';
                return city.uf + ' / ' + city.name;
            };

            function getChartConfig() {
                if ($scope.current.view === "chart") return generateDimensionChart($scope.current.entity, $scope.current.dimension);
                if ($scope.current.view === "timeline") return generateTimelineChart($scope.current.entity, $scope.current.dimension);
                return {};
            }

            function generateDimensionChart(entity, dimension) {

                if (!$scope.ready) return false;

                if (!$scope.reportData) return;
                if (!$scope.reportData.$resolved) return;
                if (!$scope.reportData.response) return;
                if (!$scope.reportData.response.report) return;

                var report = $scope.reportData.response.report;
                var seriesName = $scope.reportData.response.seriesName ? $scope.reportData.response.seriesName : $scope.totals[$scope.entities[entity].value];
                var labels = $scope.reportData.labels ? $scope.reportData.labels : {};

                var sortable = [];
                var objSorted = {};
                var finalLabels = {};

                for (var value in report) {
                    sortable.push([value, report[value]]);
                }

                if($scope.sort == 'minToMax'){
                    sortable.sort(function(a, b) {
                        return a[1] - b[1];
                    });
                }

                if($scope.sort == 'maxToMin'){
                    sortable.sort(function(a, b) {
                        return b[1] - a[1];
                    });
                }

                sortable.forEach(function(item){
                    objSorted["_"+item[0]]=item[1]
                });

                for (var key in labels){
                    finalLabels["_"+key] = labels[key];
                }

                return Charts.generateDimensionChart(objSorted, seriesName, finalLabels);
            }

            function generateTimelineChart(entity, dimension) {
                if (!$scope.ready) return false;

                if (!$scope.reportData) return;
                if (!$scope.reportData.$resolved) return;
                if (!$scope.reportData.response) return;
                if (!$scope.reportData.response.report) return;

                var report = $scope.reportData.response.report;
                var chartName = $scope.totals[$scope.entities[entity].value];
                var labels = $scope.reportData.labels ? $scope.reportData.labels : {};

                return Charts.generateTimelineChart(report, chartName, labels);

            }

            $scope.sumValuesOfReportData = function (object) {
                var final_value = 0;
                for (const property in object) {
                    final_value += object[property];
                }
                return final_value;
            };

            $scope.canShowLabel = function(){
                //can't show:
                var permissions = {
                    gestor_nacional: ['school_last_id', 'place_city_id', 'city_id'],
                    coordenador_operacional: ['uf', 'city_id'],
                    gestor_politico: ['uf', 'city_id'],
                    supervisor_institucional: ['uf', 'city_id'],
                    gestor_estadual: ['place_uf'],
                    coordenador_estadual: ['place_uf'],
                    supervisor_estadual: ['place_uf'],

                    visitante_nacional_1: ['school_last_id', 'place_city_id', 'city_id'],
                    visitante_nacional_2: ['school_last_id', 'place_city_id', 'city_id'],
                    visitante_nacional_3: ['school_last_id', 'place_city_id', 'city_id'],
                    visitante_nacional_4: ['school_last_id', 'place_city_id', 'city_id'],

                    visitante_estadual_1: ['place_uf'],
                    visitante_estadual_2: ['place_uf'],
                    visitante_estadual_3: ['place_uf'],
                    visitante_estadual_4: ['place_uf']
                };

                return function (item) {
                   if ( permissions[Identity.getCurrentUser().type].includes(item)){
                        return false;
                   }else{
                       return true;
                   }
                };

            };

            Platform.whenReady(onInit); // Must be the last call, since $scope functions are not hoisted to the top

            $scope.refresByMinToMax = function () {
                $scope.sort = 'minToMax';
                $scope.refresh();
            };

            $scope.refresByMaxToMin = function () {
                $scope.sort = 'maxToMin';
                $scope.refresh();
            }

        });

})();
(function() {

    angular.module('BuscaAtivaEscolar')
        .config(function ($stateProvider) {
            $stateProvider.state('reports_selo', {
                url: '/reports/selo/',
                templateUrl: '/views/reports/reports_selo.html',
                controller: 'ReportSeloViewerCtrl'
            })
        })
        .controller('ReportSeloViewerCtrl', function ($scope, $rootScope, ngToast, API, Config, Platform, Identity, Reports, Tenants, StaticData, Modals) {

            $scope.reports = {};
            $scope.lastOrder = {
                date: null
            };

            $scope.createReport = function() {

                Modals.show(
                    Modals.Confirm(
                        'Confirma a criação de um novo relatório?',
                        'Esse processo pode demorar alguns minutos devido a quantidade de casos registrados na plataforma'
                    )).then(function () {

                        Reports.createReportSelo().$promise
                            .then(function (res) {
                                $scope.lastOrder.date = res.date;
                            });
                });

            };

            $scope.downloadFile = function(file) {
                Identity.provideToken().then(function (token) {
                    window.open(Config.getAPIEndpoint() + 'reports/selo/download?token=' + token + "&file=" + file);
                });
            };

            $scope.refresh = function() {
                $scope.reports = Reports.reportsSelo();
                setInterval(function() {
                    $scope.reports = Reports.reportsSelo();
                }, 600000);
            };

            $scope.refresh();

        });

})();
if (!Array.prototype.find) {
	Object.defineProperty(Array.prototype, 'find', {
		value: function(predicate) {
			// 1. Let O be ? ToObject(this value).
			if (this == null) {
				throw new TypeError('"this" is null or not defined');
			}

			var o = Object(this);

			// 2. Let len be ? ToLength(? Get(O, "length")).
			var len = o.length >>> 0;

			// 3. If IsCallable(predicate) is false, throw a TypeError exception.
			if (typeof predicate !== 'function') {
				throw new TypeError('predicate must be a function');
			}

			// 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
			var thisArg = arguments[1];

			// 5. Let k be 0.
			var k = 0;

			// 6. Repeat, while k < len
			while (k < len) {
				// a. Let Pk be ! ToString(k).
				// b. Let kValue be ? Get(O, Pk).
				// c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
				// d. If testResult is true, return kValue.
				var kValue = o[k];
				if (predicate.call(thisArg, kValue, k, o)) {
					return kValue;
				}
				// e. Increase k by 1.
				k++;
			}

			// 7. Return undefined.
			return undefined;
		}
	});
}
/*!
 * canvg.js - Javascript SVG parser and renderer on Canvas
 * MIT Licensed
 * Gabe Lerner (gabelerner@gmail.com)
 * http://code.google.com/p/canvg/
 *
 * Requires: rgbcolor.js - http://www.phpied.com/rgb-color-parser-in-javascript/
 */
!function () {
    function build() {
        var svg = {};
        return svg.FRAMERATE = 30, svg.MAX_VIRTUAL_PIXELS = 3e4, svg.init = function (ctx) {
            var uniqueId = 0;
            svg.UniqueId = function () {
                return uniqueId++, "canvg" + uniqueId
            }, svg.Definitions = {}, svg.Styles = {}, svg.Animations = [], svg.Images = [], svg.ctx = ctx, svg.ViewPort = new function () {
                this.viewPorts = [], this.Clear = function () {
                    this.viewPorts = []
                }, this.SetCurrent = function (width, height) {
                    this.viewPorts.push({width: width, height: height})
                }, this.RemoveCurrent = function () {
                    this.viewPorts.pop()
                }, this.Current = function () {
                    return this.viewPorts[this.viewPorts.length - 1]
                }, this.width = function () {
                    return this.Current().width
                }, this.height = function () {
                    return this.Current().height
                }, this.ComputeSize = function (d) {
                    return null != d && "number" == typeof d ? d : "x" == d ? this.width() : "y" == d ? this.height() : Math.sqrt(Math.pow(this.width(), 2) + Math.pow(this.height(), 2)) / Math.sqrt(2)
                }
            }
        }, svg.init(), svg.ImagesLoaded = function () {
            for (var i = 0; i < svg.Images.length; i++) if (!svg.Images[i].loaded) return !1;
            return !0
        }, svg.trim = function (s) {
            return s.replace(/^\s+|\s+$/g, "")
        }, svg.compressSpaces = function (s) {
            return s.replace(/[\s\r\t\n]+/gm, " ")
        }, svg.ajax = function (url) {
            var AJAX;
            return AJAX = window.XMLHttpRequest ? new XMLHttpRequest : new ActiveXObject("Microsoft.XMLHTTP"), AJAX ? (AJAX.open("GET", url, !1), AJAX.send(null), AJAX.responseText) : null
        }, svg.parseXml = function (xml) {
            if (window.DOMParser) {
                var parser = new DOMParser;
                return parser.parseFromString(xml, "text/xml")
            }
            xml = xml.replace(/<!DOCTYPE svg[^>]*>/, "");
            var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            return xmlDoc.async = "false", xmlDoc.loadXML(xml), xmlDoc
        }, svg.Property = function (name, value) {
            this.name = name, this.value = value
        }, svg.Property.prototype.getValue = function () {
            return this.value
        }, svg.Property.prototype.hasValue = function () {
            return null != this.value && "" !== this.value
        }, svg.Property.prototype.numValue = function () {
            if (!this.hasValue()) return 0;
            var n = parseFloat(this.value);
            return (this.value + "").match(/%$/) && (n /= 100), n
        }, svg.Property.prototype.valueOrDefault = function (def) {
            return this.hasValue() ? this.value : def
        }, svg.Property.prototype.numValueOrDefault = function (def) {
            return this.hasValue() ? this.numValue() : def
        }, svg.Property.prototype.addOpacity = function (opacity) {
            var newValue = this.value;
            if (null != opacity && "" != opacity && "string" == typeof this.value) {
                var color = new RGBColor(this.value);
                color.ok && (newValue = "rgba(" + color.r + ", " + color.g + ", " + color.b + ", " + opacity + ")")
            }
            return new svg.Property(this.name, newValue)
        }, svg.Property.prototype.getDefinition = function () {
            var name = this.value.match(/#([^\)'"]+)/);
            return name && (name = name[1]), name || (name = this.value), svg.Definitions[name]
        }, svg.Property.prototype.isUrlDefinition = function () {
            return 0 == this.value.indexOf("url(")
        }, svg.Property.prototype.getFillStyleDefinition = function (e, opacityProp) {
            var def = this.getDefinition();
            if (null != def && def.createGradient) return def.createGradient(svg.ctx, e, opacityProp);
            if (null != def && def.createPattern) {
                if (def.getHrefAttribute().hasValue()) {
                    var pt = def.attribute("patternTransform");
                    def = def.getHrefAttribute().getDefinition(), pt.hasValue() && (def.attribute("patternTransform", !0).value = pt.value)
                }
                return def.createPattern(svg.ctx, e)
            }
            return null
        }, svg.Property.prototype.getDPI = function () {
            return 96
        }, svg.Property.prototype.getEM = function (viewPort) {
            var em = 12, fontSize = new svg.Property("fontSize", svg.Font.Parse(svg.ctx.font).fontSize);
            return fontSize.hasValue() && (em = fontSize.toPixels(viewPort)), em
        }, svg.Property.prototype.getUnits = function () {
            var s = this.value + "";
            return s.replace(/[0-9\.\-]/g, "")
        }, svg.Property.prototype.toPixels = function (viewPort, processPercent) {
            if (!this.hasValue()) return 0;
            var s = this.value + "";
            if (s.match(/em$/)) return this.numValue() * this.getEM(viewPort);
            if (s.match(/ex$/)) return this.numValue() * this.getEM(viewPort) / 2;
            if (s.match(/px$/)) return this.numValue();
            if (s.match(/pt$/)) return this.numValue() * this.getDPI(viewPort) * (1 / 72);
            if (s.match(/pc$/)) return 15 * this.numValue();
            if (s.match(/cm$/)) return this.numValue() * this.getDPI(viewPort) / 2.54;
            if (s.match(/mm$/)) return this.numValue() * this.getDPI(viewPort) / 25.4;
            if (s.match(/in$/)) return this.numValue() * this.getDPI(viewPort);
            if (s.match(/%$/)) return this.numValue() * svg.ViewPort.ComputeSize(viewPort);
            var n = this.numValue();
            return processPercent && 1 > n ? n * svg.ViewPort.ComputeSize(viewPort) : n
        }, svg.Property.prototype.toMilliseconds = function () {
            if (!this.hasValue()) return 0;
            var s = this.value + "";
            return s.match(/s$/) ? 1e3 * this.numValue() : (s.match(/ms$/), this.numValue())
        }, svg.Property.prototype.toRadians = function () {
            if (!this.hasValue()) return 0;
            var s = this.value + "";
            return s.match(/deg$/) ? this.numValue() * (Math.PI / 180) : s.match(/grad$/) ? this.numValue() * (Math.PI / 200) : s.match(/rad$/) ? this.numValue() : this.numValue() * (Math.PI / 180)
        }, svg.Font = new function () {
            this.Styles = "normal|italic|oblique|inherit", this.Variants = "normal|small-caps|inherit", this.Weights = "normal|bold|bolder|lighter|100|200|300|400|500|600|700|800|900|inherit", this.CreateFont = function (fontStyle, fontVariant, fontWeight, fontSize, fontFamily, inherit) {
                var f = null != inherit ? this.Parse(inherit) : this.CreateFont("", "", "", "", "", svg.ctx.font);
                return {
                    fontFamily: fontFamily || f.fontFamily,
                    fontSize: fontSize || f.fontSize,
                    fontStyle: fontStyle || f.fontStyle,
                    fontWeight: fontWeight || f.fontWeight,
                    fontVariant: fontVariant || f.fontVariant,
                    toString: function () {
                        return [this.fontStyle, this.fontVariant, this.fontWeight, this.fontSize, this.fontFamily].join(" ")
                    }
                }
            };
            var that = this;
            this.Parse = function (s) {
                for (var f = {}, d = svg.trim(svg.compressSpaces(s || "")).split(" "), set = {
                    fontSize: !1,
                    fontStyle: !1,
                    fontWeight: !1,
                    fontVariant: !1
                }, ff = "", i = 0; i < d.length; i++) set.fontStyle || -1 == that.Styles.indexOf(d[i]) ? set.fontVariant || -1 == that.Variants.indexOf(d[i]) ? set.fontWeight || -1 == that.Weights.indexOf(d[i]) ? set.fontSize ? "inherit" != d[i] && (ff += d[i]) : ("inherit" != d[i] && (f.fontSize = d[i].split("/")[0]), set.fontStyle = set.fontVariant = set.fontWeight = set.fontSize = !0) : ("inherit" != d[i] && (f.fontWeight = d[i]), set.fontStyle = set.fontVariant = set.fontWeight = !0) : ("inherit" != d[i] && (f.fontVariant = d[i]), set.fontStyle = set.fontVariant = !0) : ("inherit" != d[i] && (f.fontStyle = d[i]), set.fontStyle = !0);
                return "" != ff && (f.fontFamily = ff), f
            }
        }, svg.ToNumberArray = function (s) {
            for (var a = svg.trim(svg.compressSpaces((s || "").replace(/,/g, " "))).split(" "), i = 0; i < a.length; i++) a[i] = parseFloat(a[i]);
            return a
        }, svg.Point = function (x, y) {
            this.x = x, this.y = y
        }, svg.Point.prototype.angleTo = function (p) {
            return Math.atan2(p.y - this.y, p.x - this.x)
        }, svg.Point.prototype.applyTransform = function (v) {
            var xp = this.x * v[0] + this.y * v[2] + v[4], yp = this.x * v[1] + this.y * v[3] + v[5];
            this.x = xp, this.y = yp
        }, svg.CreatePoint = function (s) {
            var a = svg.ToNumberArray(s);
            return new svg.Point(a[0], a[1])
        }, svg.CreatePath = function (s) {
            for (var a = svg.ToNumberArray(s), path = [], i = 0; i < a.length; i += 2) path.push(new svg.Point(a[i], a[i + 1]));
            return path
        }, svg.BoundingBox = function (x1, y1, x2, y2) {
            this.x1 = Number.NaN, this.y1 = Number.NaN, this.x2 = Number.NaN, this.y2 = Number.NaN, this.x = function () {
                return this.x1
            }, this.y = function () {
                return this.y1
            }, this.width = function () {
                return this.x2 - this.x1
            }, this.height = function () {
                return this.y2 - this.y1
            }, this.addPoint = function (x, y) {
                null != x && ((isNaN(this.x1) || isNaN(this.x2)) && (this.x1 = x, this.x2 = x), x < this.x1 && (this.x1 = x), x > this.x2 && (this.x2 = x)), null != y && ((isNaN(this.y1) || isNaN(this.y2)) && (this.y1 = y, this.y2 = y), y < this.y1 && (this.y1 = y), y > this.y2 && (this.y2 = y))
            }, this.addX = function (x) {
                this.addPoint(x, null)
            }, this.addY = function (y) {
                this.addPoint(null, y)
            }, this.addBoundingBox = function (bb) {
                this.addPoint(bb.x1, bb.y1), this.addPoint(bb.x2, bb.y2)
            }, this.addQuadraticCurve = function (p0x, p0y, p1x, p1y, p2x, p2y) {
                var cp1x = p0x + 2 / 3 * (p1x - p0x), cp1y = p0y + 2 / 3 * (p1y - p0y),
                    cp2x = cp1x + 1 / 3 * (p2x - p0x), cp2y = cp1y + 1 / 3 * (p2y - p0y);
                this.addBezierCurve(p0x, p0y, cp1x, cp2x, cp1y, cp2y, p2x, p2y)
            }, this.addBezierCurve = function (p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y) {
                var p0 = [p0x, p0y], p1 = [p1x, p1y], p2 = [p2x, p2y], p3 = [p3x, p3y];
                for (this.addPoint(p0[0], p0[1]), this.addPoint(p3[0], p3[1]), i = 0; 1 >= i; i++) {
                    var f = function (t) {
                            return Math.pow(1 - t, 3) * p0[i] + 3 * Math.pow(1 - t, 2) * t * p1[i] + 3 * (1 - t) * Math.pow(t, 2) * p2[i] + Math.pow(t, 3) * p3[i]
                        }, b = 6 * p0[i] - 12 * p1[i] + 6 * p2[i], a = -3 * p0[i] + 9 * p1[i] - 9 * p2[i] + 3 * p3[i],
                        c = 3 * p1[i] - 3 * p0[i];
                    if (0 != a) {
                        var b2ac = Math.pow(b, 2) - 4 * c * a;
                        if (!(0 > b2ac)) {
                            var t1 = (-b + Math.sqrt(b2ac)) / (2 * a);
                            t1 > 0 && 1 > t1 && (0 == i && this.addX(f(t1)), 1 == i && this.addY(f(t1)));
                            var t2 = (-b - Math.sqrt(b2ac)) / (2 * a);
                            t2 > 0 && 1 > t2 && (0 == i && this.addX(f(t2)), 1 == i && this.addY(f(t2)))
                        }
                    } else {
                        if (0 == b) continue;
                        var t = -c / b;
                        t > 0 && 1 > t && (0 == i && this.addX(f(t)), 1 == i && this.addY(f(t)))
                    }
                }
            }, this.isPointInBox = function (x, y) {
                return this.x1 <= x && x <= this.x2 && this.y1 <= y && y <= this.y2
            }, this.addPoint(x1, y1), this.addPoint(x2, y2)
        }, svg.Transform = function (v) {
            var that = this;
            this.Type = {}, this.Type.translate = function (s) {
                this.p = svg.CreatePoint(s), this.apply = function (ctx) {
                    ctx.translate(this.p.x || 0, this.p.y || 0)
                }, this.unapply = function (ctx) {
                    ctx.translate(-1 * this.p.x || 0, -1 * this.p.y || 0)
                }, this.applyToPoint = function (p) {
                    p.applyTransform([1, 0, 0, 1, this.p.x || 0, this.p.y || 0])
                }
            }, this.Type.rotate = function (s) {
                var a = svg.ToNumberArray(s);
                this.angle = new svg.Property("angle", a[0]), this.cx = a[1] || 0, this.cy = a[2] || 0, this.apply = function (ctx) {
                    ctx.translate(this.cx, this.cy), ctx.rotate(this.angle.toRadians()), ctx.translate(-this.cx, -this.cy)
                }, this.unapply = function (ctx) {
                    ctx.translate(this.cx, this.cy), ctx.rotate(-1 * this.angle.toRadians()), ctx.translate(-this.cx, -this.cy)
                }, this.applyToPoint = function (p) {
                    var a = this.angle.toRadians();
                    p.applyTransform([1, 0, 0, 1, this.p.x || 0, this.p.y || 0]), p.applyTransform([Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), 0, 0]), p.applyTransform([1, 0, 0, 1, -this.p.x || 0, -this.p.y || 0])
                }
            }, this.Type.scale = function (s) {
                this.p = svg.CreatePoint(s), this.apply = function (ctx) {
                    ctx.scale(this.p.x || 1, this.p.y || this.p.x || 1)
                }, this.unapply = function (ctx) {
                    ctx.scale(1 / this.p.x || 1, 1 / this.p.y || this.p.x || 1)
                }, this.applyToPoint = function (p) {
                    p.applyTransform([this.p.x || 0, 0, 0, this.p.y || 0, 0, 0])
                }
            }, this.Type.matrix = function (s) {
                this.m = svg.ToNumberArray(s), this.apply = function (ctx) {
                    ctx.transform(this.m[0], this.m[1], this.m[2], this.m[3], this.m[4], this.m[5])
                }, this.applyToPoint = function (p) {
                    p.applyTransform(this.m)
                }
            }, this.Type.SkewBase = function (s) {
                this.base = that.Type.matrix, this.base(s), this.angle = new svg.Property("angle", s)
            }, this.Type.SkewBase.prototype = new this.Type.matrix, this.Type.skewX = function (s) {
                this.base = that.Type.SkewBase, this.base(s), this.m = [1, 0, Math.tan(this.angle.toRadians()), 1, 0, 0]
            }, this.Type.skewX.prototype = new this.Type.SkewBase, this.Type.skewY = function (s) {
                this.base = that.Type.SkewBase, this.base(s), this.m = [1, Math.tan(this.angle.toRadians()), 0, 1, 0, 0]
            }, this.Type.skewY.prototype = new this.Type.SkewBase, this.transforms = [], this.apply = function (ctx) {
                for (var i = 0; i < this.transforms.length; i++) this.transforms[i].apply(ctx)
            }, this.unapply = function (ctx) {
                for (var i = this.transforms.length - 1; i >= 0; i--) this.transforms[i].unapply(ctx)
            }, this.applyToPoint = function (p) {
                for (var i = 0; i < this.transforms.length; i++) this.transforms[i].applyToPoint(p)
            };
            for (var data = svg.trim(svg.compressSpaces(v)).replace(/\)(\s?,\s?)/g, ") ").split(/\s(?=[a-z])/), i = 0; i < data.length; i++) {
                var type = svg.trim(data[i].split("(")[0]), s = data[i].split("(")[1].replace(")", ""),
                    transform = new this.Type[type](s);
                transform.type = type, this.transforms.push(transform)
            }
        }, svg.AspectRatio = function (ctx, aspectRatio, width, desiredWidth, height, desiredHeight, minX, minY, refX, refY) {
            aspectRatio = svg.compressSpaces(aspectRatio), aspectRatio = aspectRatio.replace(/^defer\s/, "");
            var align = aspectRatio.split(" ")[0] || "xMidYMid", meetOrSlice = aspectRatio.split(" ")[1] || "meet",
                scaleX = width / desiredWidth, scaleY = height / desiredHeight, scaleMin = Math.min(scaleX, scaleY),
                scaleMax = Math.max(scaleX, scaleY);
            "meet" == meetOrSlice && (desiredWidth *= scaleMin, desiredHeight *= scaleMin), "slice" == meetOrSlice && (desiredWidth *= scaleMax, desiredHeight *= scaleMax), refX = new svg.Property("refX", refX), refY = new svg.Property("refY", refY), refX.hasValue() && refY.hasValue() ? ctx.translate(-scaleMin * refX.toPixels("x"), -scaleMin * refY.toPixels("y")) : (align.match(/^xMid/) && ("meet" == meetOrSlice && scaleMin == scaleY || "slice" == meetOrSlice && scaleMax == scaleY) && ctx.translate(width / 2 - desiredWidth / 2, 0), align.match(/YMid$/) && ("meet" == meetOrSlice && scaleMin == scaleX || "slice" == meetOrSlice && scaleMax == scaleX) && ctx.translate(0, height / 2 - desiredHeight / 2), align.match(/^xMax/) && ("meet" == meetOrSlice && scaleMin == scaleY || "slice" == meetOrSlice && scaleMax == scaleY) && ctx.translate(width - desiredWidth, 0), align.match(/YMax$/) && ("meet" == meetOrSlice && scaleMin == scaleX || "slice" == meetOrSlice && scaleMax == scaleX) && ctx.translate(0, height - desiredHeight)), "none" == align ? ctx.scale(scaleX, scaleY) : "meet" == meetOrSlice ? ctx.scale(scaleMin, scaleMin) : "slice" == meetOrSlice && ctx.scale(scaleMax, scaleMax), ctx.translate(null == minX ? 0 : -minX, null == minY ? 0 : -minY)
        }, svg.Element = {}, svg.EmptyProperty = new svg.Property("EMPTY", ""), svg.Element.ElementBase = function (node) {
            if (this.attributes = {}, this.styles = {}, this.children = [], this.attribute = function (name, createIfNotExists) {
                var a = this.attributes[name];
                return null != a ? a : (1 == createIfNotExists && (a = new svg.Property(name, ""), this.attributes[name] = a), a || svg.EmptyProperty)
            }, this.getHrefAttribute = function () {
                for (var a in this.attributes) if (a.match(/:href$/)) return this.attributes[a];
                return svg.EmptyProperty
            }, this.style = function (name, createIfNotExists) {
                var s = this.styles[name];
                if (null != s) return s;
                var a = this.attribute(name);
                if (null != a && a.hasValue()) return this.styles[name] = a, a;
                var p = this.parent;
                if (null != p) {
                    var ps = p.style(name);
                    if (null != ps && ps.hasValue()) return ps
                }
                return 1 == createIfNotExists && (s = new svg.Property(name, ""), this.styles[name] = s), s || svg.EmptyProperty
            }, this.render = function (ctx) {
                if ("none" != this.style("display").value && "hidden" != this.attribute("visibility").value) {
                    if (ctx.save(), this.attribute("mask").hasValue()) {
                        var mask = this.attribute("mask").getDefinition();
                        null != mask && mask.apply(ctx, this)
                    } else if (this.style("filter").hasValue()) {
                        var filter = this.style("filter").getDefinition();
                        null != filter && filter.apply(ctx, this)
                    } else this.setContext(ctx), this.renderChildren(ctx), this.clearContext(ctx);
                    ctx.restore()
                }
            }, this.setContext = function () {
            }, this.clearContext = function () {
            }, this.renderChildren = function (ctx) {
                for (var i = 0; i < this.children.length; i++) this.children[i].render(ctx)
            }, this.addChild = function (childNode, create) {
                var child = childNode;
                create && (child = svg.CreateElement(childNode)), child.parent = this, this.children.push(child)
            }, null != node && 1 == node.nodeType) {
                for (var i = 0; i < node.childNodes.length; i++) {
                    var childNode = node.childNodes[i];
                    if (1 == childNode.nodeType && this.addChild(childNode, !0), this.captureTextNodes && 3 == childNode.nodeType) {
                        var text = childNode.nodeValue || childNode.text || "";
                        "" != svg.trim(svg.compressSpaces(text)) && this.addChild(new svg.Element.tspan(childNode), !1)
                    }
                }
                for (var i = 0; i < node.attributes.length; i++) {
                    var attribute = node.attributes[i];
                    this.attributes[attribute.nodeName] = new svg.Property(attribute.nodeName, attribute.nodeValue)
                }
                var styles = svg.Styles[node.nodeName];
                if (null != styles) for (var name in styles) this.styles[name] = styles[name];
                if (this.attribute("class").hasValue()) for (var classes = svg.compressSpaces(this.attribute("class").value).split(" "), j = 0; j < classes.length; j++) {
                    if (styles = svg.Styles["." + classes[j]], null != styles) for (var name in styles) this.styles[name] = styles[name];
                    if (styles = svg.Styles[node.nodeName + "." + classes[j]], null != styles) for (var name in styles) this.styles[name] = styles[name]
                }
                if (this.attribute("id").hasValue()) {
                    var styles = svg.Styles["#" + this.attribute("id").value];
                    if (null != styles) for (var name in styles) this.styles[name] = styles[name]
                }
                if (this.attribute("style").hasValue()) for (var styles = this.attribute("style").value.split(";"), i = 0; i < styles.length; i++) if ("" != svg.trim(styles[i])) {
                    var style = styles[i].split(":"), name = svg.trim(style[0]), value = svg.trim(style[1]);
                    this.styles[name] = new svg.Property(name, value)
                }
                this.attribute("id").hasValue() && null == svg.Definitions[this.attribute("id").value] && (svg.Definitions[this.attribute("id").value] = this)
            }
        }, svg.Element.RenderedElementBase = function (node) {
            this.base = svg.Element.ElementBase, this.base(node), this.setContext = function (ctx) {
                if (this.style("fill").isUrlDefinition()) {
                    var fs = this.style("fill").getFillStyleDefinition(this, this.style("fill-opacity"));
                    null != fs && (ctx.fillStyle = fs)
                } else if (this.style("fill").hasValue()) {
                    var fillStyle = this.style("fill");
                    "currentColor" == fillStyle.value && (fillStyle.value = this.style("color").value), ctx.fillStyle = "none" == fillStyle.value ? "rgba(0,0,0,0)" : fillStyle.value
                }
                if (this.style("fill-opacity").hasValue()) {
                    var fillStyle = new svg.Property("fill", ctx.fillStyle);
                    fillStyle = fillStyle.addOpacity(this.style("fill-opacity").value), ctx.fillStyle = fillStyle.value
                }
                if (this.style("stroke").isUrlDefinition()) {
                    var fs = this.style("stroke").getFillStyleDefinition(this, this.style("stroke-opacity"));
                    null != fs && (ctx.strokeStyle = fs)
                } else if (this.style("stroke").hasValue()) {
                    var strokeStyle = this.style("stroke");
                    "currentColor" == strokeStyle.value && (strokeStyle.value = this.style("color").value), ctx.strokeStyle = "none" == strokeStyle.value ? "rgba(0,0,0,0)" : strokeStyle.value
                }
                if (this.style("stroke-opacity").hasValue()) {
                    var strokeStyle = new svg.Property("stroke", ctx.strokeStyle);
                    strokeStyle = strokeStyle.addOpacity(this.style("stroke-opacity").value), ctx.strokeStyle = strokeStyle.value
                }
                if (this.style("stroke-width").hasValue()) {
                    var newLineWidth = this.style("stroke-width").toPixels();
                    ctx.lineWidth = 0 == newLineWidth ? .001 : newLineWidth
                }
                if (this.style("stroke-linecap").hasValue() && (ctx.lineCap = this.style("stroke-linecap").value), this.style("stroke-linejoin").hasValue() && (ctx.lineJoin = this.style("stroke-linejoin").value), this.style("stroke-miterlimit").hasValue() && (ctx.miterLimit = this.style("stroke-miterlimit").value), this.style("stroke-dasharray").hasValue()) {
                    var gaps = svg.ToNumberArray(this.style("stroke-dasharray").value);
                    "undefined" != typeof ctx.setLineDash ? ctx.setLineDash(gaps) : "undefined" != typeof ctx.webkitLineDash ? ctx.webkitLineDash = gaps : "undefined" != typeof ctx.mozDash && (ctx.mozDash = gaps);
                    var offset = this.style("stroke-dashoffset").numValueOrDefault(1);
                    "undefined" != typeof ctx.lineDashOffset ? ctx.lineDashOffset = offset : "undefined" != typeof ctx.webkitLineDashOffset ? ctx.webkitLineDashOffset = offset : "undefined" != typeof ctx.mozDashOffset && (ctx.mozDashOffset = offset)
                }
                if ("undefined" != typeof ctx.font && (ctx.font = svg.Font.CreateFont(this.style("font-style").value, this.style("font-variant").value, this.style("font-weight").value, this.style("font-size").hasValue() ? this.style("font-size").toPixels() + "px" : "", this.style("font-family").value).toString()), this.attribute("transform").hasValue()) {
                    var transform = new svg.Transform(this.attribute("transform").value);
                    transform.apply(ctx)
                }
                if (this.style("clip-path").hasValue()) {
                    var clip = this.style("clip-path").getDefinition();
                    null != clip && clip.apply(ctx)
                }
                this.style("opacity").hasValue() && (ctx.globalAlpha = this.style("opacity").numValue())
            }
        }, svg.Element.RenderedElementBase.prototype = new svg.Element.ElementBase, svg.Element.PathElementBase = function (node) {
            this.base = svg.Element.RenderedElementBase, this.base(node), this.path = function (ctx) {
                return null != ctx && ctx.beginPath(), new svg.BoundingBox
            }, this.renderChildren = function (ctx) {
                this.path(ctx), svg.Mouse.checkPath(this, ctx), "" != ctx.fillStyle && (this.attribute("fill-rule").hasValue() ? ctx.fill(this.attribute("fill-rule").value) : ctx.fill()), "" != ctx.strokeStyle && ctx.stroke();
                var markers = this.getMarkers();
                if (null != markers) {
                    if (this.style("marker-start").isUrlDefinition()) {
                        var marker = this.style("marker-start").getDefinition();
                        marker.render(ctx, markers[0][0], markers[0][1])
                    }
                    if (this.style("marker-mid").isUrlDefinition()) for (var marker = this.style("marker-mid").getDefinition(), i = 1; i < markers.length - 1; i++) marker.render(ctx, markers[i][0], markers[i][1]);
                    if (this.style("marker-end").isUrlDefinition()) {
                        var marker = this.style("marker-end").getDefinition();
                        marker.render(ctx, markers[markers.length - 1][0], markers[markers.length - 1][1])
                    }
                }
            }, this.getBoundingBox = function () {
                return this.path()
            }, this.getMarkers = function () {
                return null
            }
        }, svg.Element.PathElementBase.prototype = new svg.Element.RenderedElementBase, svg.Element.svg = function (node) {
            this.base = svg.Element.RenderedElementBase, this.base(node), this.baseClearContext = this.clearContext, this.clearContext = function (ctx) {
                this.baseClearContext(ctx), svg.ViewPort.RemoveCurrent()
            }, this.baseSetContext = this.setContext, this.setContext = function (ctx) {
                ctx.strokeStyle = "rgba(0,0,0,0)", ctx.lineCap = "butt", ctx.lineJoin = "miter", ctx.miterLimit = 4, this.baseSetContext(ctx), this.attribute("x").hasValue() || (this.attribute("x", !0).value = 0), this.attribute("y").hasValue() || (this.attribute("y", !0).value = 0), ctx.translate(this.attribute("x").toPixels("x"), this.attribute("y").toPixels("y"));
                var width = svg.ViewPort.width(), height = svg.ViewPort.height();
                if (this.attribute("width").hasValue() || (this.attribute("width", !0).value = "100%"), this.attribute("height").hasValue() || (this.attribute("height", !0).value = "100%"), "undefined" == typeof this.root) {
                    width = this.attribute("width").toPixels("x"), height = this.attribute("height").toPixels("y");
                    var x = 0, y = 0;
                    this.attribute("refX").hasValue() && this.attribute("refY").hasValue() && (x = -this.attribute("refX").toPixels("x"), y = -this.attribute("refY").toPixels("y")), ctx.beginPath(), ctx.moveTo(x, y), ctx.lineTo(width, y), ctx.lineTo(width, height), ctx.lineTo(x, height), ctx.closePath(), ctx.clip()
                }
                if (svg.ViewPort.SetCurrent(width, height), this.attribute("viewBox").hasValue()) {
                    var viewBox = svg.ToNumberArray(this.attribute("viewBox").value), minX = viewBox[0],
                        minY = viewBox[1];
                    width = viewBox[2], height = viewBox[3], svg.AspectRatio(ctx, this.attribute("preserveAspectRatio").value, svg.ViewPort.width(), width, svg.ViewPort.height(), height, minX, minY, this.attribute("refX").value, this.attribute("refY").value), svg.ViewPort.RemoveCurrent(), svg.ViewPort.SetCurrent(viewBox[2], viewBox[3])
                }
            }
        }, svg.Element.svg.prototype = new svg.Element.RenderedElementBase, svg.Element.rect = function (node) {
            this.base = svg.Element.PathElementBase, this.base(node), this.path = function (ctx) {
                var x = this.attribute("x").toPixels("x"), y = this.attribute("y").toPixels("y"),
                    width = this.attribute("width").toPixels("x"), height = this.attribute("height").toPixels("y"),
                    rx = this.attribute("rx").toPixels("x"), ry = this.attribute("ry").toPixels("y");
                return this.attribute("rx").hasValue() && !this.attribute("ry").hasValue() && (ry = rx), this.attribute("ry").hasValue() && !this.attribute("rx").hasValue() && (rx = ry), rx = Math.min(rx, width / 2), ry = Math.min(ry, height / 2), null != ctx && (ctx.beginPath(), ctx.moveTo(x + rx, y), ctx.lineTo(x + width - rx, y), ctx.quadraticCurveTo(x + width, y, x + width, y + ry), ctx.lineTo(x + width, y + height - ry), ctx.quadraticCurveTo(x + width, y + height, x + width - rx, y + height), ctx.lineTo(x + rx, y + height), ctx.quadraticCurveTo(x, y + height, x, y + height - ry), ctx.lineTo(x, y + ry), ctx.quadraticCurveTo(x, y, x + rx, y), ctx.closePath()), new svg.BoundingBox(x, y, x + width, y + height)
            }
        }, svg.Element.rect.prototype = new svg.Element.PathElementBase, svg.Element.circle = function (node) {
            this.base = svg.Element.PathElementBase, this.base(node), this.path = function (ctx) {
                var cx = this.attribute("cx").toPixels("x"), cy = this.attribute("cy").toPixels("y"),
                    r = this.attribute("r").toPixels();
                return null != ctx && (ctx.beginPath(), ctx.arc(cx, cy, r, 0, 2 * Math.PI, !0), ctx.closePath()), new svg.BoundingBox(cx - r, cy - r, cx + r, cy + r)
            }
        }, svg.Element.circle.prototype = new svg.Element.PathElementBase, svg.Element.ellipse = function (node) {
            this.base = svg.Element.PathElementBase, this.base(node), this.path = function (ctx) {
                var KAPPA = 4 * ((Math.sqrt(2) - 1) / 3), rx = this.attribute("rx").toPixels("x"),
                    ry = this.attribute("ry").toPixels("y"), cx = this.attribute("cx").toPixels("x"),
                    cy = this.attribute("cy").toPixels("y");
                return null != ctx && (ctx.beginPath(), ctx.moveTo(cx, cy - ry), ctx.bezierCurveTo(cx + KAPPA * rx, cy - ry, cx + rx, cy - KAPPA * ry, cx + rx, cy), ctx.bezierCurveTo(cx + rx, cy + KAPPA * ry, cx + KAPPA * rx, cy + ry, cx, cy + ry), ctx.bezierCurveTo(cx - KAPPA * rx, cy + ry, cx - rx, cy + KAPPA * ry, cx - rx, cy), ctx.bezierCurveTo(cx - rx, cy - KAPPA * ry, cx - KAPPA * rx, cy - ry, cx, cy - ry), ctx.closePath()), new svg.BoundingBox(cx - rx, cy - ry, cx + rx, cy + ry)
            }
        }, svg.Element.ellipse.prototype = new svg.Element.PathElementBase, svg.Element.line = function (node) {
            this.base = svg.Element.PathElementBase, this.base(node), this.getPoints = function () {
                return [new svg.Point(this.attribute("x1").toPixels("x"), this.attribute("y1").toPixels("y")), new svg.Point(this.attribute("x2").toPixels("x"), this.attribute("y2").toPixels("y"))]
            }, this.path = function (ctx) {
                var points = this.getPoints();
                return null != ctx && (ctx.beginPath(), ctx.moveTo(points[0].x, points[0].y), ctx.lineTo(points[1].x, points[1].y)), new svg.BoundingBox(points[0].x, points[0].y, points[1].x, points[1].y)
            }, this.getMarkers = function () {
                var points = this.getPoints(), a = points[0].angleTo(points[1]);
                return [[points[0], a], [points[1], a]]
            }
        }, svg.Element.line.prototype = new svg.Element.PathElementBase, svg.Element.polyline = function (node) {
            this.base = svg.Element.PathElementBase, this.base(node), this.points = svg.CreatePath(this.attribute("points").value), this.path = function (ctx) {
                var bb = new svg.BoundingBox(this.points[0].x, this.points[0].y);
                null != ctx && (ctx.beginPath(), ctx.moveTo(this.points[0].x, this.points[0].y));
                for (var i = 1; i < this.points.length; i++) bb.addPoint(this.points[i].x, this.points[i].y), null != ctx && ctx.lineTo(this.points[i].x, this.points[i].y);
                return bb
            }, this.getMarkers = function () {
                for (var markers = [], i = 0; i < this.points.length - 1; i++) markers.push([this.points[i], this.points[i].angleTo(this.points[i + 1])]);
                return markers.push([this.points[this.points.length - 1], markers[markers.length - 1][1]]), markers
            }
        }, svg.Element.polyline.prototype = new svg.Element.PathElementBase, svg.Element.polygon = function (node) {
            this.base = svg.Element.polyline, this.base(node), this.basePath = this.path, this.path = function (ctx) {
                var bb = this.basePath(ctx);
                return null != ctx && (ctx.lineTo(this.points[0].x, this.points[0].y), ctx.closePath()), bb
            }
        }, svg.Element.polygon.prototype = new svg.Element.polyline, svg.Element.path = function (node) {
            this.base = svg.Element.PathElementBase, this.base(node);
            var d = this.attribute("d").value;
            d = d.replace(/,/gm, " "), d = d.replace(/([MmZzLlHhVvCcSsQqTtAa])([MmZzLlHhVvCcSsQqTtAa])/gm, "$1 $2"), d = d.replace(/([MmZzLlHhVvCcSsQqTtAa])([MmZzLlHhVvCcSsQqTtAa])/gm, "$1 $2"), d = d.replace(/([MmZzLlHhVvCcSsQqTtAa])([^\s])/gm, "$1 $2"), d = d.replace(/([^\s])([MmZzLlHhVvCcSsQqTtAa])/gm, "$1 $2"), d = d.replace(/([0-9])([+\-])/gm, "$1 $2"), d = d.replace(/(\.[0-9]*)(\.)/gm, "$1 $2"), d = d.replace(/([Aa](\s+[0-9]+){3})\s+([01])\s*([01])/gm, "$1 $3 $4 "), d = svg.compressSpaces(d), d = svg.trim(d), this.PathParser = new function (d) {
                this.tokens = d.split(" "), this.reset = function () {
                    this.i = -1, this.command = "", this.previousCommand = "", this.start = new svg.Point(0, 0), this.control = new svg.Point(0, 0), this.current = new svg.Point(0, 0), this.points = [], this.angles = []
                }, this.isEnd = function () {
                    return this.i >= this.tokens.length - 1
                }, this.isCommandOrEnd = function () {
                    return this.isEnd() ? !0 : null != this.tokens[this.i + 1].match(/^[A-Za-z]$/)
                }, this.isRelativeCommand = function () {
                    switch (this.command) {
                        case"m":
                        case"l":
                        case"h":
                        case"v":
                        case"c":
                        case"s":
                        case"q":
                        case"t":
                        case"a":
                        case"z":
                            return !0
                    }
                    return !1
                }, this.getToken = function () {
                    return this.i++, this.tokens[this.i]
                }, this.getScalar = function () {
                    return parseFloat(this.getToken())
                }, this.nextCommand = function () {
                    this.previousCommand = this.command, this.command = this.getToken()
                }, this.getPoint = function () {
                    var p = new svg.Point(this.getScalar(), this.getScalar());
                    return this.makeAbsolute(p)
                }, this.getAsControlPoint = function () {
                    var p = this.getPoint();
                    return this.control = p, p
                }, this.getAsCurrentPoint = function () {
                    var p = this.getPoint();
                    return this.current = p, p
                }, this.getReflectedControlPoint = function () {
                    if ("c" != this.previousCommand.toLowerCase() && "s" != this.previousCommand.toLowerCase() && "q" != this.previousCommand.toLowerCase() && "t" != this.previousCommand.toLowerCase()) return this.current;
                    var p = new svg.Point(2 * this.current.x - this.control.x, 2 * this.current.y - this.control.y);
                    return p
                }, this.makeAbsolute = function (p) {
                    return this.isRelativeCommand() && (p.x += this.current.x, p.y += this.current.y), p
                }, this.addMarker = function (p, from, priorTo) {
                    null != priorTo && this.angles.length > 0 && null == this.angles[this.angles.length - 1] && (this.angles[this.angles.length - 1] = this.points[this.points.length - 1].angleTo(priorTo)), this.addMarkerAngle(p, null == from ? null : from.angleTo(p))
                }, this.addMarkerAngle = function (p, a) {
                    this.points.push(p), this.angles.push(a)
                }, this.getMarkerPoints = function () {
                    return this.points
                }, this.getMarkerAngles = function () {
                    for (var i = 0; i < this.angles.length; i++) if (null == this.angles[i]) for (var j = i + 1; j < this.angles.length; j++) if (null != this.angles[j]) {
                        this.angles[i] = this.angles[j];
                        break
                    }
                    return this.angles
                }
            }(d), this.path = function (ctx) {
                var pp = this.PathParser;
                pp.reset();
                var bb = new svg.BoundingBox;
                for (null != ctx && ctx.beginPath(); !pp.isEnd();) switch (pp.nextCommand(), pp.command) {
                    case"M":
                    case"m":
                        var p = pp.getAsCurrentPoint();
                        for (pp.addMarker(p), bb.addPoint(p.x, p.y), null != ctx && ctx.moveTo(p.x, p.y), pp.start = pp.current; !pp.isCommandOrEnd();) {
                            var p = pp.getAsCurrentPoint();
                            pp.addMarker(p, pp.start), bb.addPoint(p.x, p.y), null != ctx && ctx.lineTo(p.x, p.y)
                        }
                        break;
                    case"L":
                    case"l":
                        for (; !pp.isCommandOrEnd();) {
                            var c = pp.current, p = pp.getAsCurrentPoint();
                            pp.addMarker(p, c), bb.addPoint(p.x, p.y), null != ctx && ctx.lineTo(p.x, p.y)
                        }
                        break;
                    case"H":
                    case"h":
                        for (; !pp.isCommandOrEnd();) {
                            var newP = new svg.Point((pp.isRelativeCommand() ? pp.current.x : 0) + pp.getScalar(), pp.current.y);
                            pp.addMarker(newP, pp.current), pp.current = newP, bb.addPoint(pp.current.x, pp.current.y), null != ctx && ctx.lineTo(pp.current.x, pp.current.y)
                        }
                        break;
                    case"V":
                    case"v":
                        for (; !pp.isCommandOrEnd();) {
                            var newP = new svg.Point(pp.current.x, (pp.isRelativeCommand() ? pp.current.y : 0) + pp.getScalar());
                            pp.addMarker(newP, pp.current), pp.current = newP, bb.addPoint(pp.current.x, pp.current.y), null != ctx && ctx.lineTo(pp.current.x, pp.current.y)
                        }
                        break;
                    case"C":
                    case"c":
                        for (; !pp.isCommandOrEnd();) {
                            var curr = pp.current, p1 = pp.getPoint(), cntrl = pp.getAsControlPoint(),
                                cp = pp.getAsCurrentPoint();
                            pp.addMarker(cp, cntrl, p1), bb.addBezierCurve(curr.x, curr.y, p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y), null != ctx && ctx.bezierCurveTo(p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y)
                        }
                        break;
                    case"S":
                    case"s":
                        for (; !pp.isCommandOrEnd();) {
                            var curr = pp.current, p1 = pp.getReflectedControlPoint(), cntrl = pp.getAsControlPoint(),
                                cp = pp.getAsCurrentPoint();
                            pp.addMarker(cp, cntrl, p1), bb.addBezierCurve(curr.x, curr.y, p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y), null != ctx && ctx.bezierCurveTo(p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y)
                        }
                        break;
                    case"Q":
                    case"q":
                        for (; !pp.isCommandOrEnd();) {
                            var curr = pp.current, cntrl = pp.getAsControlPoint(), cp = pp.getAsCurrentPoint();
                            pp.addMarker(cp, cntrl, cntrl), bb.addQuadraticCurve(curr.x, curr.y, cntrl.x, cntrl.y, cp.x, cp.y), null != ctx && ctx.quadraticCurveTo(cntrl.x, cntrl.y, cp.x, cp.y)
                        }
                        break;
                    case"T":
                    case"t":
                        for (; !pp.isCommandOrEnd();) {
                            var curr = pp.current, cntrl = pp.getReflectedControlPoint();
                            pp.control = cntrl;
                            var cp = pp.getAsCurrentPoint();
                            pp.addMarker(cp, cntrl, cntrl), bb.addQuadraticCurve(curr.x, curr.y, cntrl.x, cntrl.y, cp.x, cp.y), null != ctx && ctx.quadraticCurveTo(cntrl.x, cntrl.y, cp.x, cp.y)
                        }
                        break;
                    case"A":
                    case"a":
                        for (; !pp.isCommandOrEnd();) {
                            var curr = pp.current, rx = pp.getScalar(), ry = pp.getScalar(),
                                xAxisRotation = pp.getScalar() * (Math.PI / 180), largeArcFlag = pp.getScalar(),
                                sweepFlag = pp.getScalar(), cp = pp.getAsCurrentPoint(),
                                currp = new svg.Point(Math.cos(xAxisRotation) * (curr.x - cp.x) / 2 + Math.sin(xAxisRotation) * (curr.y - cp.y) / 2, -Math.sin(xAxisRotation) * (curr.x - cp.x) / 2 + Math.cos(xAxisRotation) * (curr.y - cp.y) / 2),
                                l = Math.pow(currp.x, 2) / Math.pow(rx, 2) + Math.pow(currp.y, 2) / Math.pow(ry, 2);
                            l > 1 && (rx *= Math.sqrt(l), ry *= Math.sqrt(l));
                            var s = (largeArcFlag == sweepFlag ? -1 : 1) * Math.sqrt((Math.pow(rx, 2) * Math.pow(ry, 2) - Math.pow(rx, 2) * Math.pow(currp.y, 2) - Math.pow(ry, 2) * Math.pow(currp.x, 2)) / (Math.pow(rx, 2) * Math.pow(currp.y, 2) + Math.pow(ry, 2) * Math.pow(currp.x, 2)));
                            isNaN(s) && (s = 0);
                            var cpp = new svg.Point(s * rx * currp.y / ry, s * -ry * currp.x / rx),
                                centp = new svg.Point((curr.x + cp.x) / 2 + Math.cos(xAxisRotation) * cpp.x - Math.sin(xAxisRotation) * cpp.y, (curr.y + cp.y) / 2 + Math.sin(xAxisRotation) * cpp.x + Math.cos(xAxisRotation) * cpp.y),
                                m = function (v) {
                                    return Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2))
                                }, r = function (u, v) {
                                    return (u[0] * v[0] + u[1] * v[1]) / (m(u) * m(v))
                                }, a = function (u, v) {
                                    return (u[0] * v[1] < u[1] * v[0] ? -1 : 1) * Math.acos(r(u, v))
                                }, a1 = a([1, 0], [(currp.x - cpp.x) / rx, (currp.y - cpp.y) / ry]),
                                u = [(currp.x - cpp.x) / rx, (currp.y - cpp.y) / ry],
                                v = [(-currp.x - cpp.x) / rx, (-currp.y - cpp.y) / ry], ad = a(u, v);
                            r(u, v) <= -1 && (ad = Math.PI), r(u, v) >= 1 && (ad = 0);
                            var dir = 1 - sweepFlag ? 1 : -1, ah = a1 + dir * (ad / 2),
                                halfWay = new svg.Point(centp.x + rx * Math.cos(ah), centp.y + ry * Math.sin(ah));
                            if (pp.addMarkerAngle(halfWay, ah - dir * Math.PI / 2), pp.addMarkerAngle(cp, ah - dir * Math.PI), bb.addPoint(cp.x, cp.y), null != ctx) {
                                var r = rx > ry ? rx : ry, sx = rx > ry ? 1 : rx / ry, sy = rx > ry ? ry / rx : 1;
                                ctx.translate(centp.x, centp.y), ctx.rotate(xAxisRotation), ctx.scale(sx, sy), ctx.arc(0, 0, r, a1, a1 + ad, 1 - sweepFlag), ctx.scale(1 / sx, 1 / sy), ctx.rotate(-xAxisRotation), ctx.translate(-centp.x, -centp.y)
                            }
                        }
                        break;
                    case"Z":
                    case"z":
                        null != ctx && ctx.closePath(), pp.current = pp.start
                }
                return bb
            }, this.getMarkers = function () {
                for (var points = this.PathParser.getMarkerPoints(), angles = this.PathParser.getMarkerAngles(), markers = [], i = 0; i < points.length; i++) markers.push([points[i], angles[i]]);
                return markers
            }
        }, svg.Element.path.prototype = new svg.Element.PathElementBase, svg.Element.pattern = function (node) {
            this.base = svg.Element.ElementBase, this.base(node), this.createPattern = function (ctx) {
                var width = this.attribute("width").toPixels("x", !0),
                    height = this.attribute("height").toPixels("y", !0), tempSvg = new svg.Element.svg;
                tempSvg.attributes.viewBox = new svg.Property("viewBox", this.attribute("viewBox").value), tempSvg.attributes.width = new svg.Property("width", width + "px"), tempSvg.attributes.height = new svg.Property("height", height + "px"), tempSvg.attributes.transform = new svg.Property("transform", this.attribute("patternTransform").value), tempSvg.children = this.children;
                var c = document.createElement("canvas");
                c.width = width, c.height = height;
                var cctx = c.getContext("2d");
                this.attribute("x").hasValue() && this.attribute("y").hasValue() && cctx.translate(this.attribute("x").toPixels("x", !0), this.attribute("y").toPixels("y", !0));
                for (var x = -1; 1 >= x; x++) for (var y = -1; 1 >= y; y++) cctx.save(), cctx.translate(x * c.width, y * c.height), tempSvg.render(cctx), cctx.restore();
                var pattern = ctx.createPattern(c, "repeat");
                return pattern
            }
        }, svg.Element.pattern.prototype = new svg.Element.ElementBase, svg.Element.marker = function (node) {
            this.base = svg.Element.ElementBase, this.base(node), this.baseRender = this.render, this.render = function (ctx, point, angle) {
                ctx.translate(point.x, point.y), "auto" == this.attribute("orient").valueOrDefault("auto") && ctx.rotate(angle), "strokeWidth" == this.attribute("markerUnits").valueOrDefault("strokeWidth") && ctx.scale(ctx.lineWidth, ctx.lineWidth), ctx.save();
                var tempSvg = new svg.Element.svg;
                tempSvg.attributes.viewBox = new svg.Property("viewBox", this.attribute("viewBox").value), tempSvg.attributes.refX = new svg.Property("refX", this.attribute("refX").value), tempSvg.attributes.refY = new svg.Property("refY", this.attribute("refY").value), tempSvg.attributes.width = new svg.Property("width", this.attribute("markerWidth").value), tempSvg.attributes.height = new svg.Property("height", this.attribute("markerHeight").value), tempSvg.attributes.fill = new svg.Property("fill", this.attribute("fill").valueOrDefault("black")), tempSvg.attributes.stroke = new svg.Property("stroke", this.attribute("stroke").valueOrDefault("none")), tempSvg.children = this.children, tempSvg.render(ctx), ctx.restore(), "strokeWidth" == this.attribute("markerUnits").valueOrDefault("strokeWidth") && ctx.scale(1 / ctx.lineWidth, 1 / ctx.lineWidth), "auto" == this.attribute("orient").valueOrDefault("auto") && ctx.rotate(-angle), ctx.translate(-point.x, -point.y)
            }
        }, svg.Element.marker.prototype = new svg.Element.ElementBase, svg.Element.defs = function (node) {
            this.base = svg.Element.ElementBase, this.base(node), this.render = function () {
            }
        }, svg.Element.defs.prototype = new svg.Element.ElementBase, svg.Element.GradientBase = function (node) {
            this.base = svg.Element.ElementBase, this.base(node), this.gradientUnits = this.attribute("gradientUnits").valueOrDefault("objectBoundingBox"), this.stops = [];
            for (var i = 0; i < this.children.length; i++) {
                var child = this.children[i];
                "stop" == child.type && this.stops.push(child)
            }
            this.getGradient = function () {
            }, this.createGradient = function (ctx, element, parentOpacityProp) {
                var stopsContainer = this;
                this.getHrefAttribute().hasValue() && (stopsContainer = this.getHrefAttribute().getDefinition());
                var addParentOpacity = function (color) {
                    if (parentOpacityProp.hasValue()) {
                        var p = new svg.Property("color", color);
                        return p.addOpacity(parentOpacityProp.value).value
                    }
                    return color
                }, g = this.getGradient(ctx, element);
                if (null == g) return addParentOpacity(stopsContainer.stops[stopsContainer.stops.length - 1].color);
                for (var i = 0; i < stopsContainer.stops.length; i++) g.addColorStop(stopsContainer.stops[i].offset, addParentOpacity(stopsContainer.stops[i].color));
                if (this.attribute("gradientTransform").hasValue()) {
                    var rootView = svg.ViewPort.viewPorts[0], rect = new svg.Element.rect;
                    rect.attributes.x = new svg.Property("x", -svg.MAX_VIRTUAL_PIXELS / 3), rect.attributes.y = new svg.Property("y", -svg.MAX_VIRTUAL_PIXELS / 3), rect.attributes.width = new svg.Property("width", svg.MAX_VIRTUAL_PIXELS), rect.attributes.height = new svg.Property("height", svg.MAX_VIRTUAL_PIXELS);
                    var group = new svg.Element.g;
                    group.attributes.transform = new svg.Property("transform", this.attribute("gradientTransform").value), group.children = [rect];
                    var tempSvg = new svg.Element.svg;
                    tempSvg.attributes.x = new svg.Property("x", 0), tempSvg.attributes.y = new svg.Property("y", 0), tempSvg.attributes.width = new svg.Property("width", rootView.width), tempSvg.attributes.height = new svg.Property("height", rootView.height), tempSvg.children = [group];
                    var c = document.createElement("canvas");
                    c.width = rootView.width, c.height = rootView.height;
                    var tempCtx = c.getContext("2d");
                    return tempCtx.fillStyle = g, tempSvg.render(tempCtx), tempCtx.createPattern(c, "no-repeat")
                }
                return g
            }
        }, svg.Element.GradientBase.prototype = new svg.Element.ElementBase, svg.Element.linearGradient = function (node) {
            this.base = svg.Element.GradientBase, this.base(node), this.getGradient = function (ctx, element) {
                var bb = element.getBoundingBox();
                this.attribute("x1").hasValue() || this.attribute("y1").hasValue() || this.attribute("x2").hasValue() || this.attribute("y2").hasValue() || (this.attribute("x1", !0).value = 0, this.attribute("y1", !0).value = 0, this.attribute("x2", !0).value = 1, this.attribute("y2", !0).value = 0);
                var x1 = "objectBoundingBox" == this.gradientUnits ? bb.x() + bb.width() * this.attribute("x1").numValue() : this.attribute("x1").toPixels("x"),
                    y1 = "objectBoundingBox" == this.gradientUnits ? bb.y() + bb.height() * this.attribute("y1").numValue() : this.attribute("y1").toPixels("y"),
                    x2 = "objectBoundingBox" == this.gradientUnits ? bb.x() + bb.width() * this.attribute("x2").numValue() : this.attribute("x2").toPixels("x"),
                    y2 = "objectBoundingBox" == this.gradientUnits ? bb.y() + bb.height() * this.attribute("y2").numValue() : this.attribute("y2").toPixels("y");
                return x1 == x2 && y1 == y2 ? null : ctx.createLinearGradient(x1, y1, x2, y2)
            }
        }, svg.Element.linearGradient.prototype = new svg.Element.GradientBase, svg.Element.radialGradient = function (node) {
            this.base = svg.Element.GradientBase, this.base(node), this.getGradient = function (ctx, element) {
                var bb = element.getBoundingBox();
                this.attribute("cx").hasValue() || (this.attribute("cx", !0).value = "50%"), this.attribute("cy").hasValue() || (this.attribute("cy", !0).value = "50%"), this.attribute("r").hasValue() || (this.attribute("r", !0).value = "50%");
                var cx = "objectBoundingBox" == this.gradientUnits ? bb.x() + bb.width() * this.attribute("cx").numValue() : this.attribute("cx").toPixels("x"),
                    cy = "objectBoundingBox" == this.gradientUnits ? bb.y() + bb.height() * this.attribute("cy").numValue() : this.attribute("cy").toPixels("y"),
                    fx = cx, fy = cy;
                this.attribute("fx").hasValue() && (fx = "objectBoundingBox" == this.gradientUnits ? bb.x() + bb.width() * this.attribute("fx").numValue() : this.attribute("fx").toPixels("x")), this.attribute("fy").hasValue() && (fy = "objectBoundingBox" == this.gradientUnits ? bb.y() + bb.height() * this.attribute("fy").numValue() : this.attribute("fy").toPixels("y"));
                var r = "objectBoundingBox" == this.gradientUnits ? (bb.width() + bb.height()) / 2 * this.attribute("r").numValue() : this.attribute("r").toPixels();
                return ctx.createRadialGradient(fx, fy, 0, cx, cy, r)
            }
        }, svg.Element.radialGradient.prototype = new svg.Element.GradientBase, svg.Element.stop = function (node) {
            this.base = svg.Element.ElementBase, this.base(node), this.offset = this.attribute("offset").numValue(), this.offset < 0 && (this.offset = 0), this.offset > 1 && (this.offset = 1);
            var stopColor = this.style("stop-color");
            this.style("stop-opacity").hasValue() && (stopColor = stopColor.addOpacity(this.style("stop-opacity").value)), this.color = stopColor.value
        }, svg.Element.stop.prototype = new svg.Element.ElementBase, svg.Element.AnimateBase = function (node) {
            this.base = svg.Element.ElementBase, this.base(node), svg.Animations.push(this), this.duration = 0, this.begin = this.attribute("begin").toMilliseconds(), this.maxDuration = this.begin + this.attribute("dur").toMilliseconds(), this.getProperty = function () {
                var attributeType = this.attribute("attributeType").value,
                    attributeName = this.attribute("attributeName").value;
                return "CSS" == attributeType ? this.parent.style(attributeName, !0) : this.parent.attribute(attributeName, !0)
            }, this.initialValue = null, this.initialUnits = "", this.removed = !1, this.calcValue = function () {
                return ""
            }, this.update = function (delta) {
                if (null == this.initialValue && (this.initialValue = this.getProperty().value, this.initialUnits = this.getProperty().getUnits()), this.duration > this.maxDuration) {
                    if ("indefinite" != this.attribute("repeatCount").value && "indefinite" != this.attribute("repeatDur").value) return "remove" != this.attribute("fill").valueOrDefault("remove") || this.removed ? !1 : (this.removed = !0, this.getProperty().value = this.initialValue, !0);
                    this.duration = 0
                }
                this.duration = this.duration + delta;
                var updated = !1;
                if (this.begin < this.duration) {
                    var newValue = this.calcValue();
                    if (this.attribute("type").hasValue()) {
                        var type = this.attribute("type").value;
                        newValue = type + "(" + newValue + ")"
                    }
                    this.getProperty().value = newValue, updated = !0
                }
                return updated
            }, this.from = this.attribute("from"), this.to = this.attribute("to"), this.values = this.attribute("values"), this.values.hasValue() && (this.values.value = this.values.value.split(";")), this.progress = function () {
                var ret = {progress: (this.duration - this.begin) / (this.maxDuration - this.begin)};
                if (this.values.hasValue()) {
                    var p = ret.progress * (this.values.value.length - 1), lb = Math.floor(p), ub = Math.ceil(p);
                    ret.from = new svg.Property("from", parseFloat(this.values.value[lb])), ret.to = new svg.Property("to", parseFloat(this.values.value[ub])), ret.progress = (p - lb) / (ub - lb)
                } else ret.from = this.from, ret.to = this.to;
                return ret
            }
        }, svg.Element.AnimateBase.prototype = new svg.Element.ElementBase, svg.Element.animate = function (node) {
            this.base = svg.Element.AnimateBase, this.base(node), this.calcValue = function () {
                var p = this.progress(),
                    newValue = p.from.numValue() + (p.to.numValue() - p.from.numValue()) * p.progress;
                return newValue + this.initialUnits
            }
        }, svg.Element.animate.prototype = new svg.Element.AnimateBase, svg.Element.animateColor = function (node) {
            this.base = svg.Element.AnimateBase, this.base(node), this.calcValue = function () {
                var p = this.progress(), from = new RGBColor(p.from.value), to = new RGBColor(p.to.value);
                if (from.ok && to.ok) {
                    var r = from.r + (to.r - from.r) * p.progress, g = from.g + (to.g - from.g) * p.progress,
                        b = from.b + (to.b - from.b) * p.progress;
                    return "rgb(" + parseInt(r, 10) + "," + parseInt(g, 10) + "," + parseInt(b, 10) + ")"
                }
                return this.attribute("from").value
            }
        }, svg.Element.animateColor.prototype = new svg.Element.AnimateBase, svg.Element.animateTransform = function (node) {
            this.base = svg.Element.AnimateBase, this.base(node), this.calcValue = function () {
                for (var p = this.progress(), from = svg.ToNumberArray(p.from.value), to = svg.ToNumberArray(p.to.value), newValue = "", i = 0; i < from.length; i++) newValue += from[i] + (to[i] - from[i]) * p.progress + " ";
                return newValue
            }
        }, svg.Element.animateTransform.prototype = new svg.Element.animate, svg.Element.font = function (node) {
            this.base = svg.Element.ElementBase, this.base(node), this.horizAdvX = this.attribute("horiz-adv-x").numValue(), this.isRTL = !1, this.isArabic = !1, this.fontFace = null, this.missingGlyph = null, this.glyphs = [];
            for (var i = 0; i < this.children.length; i++) {
                var child = this.children[i];
                "font-face" == child.type ? (this.fontFace = child, child.style("font-family").hasValue() && (svg.Definitions[child.style("font-family").value] = this)) : "missing-glyph" == child.type ? this.missingGlyph = child : "glyph" == child.type && ("" != child.arabicForm ? (this.isRTL = !0, this.isArabic = !0, "undefined" == typeof this.glyphs[child.unicode] && (this.glyphs[child.unicode] = []), this.glyphs[child.unicode][child.arabicForm] = child) : this.glyphs[child.unicode] = child)
            }
        }, svg.Element.font.prototype = new svg.Element.ElementBase, svg.Element.fontface = function (node) {
            this.base = svg.Element.ElementBase, this.base(node), this.ascent = this.attribute("ascent").value, this.descent = this.attribute("descent").value, this.unitsPerEm = this.attribute("units-per-em").numValue()
        }, svg.Element.fontface.prototype = new svg.Element.ElementBase, svg.Element.missingglyph = function (node) {
            this.base = svg.Element.path, this.base(node), this.horizAdvX = 0
        }, svg.Element.missingglyph.prototype = new svg.Element.path, svg.Element.glyph = function (node) {
            this.base = svg.Element.path, this.base(node), this.horizAdvX = this.attribute("horiz-adv-x").numValue(), this.unicode = this.attribute("unicode").value, this.arabicForm = this.attribute("arabic-form").value
        }, svg.Element.glyph.prototype = new svg.Element.path, svg.Element.text = function (node) {
            this.captureTextNodes = !0, this.base = svg.Element.RenderedElementBase, this.base(node), this.baseSetContext = this.setContext, this.setContext = function (ctx) {
                this.baseSetContext(ctx), this.style("dominant-baseline").hasValue() && (ctx.textBaseline = this.style("dominant-baseline").value), this.style("alignment-baseline").hasValue() && (ctx.textBaseline = this.style("alignment-baseline").value)
            }, this.getBoundingBox = function () {
                return new svg.BoundingBox(this.attribute("x").toPixels("x"), this.attribute("y").toPixels("y"), 0, 0)
            }, this.renderChildren = function (ctx) {
                this.x = this.attribute("x").toPixels("x"), this.y = this.attribute("y").toPixels("y"), this.x += this.getAnchorDelta(ctx, this, 0);
                for (var i = 0; i < this.children.length; i++) this.renderChild(ctx, this, i)
            }, this.getAnchorDelta = function (ctx, parent, startI) {
                var textAnchor = this.style("text-anchor").valueOrDefault("start");
                if ("start" != textAnchor) {
                    for (var width = 0, i = startI; i < parent.children.length; i++) {
                        var child = parent.children[i];
                        if (i > startI && child.attribute("x").hasValue()) break;
                        width += child.measureTextRecursive(ctx)
                    }
                    return -1 * ("end" == textAnchor ? width : width / 2)
                }
                return 0
            }, this.renderChild = function (ctx, parent, i) {
                var child = parent.children[i];
                child.attribute("x").hasValue() ? child.x = child.attribute("x").toPixels("x") + this.getAnchorDelta(ctx, parent, i) : (this.attribute("dx").hasValue() && (this.x += this.attribute("dx").toPixels("x")), child.attribute("dx").hasValue() && (this.x += child.attribute("dx").toPixels("x")), child.x = this.x), this.x = child.x + child.measureText(ctx), child.attribute("y").hasValue() ? child.y = child.attribute("y").toPixels("y") : (this.attribute("dy").hasValue() && (this.y += this.attribute("dy").toPixels("y")), child.attribute("dy").hasValue() && (this.y += child.attribute("dy").toPixels("y")), child.y = this.y), this.y = child.y, child.render(ctx);
                for (var i = 0; i < child.children.length; i++) this.renderChild(ctx, child, i)
            }
        }, svg.Element.text.prototype = new svg.Element.RenderedElementBase, svg.Element.TextElementBase = function (node) {
            this.base = svg.Element.RenderedElementBase, this.base(node), this.getGlyph = function (font, text, i) {
                var c = text[i], glyph = null;
                if (font.isArabic) {
                    var arabicForm = "isolated";
                    (0 == i || " " == text[i - 1]) && i < text.length - 2 && " " != text[i + 1] && (arabicForm = "terminal"), i > 0 && " " != text[i - 1] && i < text.length - 2 && " " != text[i + 1] && (arabicForm = "medial"), i > 0 && " " != text[i - 1] && (i == text.length - 1 || " " == text[i + 1]) && (arabicForm = "initial"), "undefined" != typeof font.glyphs[c] && (glyph = font.glyphs[c][arabicForm], null == glyph && "glyph" == font.glyphs[c].type && (glyph = font.glyphs[c]))
                } else glyph = font.glyphs[c];
                return null == glyph && (glyph = font.missingGlyph), glyph
            }, this.renderChildren = function (ctx) {
                var customFont = this.parent.style("font-family").getDefinition();
                if (null == customFont) "" != ctx.fillStyle && ctx.fillText(svg.compressSpaces(this.getText()), this.x, this.y), "" != ctx.strokeStyle && ctx.strokeText(svg.compressSpaces(this.getText()), this.x, this.y); else {
                    var fontSize = this.parent.style("font-size").numValueOrDefault(svg.Font.Parse(svg.ctx.font).fontSize),
                        fontStyle = this.parent.style("font-style").valueOrDefault(svg.Font.Parse(svg.ctx.font).fontStyle),
                        text = this.getText();
                    customFont.isRTL && (text = text.split("").reverse().join(""));
                    for (var dx = svg.ToNumberArray(this.parent.attribute("dx").value), i = 0; i < text.length; i++) {
                        var glyph = this.getGlyph(customFont, text, i),
                            scale = fontSize / customFont.fontFace.unitsPerEm;
                        ctx.translate(this.x, this.y), ctx.scale(scale, -scale);
                        var lw = ctx.lineWidth;
                        ctx.lineWidth = ctx.lineWidth * customFont.fontFace.unitsPerEm / fontSize, "italic" == fontStyle && ctx.transform(1, 0, .4, 1, 0, 0), glyph.render(ctx), "italic" == fontStyle && ctx.transform(1, 0, -.4, 1, 0, 0), ctx.lineWidth = lw, ctx.scale(1 / scale, -1 / scale), ctx.translate(-this.x, -this.y), this.x += fontSize * (glyph.horizAdvX || customFont.horizAdvX) / customFont.fontFace.unitsPerEm, "undefined" == typeof dx[i] || isNaN(dx[i]) || (this.x += dx[i])
                    }
                }
            }, this.getText = function () {
            }, this.measureTextRecursive = function (ctx) {
                for (var width = this.measureText(ctx), i = 0; i < this.children.length; i++) width += this.children[i].measureTextRecursive(ctx);
                return width
            }, this.measureText = function (ctx) {
                var customFont = this.parent.style("font-family").getDefinition();
                if (null != customFont) {
                    var fontSize = this.parent.style("font-size").numValueOrDefault(svg.Font.Parse(svg.ctx.font).fontSize),
                        measure = 0, text = this.getText();
                    customFont.isRTL && (text = text.split("").reverse().join(""));
                    for (var dx = svg.ToNumberArray(this.parent.attribute("dx").value), i = 0; i < text.length; i++) {
                        var glyph = this.getGlyph(customFont, text, i);
                        measure += (glyph.horizAdvX || customFont.horizAdvX) * fontSize / customFont.fontFace.unitsPerEm, "undefined" == typeof dx[i] || isNaN(dx[i]) || (measure += dx[i])
                    }
                    return measure
                }
                var textToMeasure = svg.compressSpaces(this.getText());
                if (!ctx.measureText) return 10 * textToMeasure.length;
                ctx.save(), this.setContext(ctx);
                var width = ctx.measureText(textToMeasure).width;
                return ctx.restore(), width
            }
        }, svg.Element.TextElementBase.prototype = new svg.Element.RenderedElementBase, svg.Element.tspan = function (node) {
            this.captureTextNodes = !0, this.base = svg.Element.TextElementBase, this.base(node), this.text = node.nodeValue || node.text || "", this.getText = function () {
                return this.text
            }
        }, svg.Element.tspan.prototype = new svg.Element.TextElementBase, svg.Element.tref = function (node) {
            this.base = svg.Element.TextElementBase, this.base(node), this.getText = function () {
                var element = this.getHrefAttribute().getDefinition();
                return null != element ? element.children[0].getText() : void 0
            }
        }, svg.Element.tref.prototype = new svg.Element.TextElementBase, svg.Element.a = function (node) {
            this.base = svg.Element.TextElementBase, this.base(node), this.hasText = !0;
            for (var i = 0; i < node.childNodes.length; i++) 3 != node.childNodes[i].nodeType && (this.hasText = !1);
            this.text = this.hasText ? node.childNodes[0].nodeValue : "", this.getText = function () {
                return this.text
            }, this.baseRenderChildren = this.renderChildren, this.renderChildren = function (ctx) {
                if (this.hasText) {
                    this.baseRenderChildren(ctx);
                    var fontSize = new svg.Property("fontSize", svg.Font.Parse(svg.ctx.font).fontSize);
                    svg.Mouse.checkBoundingBox(this, new svg.BoundingBox(this.x, this.y - fontSize.toPixels("y"), this.x + this.measureText(ctx), this.y))
                } else {
                    var g = new svg.Element.g;
                    g.children = this.children, g.parent = this, g.render(ctx)
                }
            }, this.onclick = function () {
                window.open(this.getHrefAttribute().value)
            }, this.onmousemove = function () {
                svg.ctx.canvas.style.cursor = "pointer"
            }
        }, svg.Element.a.prototype = new svg.Element.TextElementBase, svg.Element.image = function (node) {
            this.base = svg.Element.RenderedElementBase, this.base(node);
            var href = this.getHrefAttribute().value, isSvg = href.match(/\.svg$/);
            if (svg.Images.push(this), this.loaded = !1, isSvg) this.img = svg.ajax(href), this.loaded = !0; else {
                this.img = document.createElement("img");
                var self = this;
                this.img.onload = function () {
                    self.loaded = !0
                }, this.img.onerror = function () {
                    "undefined" != typeof console && (console.log('ERROR: image "' + href + '" not found'), self.loaded = !0)
                }, this.img.src = href
            }
            this.renderChildren = function (ctx) {
                var x = this.attribute("x").toPixels("x"), y = this.attribute("y").toPixels("y"),
                    width = this.attribute("width").toPixels("x"), height = this.attribute("height").toPixels("y");
                0 != width && 0 != height && (ctx.save(), isSvg ? ctx.drawSvg(this.img, x, y, width, height) : (ctx.translate(x, y), svg.AspectRatio(ctx, this.attribute("preserveAspectRatio").value, width, this.img.width, height, this.img.height, 0, 0), ctx.drawImage(this.img, 0, 0)), ctx.restore())
            }, this.getBoundingBox = function () {
                var x = this.attribute("x").toPixels("x"), y = this.attribute("y").toPixels("y"),
                    width = this.attribute("width").toPixels("x"), height = this.attribute("height").toPixels("y");
                return new svg.BoundingBox(x, y, x + width, y + height)
            }
        }, svg.Element.image.prototype = new svg.Element.RenderedElementBase, svg.Element.g = function (node) {
            this.base = svg.Element.RenderedElementBase, this.base(node), this.getBoundingBox = function () {
                for (var bb = new svg.BoundingBox, i = 0; i < this.children.length; i++) bb.addBoundingBox(this.children[i].getBoundingBox());
                return bb
            }
        },svg.Element.g.prototype = new svg.Element.RenderedElementBase,svg.Element.symbol = function (node) {
            this.base = svg.Element.RenderedElementBase, this.base(node), this.baseSetContext = this.setContext, this.setContext = function (ctx) {
                if (this.baseSetContext(ctx), this.attribute("viewBox").hasValue()) {
                    var viewBox = svg.ToNumberArray(this.attribute("viewBox").value), minX = viewBox[0],
                        minY = viewBox[1];
                    width = viewBox[2], height = viewBox[3], svg.AspectRatio(ctx, this.attribute("preserveAspectRatio").value, this.attribute("width").toPixels("x"), width, this.attribute("height").toPixels("y"), height, minX, minY), svg.ViewPort.SetCurrent(viewBox[2], viewBox[3])
                }
            }
        },svg.Element.symbol.prototype = new svg.Element.RenderedElementBase,svg.Element.style = function (node) {
            this.base = svg.Element.ElementBase, this.base(node);
            for (var css = "", i = 0; i < node.childNodes.length; i++) css += node.childNodes[i].nodeValue;
            css = css.replace(/(\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\/)|(^[\s]*\/\/.*)/gm, ""), css = svg.compressSpaces(css);
            for (var cssDefs = css.split("}"), i = 0; i < cssDefs.length; i++) if ("" != svg.trim(cssDefs[i])) for (var cssDef = cssDefs[i].split("{"), cssClasses = cssDef[0].split(","), cssProps = cssDef[1].split(";"), j = 0; j < cssClasses.length; j++) {
                var cssClass = svg.trim(cssClasses[j]);
                if ("" != cssClass) {
                    for (var props = {}, k = 0; k < cssProps.length; k++) {
                        var prop = cssProps[k].indexOf(":"), name = cssProps[k].substr(0, prop),
                            value = cssProps[k].substr(prop + 1, cssProps[k].length - prop);
                        null != name && null != value && (props[svg.trim(name)] = new svg.Property(svg.trim(name), svg.trim(value)))
                    }
                    if (svg.Styles[cssClass] = props, "@font-face" == cssClass) for (var fontFamily = props["font-family"].value.replace(/"/g, ""), srcs = props.src.value.split(","), s = 0; s < srcs.length; s++) if (srcs[s].indexOf('format("svg")') > 0) for (var urlStart = srcs[s].indexOf("url"), urlEnd = srcs[s].indexOf(")", urlStart), url = srcs[s].substr(urlStart + 5, urlEnd - urlStart - 6), doc = svg.parseXml(svg.ajax(url)), fonts = doc.getElementsByTagName("font"), f = 0; f < fonts.length; f++) {
                        var font = svg.CreateElement(fonts[f]);
                        svg.Definitions[fontFamily] = font
                    }
                }
            }
        },svg.Element.style.prototype = new svg.Element.ElementBase,svg.Element.use = function (node) {
            this.base = svg.Element.RenderedElementBase, this.base(node), this.baseSetContext = this.setContext, this.setContext = function (ctx) {
                this.baseSetContext(ctx), this.attribute("x").hasValue() && ctx.translate(this.attribute("x").toPixels("x"), 0), this.attribute("y").hasValue() && ctx.translate(0, this.attribute("y").toPixels("y"))
            }, this.getDefinition = function () {
                var element = this.getHrefAttribute().getDefinition();
                return this.attribute("width").hasValue() && (element.attribute("width", !0).value = this.attribute("width").value), this.attribute("height").hasValue() && (element.attribute("height", !0).value = this.attribute("height").value), element
            }, this.path = function (ctx) {
                var element = this.getDefinition();
                null != element && element.path(ctx)
            }, this.getBoundingBox = function () {
                var element = this.getDefinition();
                return null != element ? element.getBoundingBox() : void 0
            }, this.renderChildren = function (ctx) {
                var element = this.getDefinition();
                if (null != element) {
                    var oldParent = element.parent;
                    element.parent = null, element.render(ctx), element.parent = oldParent
                }
            }
        },svg.Element.use.prototype = new svg.Element.RenderedElementBase,svg.Element.mask = function (node) {
            this.base = svg.Element.ElementBase, this.base(node), this.apply = function (ctx, element) {
                var x = this.attribute("x").toPixels("x"), y = this.attribute("y").toPixels("y"),
                    width = this.attribute("width").toPixels("x"), height = this.attribute("height").toPixels("y");
                if (0 == width && 0 == height) {
                    for (var bb = new svg.BoundingBox, i = 0; i < this.children.length; i++) bb.addBoundingBox(this.children[i].getBoundingBox());
                    var x = Math.floor(bb.x1), y = Math.floor(bb.y1), width = Math.floor(bb.width()),
                        height = Math.floor(bb.height())
                }
                var mask = element.attribute("mask").value;
                element.attribute("mask").value = "";
                var cMask = document.createElement("canvas");
                cMask.width = x + width, cMask.height = y + height;
                var maskCtx = cMask.getContext("2d");
                this.renderChildren(maskCtx);
                var c = document.createElement("canvas");
                c.width = x + width, c.height = y + height;
                var tempCtx = c.getContext("2d");
                element.render(tempCtx), tempCtx.globalCompositeOperation = "destination-in", tempCtx.fillStyle = maskCtx.createPattern(cMask, "no-repeat"), tempCtx.fillRect(0, 0, x + width, y + height), ctx.fillStyle = tempCtx.createPattern(c, "no-repeat"), ctx.fillRect(0, 0, x + width, y + height), element.attribute("mask").value = mask
            }, this.render = function () {
            }
        },svg.Element.mask.prototype = new svg.Element.ElementBase,svg.Element.clipPath = function (node) {
            this.base = svg.Element.ElementBase, this.base(node), this.apply = function (ctx) {
                for (var i = 0; i < this.children.length; i++) {
                    var child = this.children[i];
                    if ("undefined" != typeof child.path) {
                        var transform = null;
                        child.attribute("transform").hasValue() && (transform = new svg.Transform(child.attribute("transform").value), transform.apply(ctx)), child.path(ctx), ctx.clip(), transform && transform.unapply(ctx)
                    }
                }
            }, this.render = function () {
            }
        },svg.Element.clipPath.prototype = new svg.Element.ElementBase,svg.Element.filter = function (node) {
            this.base = svg.Element.ElementBase, this.base(node), this.apply = function (ctx, element) {
                var bb = element.getBoundingBox(), x = Math.floor(bb.x1), y = Math.floor(bb.y1),
                    width = Math.floor(bb.width()), height = Math.floor(bb.height()),
                    filter = element.style("filter").value;
                element.style("filter").value = "";
                for (var px = 0, py = 0, i = 0; i < this.children.length; i++) {
                    var efd = this.children[i].extraFilterDistance || 0;
                    px = Math.max(px, efd), py = Math.max(py, efd)
                }
                var c = document.createElement("canvas");
                c.width = width + 2 * px, c.height = height + 2 * py;
                var tempCtx = c.getContext("2d");
                tempCtx.translate(-x + px, -y + py), element.render(tempCtx);
                for (var i = 0; i < this.children.length; i++) this.children[i].apply(tempCtx, 0, 0, width + 2 * px, height + 2 * py);
                ctx.drawImage(c, 0, 0, width + 2 * px, height + 2 * py, x - px, y - py, width + 2 * px, height + 2 * py), element.style("filter", !0).value = filter
            }, this.render = function () {
            }
        },svg.Element.filter.prototype = new svg.Element.ElementBase,svg.Element.feMorphology = function (node) {
            this.base = svg.Element.ElementBase, this.base(node), this.apply = function () {
            }
        },svg.Element.feMorphology.prototype = new svg.Element.ElementBase,svg.Element.feColorMatrix = function (node) {
            function imGet(img, x, y, width, height, rgba) {
                return img[y * width * 4 + 4 * x + rgba]
            }

            function imSet(img, x, y, width, height, rgba, val) {
                img[y * width * 4 + 4 * x + rgba] = val
            }

            this.base = svg.Element.ElementBase, this.base(node), this.apply = function (ctx, x, y, width, height) {
                for (var srcData = ctx.getImageData(0, 0, width, height), y = 0; height > y; y++) for (var x = 0; width > x; x++) {
                    var r = imGet(srcData.data, x, y, width, height, 0),
                        g = imGet(srcData.data, x, y, width, height, 1),
                        b = imGet(srcData.data, x, y, width, height, 2), gray = (r + g + b) / 3;
                    imSet(srcData.data, x, y, width, height, 0, gray), imSet(srcData.data, x, y, width, height, 1, gray), imSet(srcData.data, x, y, width, height, 2, gray)
                }
                ctx.clearRect(0, 0, width, height), ctx.putImageData(srcData, 0, 0)
            }
        },svg.Element.feColorMatrix.prototype = new svg.Element.ElementBase,svg.Element.feGaussianBlur = function (node) {
            this.base = svg.Element.ElementBase, this.base(node), this.blurRadius = Math.floor(this.attribute("stdDeviation").numValue()), this.extraFilterDistance = this.blurRadius, this.apply = function (ctx, x, y, width, height) {
                return "undefined" == typeof stackBlurCanvasRGBA ? void ("undefined" != typeof console && console.log("ERROR: StackBlur.js must be included for blur to work")) : (ctx.canvas.id = svg.UniqueId(), ctx.canvas.style.display = "none", document.body.appendChild(ctx.canvas), stackBlurCanvasRGBA(ctx.canvas.id, x, y, width, height, this.blurRadius), void document.body.removeChild(ctx.canvas))
            }
        },svg.Element.feGaussianBlur.prototype = new svg.Element.ElementBase,svg.Element.title = function () {
        },svg.Element.title.prototype = new svg.Element.ElementBase,svg.Element.desc = function () {
        },svg.Element.desc.prototype = new svg.Element.ElementBase,svg.Element.MISSING = function (node) {
            "undefined" != typeof console && console.log("ERROR: Element '" + node.nodeName + "' not yet implemented.")
        },svg.Element.MISSING.prototype = new svg.Element.ElementBase,svg.CreateElement = function (node) {
            var className = node.nodeName.replace(/^[^:]+:/, "");
            className = className.replace(/\-/g, "");
            var e = null;
            return e = "undefined" != typeof svg.Element[className] ? new svg.Element[className](node) : new svg.Element.MISSING(node), e.type = node.nodeName, e
        },svg.load = function (ctx, url) {
            svg.loadXml(ctx, svg.ajax(url))
        },svg.loadXml = function (ctx, xml) {
            svg.loadXmlDoc(ctx, svg.parseXml(xml))
        },svg.loadXmlDoc = function (ctx, dom) {
            svg.init(ctx);
            var mapXY = function (p) {
                for (var e = ctx.canvas; e;) p.x -= e.offsetLeft, p.y -= e.offsetTop, e = e.offsetParent;
                return window.scrollX && (p.x += window.scrollX), window.scrollY && (p.y += window.scrollY), p
            };
            1 != svg.opts.ignoreMouse && (ctx.canvas.onclick = function (e) {
                var p = mapXY(new svg.Point(null != e ? e.clientX : event.clientX, null != e ? e.clientY : event.clientY));
                svg.Mouse.onclick(p.x, p.y)
            }, ctx.canvas.onmousemove = function (e) {
                var p = mapXY(new svg.Point(null != e ? e.clientX : event.clientX, null != e ? e.clientY : event.clientY));
                svg.Mouse.onmousemove(p.x, p.y)
            });
            var e = svg.CreateElement(dom.documentElement);
            e.root = !0;
            var isFirstRender = !0, draw = function () {
                svg.ViewPort.Clear(), ctx.canvas.parentNode && svg.ViewPort.SetCurrent(ctx.canvas.parentNode.clientWidth, ctx.canvas.parentNode.clientHeight), 1 != svg.opts.ignoreDimensions && (e.style("width").hasValue() && (ctx.canvas.width = e.style("width").toPixels("x"), ctx.canvas.style.width = ctx.canvas.width + "px"), e.style("height").hasValue() && (ctx.canvas.height = e.style("height").toPixels("y"), ctx.canvas.style.height = ctx.canvas.height + "px"));
                var cWidth = ctx.canvas.clientWidth || ctx.canvas.width,
                    cHeight = ctx.canvas.clientHeight || ctx.canvas.height;
                if (1 == svg.opts.ignoreDimensions && e.style("width").hasValue() && e.style("height").hasValue() && (cWidth = e.style("width").toPixels("x"), cHeight = e.style("height").toPixels("y")), svg.ViewPort.SetCurrent(cWidth, cHeight), null != svg.opts.offsetX && (e.attribute("x", !0).value = svg.opts.offsetX), null != svg.opts.offsetY && (e.attribute("y", !0).value = svg.opts.offsetY), null != svg.opts.scaleWidth && null != svg.opts.scaleHeight) {
                    var xRatio = 1, yRatio = 1, viewBox = svg.ToNumberArray(e.attribute("viewBox").value);
                    e.attribute("width").hasValue() ? xRatio = e.attribute("width").toPixels("x") / svg.opts.scaleWidth : isNaN(viewBox[2]) || (xRatio = viewBox[2] / svg.opts.scaleWidth), e.attribute("height").hasValue() ? yRatio = e.attribute("height").toPixels("y") / svg.opts.scaleHeight : isNaN(viewBox[3]) || (yRatio = viewBox[3] / svg.opts.scaleHeight), e.attribute("width", !0).value = svg.opts.scaleWidth, e.attribute("height", !0).value = svg.opts.scaleHeight, e.attribute("viewBox", !0).value = "0 0 " + cWidth * xRatio + " " + cHeight * yRatio, e.attribute("preserveAspectRatio", !0).value = "none"
                }
                1 != svg.opts.ignoreClear && ctx.clearRect(0, 0, cWidth, cHeight), e.render(ctx), isFirstRender && (isFirstRender = !1, "function" == typeof svg.opts.renderCallback && svg.opts.renderCallback(dom))
            }, waitingForImages = !0;
            svg.ImagesLoaded() && (waitingForImages = !1, draw()), svg.intervalID = setInterval(function () {
                var needUpdate = !1;
                if (waitingForImages && svg.ImagesLoaded() && (waitingForImages = !1, needUpdate = !0), 1 != svg.opts.ignoreMouse && (needUpdate |= svg.Mouse.hasEvents()), 1 != svg.opts.ignoreAnimation) for (var i = 0; i < svg.Animations.length; i++) needUpdate |= svg.Animations[i].update(1e3 / svg.FRAMERATE);
                "function" == typeof svg.opts.forceRedraw && 1 == svg.opts.forceRedraw() && (needUpdate = !0), needUpdate && (draw(), svg.Mouse.runEvents())
            }, 1e3 / svg.FRAMERATE)
        },svg.stop = function () {
            svg.intervalID && clearInterval(svg.intervalID)
        },svg.Mouse = new function () {
            this.events = [], this.hasEvents = function () {
                return 0 != this.events.length
            }, this.onclick = function (x, y) {
                this.events.push({
                    type: "onclick", x: x, y: y, run: function (e) {
                        e.onclick && e.onclick()
                    }
                })
            }, this.onmousemove = function (x, y) {
                this.events.push({
                    type: "onmousemove", x: x, y: y, run: function (e) {
                        e.onmousemove && e.onmousemove()
                    }
                })
            }, this.eventElements = [], this.checkPath = function (element, ctx) {
                for (var i = 0; i < this.events.length; i++) {
                    var e = this.events[i];
                    ctx.isPointInPath && ctx.isPointInPath(e.x, e.y) && (this.eventElements[i] = element)
                }
            }, this.checkBoundingBox = function (element, bb) {
                for (var i = 0; i < this.events.length; i++) {
                    var e = this.events[i];
                    bb.isPointInBox(e.x, e.y) && (this.eventElements[i] = element)
                }
            }, this.runEvents = function () {
                svg.ctx.canvas.style.cursor = "";
                for (var i = 0; i < this.events.length; i++) for (var e = this.events[i], element = this.eventElements[i]; element;) e.run(element), element = element.parent;
                this.events = [], this.eventElements = []
            }
        },svg
    }

    this.canvg = function (target, s, opts) {
        if (null != target || null != s || null != opts) {
            opts = opts || {}, "string" == typeof target && (target = document.getElementById(target)), null != target.svg && target.svg.stop();
            var svg = build();
            (1 != target.childNodes.length || "OBJECT" != target.childNodes[0].nodeName) && (target.svg = svg), svg.opts = opts;
            var ctx = target.getContext("2d");
            "undefined" != typeof s.documentElement ? svg.loadXmlDoc(ctx, s) : "<" == s.substr(0, 1) ? svg.loadXml(ctx, s) : svg.load(ctx, s)
        } else for (var svgTags = document.getElementsByTagName("svg"), i = 0; i < svgTags.length; i++) {
            var svgTag = svgTags[i], c = document.createElement("canvas");
            c.width = svgTag.clientWidth, c.height = svgTag.clientHeight, svgTag.parentNode.insertBefore(c, svgTag), svgTag.parentNode.removeChild(svgTag);
            var div = document.createElement("div");
            div.appendChild(svgTag), canvg(c, div.innerHTML)
        }
    }
}(), "undefined" != typeof CanvasRenderingContext2D && (CanvasRenderingContext2D.prototype.drawSvg = function (s, dx, dy, dw, dh) {
    canvg(this.canvas, s, {
        ignoreMouse: !0,
        ignoreAnimation: !0,
        ignoreDimensions: !0,
        ignoreClear: !0,
        offsetX: dx,
        offsetY: dy,
        scaleWidth: dw,
        scaleHeight: dh
    })
});
(function() {

	angular.module('BuscaAtivaEscolar')
		.config(function ($stateProvider) {
			$stateProvider.state('school_browser', {
				url: '/schools',
				templateUrl: '/views/schools/school_browser.html',
				controller: 'SchoolBrowserCtrl'
			});
		})
		.controller('SchoolBrowserCtrl', function ($scope, Schools, ngToast, $state, Modals, Identity, Config, Ufs, Platform) {
                   
			$scope.check_all_schools = false;
			$scope.identity = Identity;
			$scope.schools = {};
			$scope.msg_success = false;
			$scope.msg_error = false;
			$scope.avaliable_years_educacenso = [2017, 2018, 2019];
			$scope.query = {
				year_educacenso: 2019,
				sort: {},
				show_suspended: false,
				max: 5,
				page: 1
			};
			$scope.selected = {
				schools: []
			};
			
			$scope.onCheckSelectAll = function(){
				if( $scope.check_all_schools ){
					$scope.selected.schools = angular.copy($scope.schools.data);
				}else{
					$scope.selected.schools = [];
				}
			};

            $scope.onModifySchool = function(school){
				Schools.update(school).$promise.then($scope.onSaved);
			};
			
			$scope.onSaved = function(res) {
				if(res.status === "ok") {
					ngToast.success("Dados da escola "+res.updated.name+" salvos com sucesso!");
					return;
				}else{
					ngToast.danger("Ocorreu um erro ao salvar a escola!: "+res.message, res.status);
					$scope.refresh();
				}
			};

			$scope.sendnotification = function(){

				//remove objects without email
				var schools_to_send_notification = $scope.selected.schools.filter(function(school){
					if(school.school_email != null && school.school_email != ""){
						return true;
					}else{
						return false;
					}
				});

				if(schools_to_send_notification.length > 0){
					
					Modals.show(
						Modals.ConfirmEmail(
							'Confirma o envio de sms e email para as seguintes escolas?',
							'Ao confirmar, as escolas serão notificadas por email e sms e poderão cadastrar o endereço das crianças e adolescentes reportadas pelo Educacenso',
							schools_to_send_notification
						)).then(function () {
							return Schools.send_educacenso_notifications(schools_to_send_notification).$promise;
						})
						.then(function (res) {
							if(res.status == "error"){
								ngToast.danger(res.message);
								$scope.msg_success = false;
								$scope.msg_error = true;
								$scope.refresh();
								window.scrollTo(0, 0);
							}else{
								ngToast.warning(res.message);
								$scope.msg_success = true;
								$scope.msg_error = false;
								$scope.refresh();
								window.scrollTo(0, 0);
							}
						});
				}else{
					Modals.show(Modals.Alert('Atenção', 'Selecione as escolas para as quais deseja encaminhar o email/ SMS'));
				}

			};

			$scope.onSelectYear = function() {
				$scope.query.page = 1;
				$scope.query.max = 5;
				$scope.refresh();
			};

			$scope.refresh = function() {
                Schools.all_educacenso($scope.query, function(res) {
					$scope.check_all_schools = false;
					$scope.selected.schools = [];
					$scope.schools = angular.copy(res);
				});
			};

			$scope.setMaxResults = function(max) {
				$scope.query.max = max;
				$scope.query.page = 1;
				$scope.refresh();
			};
			
			Platform.whenReady(function() {
                $scope.refresh();
			});

		});

})();
(function() {

    angular.module('BuscaAtivaEscolar')
        .config(function ($stateProvider) {
            $stateProvider.state('school_list_frequency', {
                url: '/frequency',
                templateUrl: '/views/schools/school_list_frequency.html',
                controller: 'SchoolFrequencyBrowserCtrl'
            });
        })
        .controller('SchoolFrequencyBrowserCtrl', function ($scope, Schools, ngToast, $state, Modals, Identity, Config, Ufs, Platform) {

            $scope.check_all_schools = false;
            $scope.identity = Identity;
            $scope.schools = {};
            $scope.msg_success = false;
            $scope.msg_error = false;
            $scope.query = {
                sort: {},
                max: 5,
                page: 1,
                search: ''
            };
            $scope.selected = {
                schools: []
            };

            $scope.onCheckSelectAll = function(){
                if( $scope.check_all_schools ){
                    $scope.selected.schools = angular.copy($scope.schools.data);
                }else{
                    $scope.selected.schools = [];
                }
            };

            $scope.onModifySchool = function(school){
                Schools.update(school).$promise.then($scope.onSaved);
            };

            $scope.onSaved = function(res) {
                if(res.status === "ok") {
                    ngToast.success("Dados da escola "+res.updated.name+" salvos com sucesso!");
                    return;
                }else{
                    ngToast.danger("Ocorreu um erro ao salvar a escola!: "+res.message, res.status);
                    $scope.refresh();
                }
            };

            $scope.sendnotification = function(){

                //remove objects without email
                var schools_to_send_notification = $scope.selected.schools.filter(function(school){
                    if(school.school_email != null && school.school_email != ""){
                        return true;
                    }else{
                        return false;
                    }
                });

                if(schools_to_send_notification.length > 0){

                    Modals.show(
                        Modals.ConfirmEmail(
                            'Confirma o envio de sms e email para as seguintes escolas?',
                            'Ao confirmar o envio, as escolas selecionadas serão notificadas por email e poderão cadastrar as turmas para acompanhamento da frequência escolar.',
                            schools_to_send_notification
                        )).then(function () {
                        return Schools.send_frequency_notifications(schools_to_send_notification).$promise;
                    })
                        .then(function (res) {
                            if(res.status == "error"){
                                ngToast.danger(res.message);
                                $scope.msg_success = false;
                                $scope.msg_error = true;
                                $scope.refresh();
                                window.scrollTo(0, 0);
                            }else{
                                ngToast.warning(res.message);
                                $scope.msg_success = true;
                                $scope.msg_error = false;
                                $scope.refresh();
                                window.scrollTo(0, 0);
                            }
                        });
                }else{
                    Modals.show(Modals.Alert('Atenção', 'Selecione as escolas para as quais deseja encaminhar o email/ SMS'));
                }

            };

            $scope.refresh = function() {
                Schools.all_schools($scope.query, function(res) {
                    $scope.check_all_schools = false;
                    $scope.selected.schools = [];
                    $scope.schools = angular.copy(res);
                });
            };

            $scope.setMaxResults = function(max) {
                $scope.query.max = max;
                $scope.query.page = 1;
                $scope.refresh();
            };

            Platform.whenReady(function() {
                $scope.refresh();
            });

        });

})();
(function() {
	angular
		.module('BuscaAtivaEscolar')
		.service('API', function API($q, $rootScope, Config) {

			var numPendingRequests = 0;
			var successStatuses = [200, 201, 202, 203];
			var useableErrorStatuses = [400, 401, 403];

			var REQUIRE_AUTH = {'X-Require-Auth': 'auth-required', 'Content-Type': 'application/json'};
			var OPTIONAL_AUTH = {'X-Require-Auth': 'auth-optional', 'Content-Type': 'application/json'};

			function isLoading() {
				return (numPendingRequests > 0);
			}

			function getURI(path) {
				return '@@API@@' + path;
			}

			function getTokenURI() {
				return '@@TOKEN@@';
			}

			function hasOngoingRequests() {
				return numPendingRequests > 0;
			}

			function pushRequest() {
				numPendingRequests++;
			}

			function popRequest() {
				numPendingRequests--;
			}

			function isUseableError(status_code) {
				return useableErrorStatuses.indexOf(parseInt(status_code, 10)) !== -1;
			}

			function isSuccessStatus(status_code) {
				return successStatuses.indexOf(parseInt(status_code, 10)) !== -1;
			}

			$rootScope.isLoading = isLoading;

			this.getURI = getURI;
			this.getTokenURI = getTokenURI;
			this.pushRequest = pushRequest;
			this.popRequest = popRequest;
			this.hasOngoingRequests = hasOngoingRequests;
			this.isUseableError = isUseableError;
			this.isSuccessStatus = isSuccessStatus;
			this.isLoading = isLoading;

			this.REQUIRE_AUTH = REQUIRE_AUTH;
			this.OPTIONAL_AUTH = OPTIONAL_AUTH;

		});
})();
(function() {
	angular
		.module('BuscaAtivaEscolar')
		.service('API_PUBLIC', function API($q, $rootScope, Config) {

			var numPendingRequests = 0;
			var successStatuses = [200, 201, 202, 203];
			var useableErrorStatuses = [400, 401, 403];

			var REQUIRE_AUTH = {'X-Require-Auth': 'auth-required', 'Content-Type': 'application/json'};
			var OPTIONAL_AUTH = {'X-Require-Auth': 'auth-optional', 'Content-Type': 'application/json'};

			function isLoading() {
				return (numPendingRequests > 0);
			}

			function getURI(path) {
				return '@@API@@' + 'lp/' + path;
			}

			function getTokenURI() {
				return '@@TOKEN@@';
			}

			function hasOngoingRequests() {
				return numPendingRequests > 0;
			}

			function pushRequest() {
				numPendingRequests++;
			}

			function popRequest() {
				numPendingRequests--;
			}

			function isUseableError(status_code) {
				return useableErrorStatuses.indexOf(parseInt(status_code, 10)) !== -1;
			}

			function isSuccessStatus(status_code) {
				return successStatuses.indexOf(parseInt(status_code, 10)) !== -1;
			}

			$rootScope.isLoading = isLoading;

			this.getURI = getURI;
			this.getTokenURI = getTokenURI;
			this.pushRequest = pushRequest;
			this.popRequest = popRequest;
			this.hasOngoingRequests = hasOngoingRequests;
			this.isUseableError = isUseableError;
			this.isSuccessStatus = isSuccessStatus;
			this.isLoading = isLoading;

			this.REQUIRE_AUTH = REQUIRE_AUTH;
			this.OPTIONAL_AUTH = OPTIONAL_AUTH;

		});
})();
(function () {
  angular
      .module('BuscaAtivaEscolar')
      .service('Auth', function Auth($q, $rootScope, $localStorage, $http, $resource, $state, $location, Modals, API, Identity, Config) {

        var self = this;

        $localStorage.$default({
          session: {
            user_id: null,
            token: null,
            token_expires_at: null,
            refresh_expires_at: null
          }
        });

        function requireLogin(reason) {
          return Modals.show(Modals.Login(reason, false));
        }

        function provideToken() {
          // TODO: refresh with endpoint if first time on page
          // if ($location.$$path !== '/login') {
          //     // Isn't even logged in
          //     if (!Identity.isLoggedIn()) return requireLogin('Você precisa fazer login para realizar essa ação!');
          // }

          // Check if session is valid
          if (!$localStorage.session.token || !$localStorage.session.user_id) return $q.go('login');

          // Has valid token
          if (!isTokenExpired()) return $q.resolve($localStorage.session.token);


          //console.log("[auth::token.provide] Token expired! Refreshing...");

          // Is logged in, but both access and refresh token are expired
          if (isRefreshExpired()) {
            //console.log("[auth::token.provide] Refresh token also expired! Logging out...");
            return requireLogin('Sua sessão expirou! Por favor, entre seus dados novamente para continuar.');
          }

          // Is logged in, access token expired but refresh token still valid
          return self.refresh().then(function (session) {
            //console.log("[auth::token.provide] Refreshed, new tokens: ", session);
            return session.token;
          });

        }

        function isTokenExpired() {
          var now = (new Date()).getTime();
          return !Identity.isLoggedIn() || (now >= $localStorage.session.token_expires_at);
        }

        function isRefreshExpired() {
          var now = (new Date()).getTime();
          return !Identity.isLoggedIn() || (now >= $localStorage.session.refresh_expires_at);
        }

        function handleAuthResponse(response) {

          if (response.status !== 200) {
            //console.log("[auth::login] Rejecting Auth response! Status= ", response.status);
            return $q.reject(response.data);
          }

          if (!response.data || !response.data.token) {
            throw new Error("invalid_token_response");
          }

          $localStorage.session.token = response.data.token;
          $localStorage.session.token_expires_at = (new Date()).getTime() + (Config.TOKEN_EXPIRES_IN * 1000);
          $localStorage.session.refresh_expires_at = (new Date()).getTime() + (Config.REFRESH_EXPIRES_IN * 1000);

          // Auth.refresh doesn't return user/user_id, so we can't always set it
          if (response.data.user) {
            Identity.setCurrentUser(response.data.user);
            $localStorage.session.user_id = response.data.user.id;
          }

          validateSessionIntegrity();

          $rootScope.$broadcast('auth.logged_in');

          return $localStorage.session;
        }

        function validateSessionIntegrity() {
          if (!$localStorage.session || !$localStorage.session.user_id || !$localStorage.session.token) {
            throw new Error("invalid_session_integrity");
          }
        }

        function handleAuthError(response) {

          console.error("[auth::login] API error: ", response);

          if (!response || !response.status || !API.isUseableError(response.status)) {
            console.warn("[auth::login] Error code ", response.status, " not in list of useable errors: ", useableErrors);
            $rootScope.$broadcast('auth.error', response);
          }

          throw (response.data) ? response.data : response;
        }

        this.provideToken = provideToken;
        this.requireLogin = requireLogin;
        this.isTokenExpired = isTokenExpired;
        this.isRefreshExpired = isRefreshExpired;

        this.isLoggedIn = function () {
          return Identity.isLoggedIn();
        };

        $rootScope.$on('identity.disconnect', this.logout);

        this.logout = function () {
          //console.log('[auth] Logging out...');

          Object.assign($localStorage, {
            session: {
              user_id: null,
              token: null,
              token_expires_at: null,
              refresh_expires_at: null
            }
          });

          Identity.disconnect();

          $rootScope.$broadcast('auth.logged_out');
        };

        this.login = function (email, password) {

          var tokenRequest = {
            grant_type: 'login',
            email: email,
            password: password
          };

          var options = {
            accept: 'application/json',
          };

          return $http
              .post(API.getTokenURI(), tokenRequest, options)
              .then(handleAuthResponse, handleAuthError);
        };

        this.refresh = function () {

          var tokenRequest = {
            grant_type: 'refresh',
            token: $localStorage.session.token
          };

          var options = {
            accept: 'application/json',
          };

          return $http
              .post(API.getTokenURI(), tokenRequest, options)
              .then(handleAuthResponse, handleAuthError);
        };

      })
      .run(function (Identity, Users, Auth) {
        Identity.setTokenProvider(Auth.provideToken);
        Identity.setUserProvider(function (user_id, callback) {
          if (!user_id) return;

          var user = Users.myself({with: 'tenant'});
          user.$promise.then(callback);

          return user;
        });

        Identity.setup();
      })

})();
(function() {
//Cria o icone de download
    Highcharts.SVGRenderer.prototype.symbols.download = function (x, y, w, h) {
        var path = [
            // Arrow stem
            'M', x + w * 0.5, y,
            'L', x + w * 0.5, y + h * 0.7,
            // Arrow head
            'M', x + w * 0.3, y + h * 0.5,
            'L', x + w * 0.5, y + h * 0.7,
            'L', x + w * 0.7, y + h * 0.5,
            // Box
            'M', x, y + h * 0.9,
            'L', x, y + h,
            'L', x + w, y + h,
            'L', x + w, y + h * 0.9
        ];
        return path;
    };

	var app = angular.module('BuscaAtivaEscolar');

	app.service('Charts', function Charts(Utils) {

		function generateDimensionChart(report, seriesName, labels, chartType, yAxisLabel, valueSuffix) {

			// console.log("[charts] Generating dimension chart: ", seriesName, report);

			if(!report || !seriesName || !labels) return;
			if(!chartType) chartType = 'bar';
			if(!yAxisLabel) yAxisLabel = 'Quantidade';
			if(!valueSuffix) valueSuffix = 'casos';

			var data = [];
			var categories = [];

			for(var i in report) {
				if(!report.hasOwnProperty(i)) continue;

				var category = (labels[i]) ? labels[i] : i;

				data.push({
					name: category,
					y: report[i]
				});

				categories.push( category );

			}

			return {
				options: {
					chart: {
						type: chartType
					},
					title: {
						text: ''
					},
					subtitle: {
						text: ''
					},
					tooltip: {
						formatter: function () {
							return '<strong>' + getTranslationFor(this.x) + ': ' + this.y + ' </strong>';
							//return 'The value for <b>' + this.x +
							// '</b> is <b>' + this.y + '</b>';
						},
						style: {
							width: '300',
						}
					}
				},
				xAxis: {
					id: Utils.generateRandomID(),
					categories: categories,
					title: {
						text: null
					}
				},
				yAxis: {
					id: Utils.generateRandomID(),
					min: 0,
					title: {
						text: yAxisLabel,
						align: 'high'
					},
					labels: {
						overflow: 'justify'
					}
				},

				plotOptions: {
					bar: {
						dataLabels: {
							enabled: true
						}
					},
					pie: {
						allowPointSelect: true,
						showInLegend: true,
						cursor: 'pointer',
						dataLabels: {
							enabled: true
						}
					}
				},
				legend: {
					layout: 'vertical',
					align: 'right',
					verticalAlign: 'top',
					x: -40,
					y: 80,
					floating: true,
					borderWidth: 1,
					backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
					shadow: true,
                    useHTML: true,
                    labelFormatter: function() {
                        return '<div style="text-align: left; width:130px;float:left;">' + this.name + '</div><div style="width:40px; float:left;text-align:right;">' + this.y + '%</div>';
                    }
				},
				credits: {
					enabled: false
				},
				series: [
					{
						id: Utils.generateRandomID(),
						colorByPoint: true,
						name: seriesName,
						data: data
					}
				]
			};
		}

		function generateTimelineChart(report, chartName, labels) {

			//console.log("[charts] Generating timeline chart: ", chartName, report);

			if(!report || !chartName || !labels) return;

			var series = [];
			var categories = [];
			var data = {};
			var dates = Object.keys(report);

            var colors = [];
            colors['out_of_school'] = '#f44336';
            colors['in_school'] = '#4885f4';
            colors['cancelled'] = '#f49117';
            colors['in_observation'] = '#f4ec2b';
            colors['completed'] = '#1df40a';

            // Translates ￿date -> metric to metric -> date; prepares list of categories
			for(var date in report) {

				if(!report.hasOwnProperty(date)) continue;

				if(categories.indexOf(date) === -1) {
					categories.push(Utils.convertISOtoBRDate(date));
				}

				for(var metric in report[date]) {
					if(!report[date].hasOwnProperty(metric)) continue;
					if(!data[metric]) data[metric] = {};

					data[metric][date] = report[date][metric];

				}
			}

			// Builds series array
			for(var m in data) {
				if(!data.hasOwnProperty(m)) continue;

				var metricData = [];

				// Ensure even metrics with incomplete data (missing dates) show up accurately
				for(var i in dates) {
					if(!dates.hasOwnProperty(i)) continue;
					metricData.push( (data[m][dates[i]]) ? data[m][dates[i]] : null );
				}

				series.push({
					name: labels[m] ? labels[m] : m,
					data: metricData,
					color: labels[m] ? colors[m] : ''
				});
			}


			return {
				options: {
					chart: {
						type: 'line'
					},

					xAxis: {
						categories: categories,
						allowDecimals: false
					},

					yAxis: {
						title: {text: chartName}
					}
				},
				series: series,
				title: {
					text: ''
				},
				loading: false,
                credits: {
                    enabled: false
                }
			};
		}

		function generateDonutsChart(report, chartName, labels) {

		}

		function getTranslationFor(expr) {

			switch (expr) {
				case 'Em andamento/ Fora da escola':
					return 'De pesquisa até (re)matrícula';
				case 'Em andamento/ Dentro da escola':
					return 'Estudantes (re)matriculados: de 1ª à 4ª observação';
				case 'Casos concluídos':
					return 'Casos finalizados com sucesso após a 4ª observação';
				case 'Casos cancelados':
					return 'Casos cancelados em qualquer etapa do processo';
				case 'Completos':
					return 'Completos';
				case 'Em andamento':
					return 'Em andamento';
				case 'Casos interrompidos':
					return 'Estudantes que evadiram durante as etapas de observação e cujo o caso original foi interrompido e caso correlato foi criado na etapa de pesquisa';
				case 'Transferidos':
					return 'Casos que foram transferidos para outros municípios que fizeram adesão à Busca Ativa Escolar';
				default:
					return expr;
			}

		}

		return {
			generateDimensionChart: generateDimensionChart,
			generateTimelineChart: generateTimelineChart
		};

	});

})();
(function() {

	angular.module('BuscaAtivaEscolar').service('Identity', function ($q, $rootScope, $location, $localStorage) {

		var tokenProvider = null;
		var userProvider = null;

		$localStorage.$default({
			identity: {
				is_logged_in: false,
				current_user: {},
			}
		});

		function setup() {
			//console.info("[core.identity] Setting up identity service...");
			refreshIdentity();
		}

		function setTokenProvider(callback) {
			tokenProvider = callback;
		}

		function setUserProvider(callback) {
			userProvider = callback;
		}

		function isUserType(type) {
			if(!getCurrentUser()) return false;
			if(!getCurrentUser().type) return false;
			return getCurrentUser().type === type;
		}

		function hasTenant() {
			if(!getCurrentUser()) return false;
			return !!getCurrentUser().tenant;
		}

		function provideToken() {

			if(!tokenProvider) {
				console.error("[core.identity] No token provider registered! Rejecting...");
				return $q.reject('no_token_provider');
			}

			return tokenProvider();
		}

		function refreshIdentity() {
			if(!isLoggedIn() || !$localStorage.session.user_id) {
				//console.log("[core.identity] No identity found in session, user is logged out");
				$rootScope.$broadcast('Identity.ready');
				return;
			}

			//console.log("[core.identity] Refreshing current identity details...");

			$localStorage.identity.current_user = userProvider($localStorage.session.user_id, function(details) {
				//console.log("[core.identity] Identity details ready: ", details);
				$rootScope.$broadcast('Identity.ready');
			})
		}

		function getCurrentUser() {
			return ($localStorage.identity.current_user && $localStorage.identity.current_user.id)
				? $localStorage.identity.current_user
				: {};
		}

		function getCurrentTenant() {
			var user = getCurrentUser();
			if(!user) return null;
			return user.tenant;
		}

		function getCurrentUserID() {
			return ($localStorage.identity.current_user && $localStorage.identity.current_user.id)
				? $localStorage.identity.current_user.id
				: null;
		};

		function setCurrentUser(user) {
			if(!user) clearSession();

			$rootScope.$broadcast('identity.connected', {user: user});

			//console.log("[identity] Connected user: ", user);

			$localStorage.identity.is_logged_in = true;
			$localStorage.identity.current_user = user;

			if(window.ga) {
				window.ga('set', 'userId', user.id);
			}

			refreshIdentity();
		}

		function can(operation) {
			var user = getCurrentUser();

			if(!isLoggedIn()) return false;
			if(!user) return false;
			if(!user.permissions) return false;

			return user.permissions.indexOf(operation) !== -1;
		}

		function getType() {
			if(isLoggedIn()) return getCurrentUser().type;
			return 'guest';
		}

		function isLoggedIn() {
			return ($localStorage.identity) ? !!$localStorage.identity.is_logged_in : false;
		}

		function lgpdSigned () {
			return ($localStorage.identity) ? !!$localStorage.identity.current_user.lgpd : false;
		}

		function disconnect() {
			//console.log('[identity] Disconnecting identity...');

			clearSession();

			$rootScope.$broadcast('identity.disconnect');
			$location.path('/login');
		}

		function clearSession() {
			//console.log("[identity] Clearing current session");

			Object.assign($localStorage, {
				identity: {
					is_logged_in: false,
					current_user: {},
				}
			});
		}

		function manageImports(){
			if ( isLoggedIn() ){

				if( getType() == "coordenador_operacional" ){
					return true;
				}

				if ( getType() == "supervisor_institucional" && "group" in getCurrentUser() && getCurrentUser().group.is_primary){
					return true;
 				}

				return false;

			}else{
				return false;
			}

		}

		return {
			getCurrentUser: getCurrentUser,
			getCurrentTenant: getCurrentTenant,
			getCurrentUserID: getCurrentUserID,
			setCurrentUser: setCurrentUser,
			getType: getType,
			can: can,
			isLoggedIn: isLoggedIn,
			lgpdSigned: lgpdSigned,
			refresh: refreshIdentity,
			clearSession: clearSession,
			setup: setup,
			isUserType: isUserType,
			hasTenant: hasTenant,
			setTokenProvider: setTokenProvider,
			setUserProvider: setUserProvider,
			provideToken: provideToken,
			disconnect: disconnect,
			manageImports: manageImports
		}

	});

})();

(function() {

	var app = angular.module('BuscaAtivaEscolar');

	app.service('Language', function Language($q, $http, $rootScope, API) {

		var database = {};
		var langFile = API.getURI('language.json');
		var $promise = {};

		function setup() {
			//console.log("[platform.language] Setting up language service...");
			loadFromAPI();
		}

		function loadFromAPI() {
			//console.log("[platform.language] Loading language file...");
			$promise = $http.get(langFile).then(onDataLoaded);
		}

		function onDataLoaded(res) {
			if(!res.data || !res.data.database) {
				console.error("[platform.language] Failed to load language file: ", res);
				return;
			}

			database = res.data.database;

			//console.log("[platform.language] Language file loaded! ", Object.keys(database).length, " strings available: ", database);

			$rootScope.$broadcast('Language.ready');
		}

		function translate(word, key) {
			var stringID = key + "." + word;
			return string(stringID);
		}

		function string(stringID) {
			if(!database) return "DB_EMPTY:" + stringID;
			if(!database[stringID]) return "STR_MISSING:" + stringID;

			return database[stringID];
		}

		function getNumStrings() {
			return database.length ? database.length : 0;
		}

		function getLangFile() {
			return langFile;
		}

		function isReady() {
			return getNumStrings() > 0;
		}

		return {
			setup: setup,
			translate: translate,
			string: string,
			getNumStrings: getNumStrings,
			getLangFile: getLangFile,
			isReady: isReady,
		};

	});

	app.run(function (Language) {
		Language.setup();
	});

	app.filter('lang', function LanguageTranslateFilter(Language) {
		var $fn = function(word, key) {
			return Language.translate(word, key);
		};

		$fn.$stateful = true; // TODO: optimize so this is not needed

		return $fn;
	});

	app.filter('string', function LanguageStringFilter(Language) {
		var $fn =  function(stringID) {
			return Language.string(stringID);
		};

		$fn.$stateful = true; // TODO: optimize so this is not needed

		return $fn;
	});

})();
(function() {

	angular.module('BuscaAtivaEscolar').factory('MockData', function () {

		var alertReasons = [
			"Adolescente em conflito com a lei",
			"Criança ou adolescente com deficiência(s)",
			"Criança ou adolescente com doença(s) que impeça(m) ou dificulte(m) a frequência à escola",
			"Criança ou adolescente em abrigo",
			"Criança ou adolescente em situação de rua",
			"Criança ou adolescente vítima de abuso / violência sexual",
			"Evasão porque sente a escola desinteressante",
			"Falta de documentação da criança ou adolescente",
			"Falta de infraestrutura escolar",
			"Falta de transporte escolar",
			"Gravidez na adolescência",
			"Preconceito ou discriminação racial",
			"Trabalho infantil",
			"Uso, abuso ou dependência de substâncias psicoativas",
			"Violência familiar",
			"Violência na escola"
		];
		var alertReasonsPriority = [
			{'name' : "Adolescente em conflito com a lei" ,
			 'priority': 1},
			{'name' : "Criança ou adolescente com deficiência(s)",
			 'priority': 1},
			{'name' : "Criança ou adolescente com doença(s) que impeça(m) ou dificulte(m) a frequência à escola",
			 'priority': 2},
			{'name' : "Criança ou adolescente em abrigo",
			 'priority': 1},
			{'name' : "Criança ou adolescente em situação de rua",
			 'priority': 1},
			{'name' : "Criança ou adolescente vítima de abuso / violência sexual",
			 'priority': 1},
			{'name' : "Evasão porque sente a escola desinteressante",
			 'priority': 3},
			{'name' : "Falta de documentação da criança ou adolescente",
			 'priority': 3},
			{'name' : "Falta de infraestrutura escolar",
			 'priority': 2},
			{'name' : "Falta de transporte escolar",
			 'priority': 3},
			{'name' : "Gravidez na adolescência",
			 'priority': 2},
			{'name' : "Preconceito ou discriminação racial",
			 'priority': 1},
			{'name' : "Uso, abuso ou dependência de substâncias psicoativas",
			 'priority': 1},
			{'name' : "Trabalho infantil",
			 'priority': 1},
			{'name' : "Violência familiar",
			 'priority': 1},
			{'name' : "Violência na escola",
			 'priority': 1},
		];

		var searchReasons = [
			"Adolescente em conflito com a lei",
			"Criança ou adolescente com deficiência física",
			"Criança ou adolescente com deficiência intelectual",
			"Criança ou adolescente com deficiência mental",
			"Criança ou adolescente com deficiência sensorial",
			"Criança ou adolescente com doenças (que impedem e/ou dificultem a frequência à escola)",
			"Criança ou adolescente em abrigos",
			"Criança ou adolescente em situação de rua",
			"Criança ou adolescente que sofrem ou sofreram abuso / violência sexual",
			"Evasão porque sente a escola desinteressante",
			"Falta de documentação da criança ou adolescente",
			"Falta de infraestrutura escolar (Escola)",
			"Falta de infraestrutura escolar (Vagas)",
			"Falta de transporte escolar",
			"Gravidez na adolescência",
			"Preconceito ou discriminação racial",
			"Trabalho infantil",
			"Uso, abuso ou dependência de substâncias psicoativas",
			"Violência familiar",
			"Violência na escola (Discriminação de gênero)",
			"Violência na escola (Discriminação racial)",
			"Violência na escola (Discriminação religiosa)"
		];

		var states = [
			{id: 'SP', name: 'São Paulo'},
			{id: 'MG', name: 'Minas Gerais'},
			{id: 'RJ', name: 'Rio de Janeiro'},
			{id: 'DF', name: 'Distrito Federal'}
		];

		var cities = [
			{id: 1, state: 'SP', name: 'São Paulo'},
			{id: 2, state: 'SP', name: 'Campinas'},
			{id: 3, state: 'MG', name: 'Belo Horizonte'},
			{id: 4, state: 'RJ', name: 'Rio de Janeiro'},
			{id: 5, state: 'DF', name: 'Brasília'}
		];

		var groups = [
			{id: 1, name: 'Secretaria de Segurança Pública'},
			{id: 2, name: 'Secretaria da Educação'},
			{id: 3, name: 'Secretaria do Verde e Meio Ambiente'},
			{id: 4, name: 'Secretaria dos Transportes'}
		];

		var userTypes = [
			{id: 1, name: 'Agente Comunitário'},
			{id: 2, name: 'Técnico(a) Verificador'},
			{id: 3, name: 'Supervisor(a) Institucional'},
			{id: 4, name: 'Coordenador(a) Operacional'}
		];

		var brazilMapData = [
			{
				"hc-key": "br-sp",
				"value": 0
			},
			{
				"hc-key": "br-ma",
				"value": 1
			},
			{
				"hc-key": "br-pa",
				"value": 2
			},
			{
				"hc-key": "br-sc",
				"value": 3
			},
			{
				"hc-key": "br-ba",
				"value": 4
			},
			{
				"hc-key": "br-ap",
				"value": 5
			},
			{
				"hc-key": "br-ms",
				"value": 6
			},
			{
				"hc-key": "br-mg",
				"value": 7
			},
			{
				"hc-key": "br-go",
				"value": 8
			},
			{
				"hc-key": "br-rs",
				"value": 9
			},
			{
				"hc-key": "br-to",
				"value": 10
			},
			{
				"hc-key": "br-pi",
				"value": 11
			},
			{
				"hc-key": "br-al",
				"value": 12
			},
			{
				"hc-key": "br-pb",
				"value": 13
			},
			{
				"hc-key": "br-ce",
				"value": 14
			},
			{
				"hc-key": "br-se",
				"value": 15
			},
			{
				"hc-key": "br-rr",
				"value": 16
			},
			{
				"hc-key": "br-pe",
				"value": 17
			},
			{
				"hc-key": "br-pr",
				"value": 18
			},
			{
				"hc-key": "br-es",
				"value": 19
			},
			{
				"hc-key": "br-rj",
				"value": 20
			},
			{
				"hc-key": "br-rn",
				"value": 21
			},
			{
				"hc-key": "br-am",
				"value": 22
			},
			{
				"hc-key": "br-mt",
				"value": 23
			},
			{
				"hc-key": "br-df",
				"value": 24
			},
			{
				"hc-key": "br-ac",
				"value": 25
			},
			{
				"hc-key": "br-ro",
				"value": 26
			}
		];

		var caseStatuses = [
			'Em andamento',
			'Em atraso',
			'Concluído',
			'Dentro da escola',
			'Fora da escola'
		];

		return {

			alertReasons: alertReasons,
			searchReasons: searchReasons,
			caseStatuses: caseStatuses,
			alertReasonsPriority: alertReasonsPriority,

			states: states,
			cities: cities,
			groups: groups,
			userTypes: userTypes,


			caseTypesChart: {
				options: {
					chart: {
						type: 'bar'
					},
					title: {
						text: ''
					},
					subtitle: {
						text: ''
					}
				},
				xAxis: {
					categories: alertReasons,
					title: {
						text: null
					}
				},
				yAxis: {
					min: 0,
					title: {
						text: 'Quantidade de casos',
						align: 'high'
					},
					labels: {
						overflow: 'justify'
					}
				},
				tooltip: {
					valueSuffix: ' casos'
				},
				plotOptions: {
					bar: {
						dataLabels: {
							enabled: true
						}
					}
				},
				legend: {
					layout: 'vertical',
					align: 'right',
					verticalAlign: 'top',
					x: -40,
					y: 80,
					floating: true,
					borderWidth: 1,
					backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
					shadow: true
				},
				credits: {
					enabled: false
				},
				series: [
					{
						name: 'Alertas realizados',
						data: [105, 95, 42, 74, 38, 10, 12, 50, 70, 60, 40, 122, 78, 47]
					}//,
					//{
					//	name: 'Crianças (re)matriculadas',
					//	data: [107, 31, 63, 20, 2, 50, 74, 38, 10, 12, 5, 10, 6, 40]
					//},
					//{
					//	name: 'Crianças dentro da escola consolidadas',
					//	data: [50, 20, 10, 25, 212, 40, 91, 12, 16, 20, 22, 21, 20, 23]
					//},
					//{
					//	name: 'Casos em andamento',
					//	data: [13, 15, 94, 40, 6, 5, 8, 3, 9, 10, 12, 4, 5, 1]
					//}
				]
			},

			evolutionChart: {
				type: 'LineChart',
				options: {
					"colors": ['#0000FF', '#009900', '#CC0000', '#DD9900'],
					"defaultColors": ['#0000FF', '#009900', '#CC0000', '#DD9900'],
					"isStacked": "true",
					"fill": 20,
					"displayExactValues": true,
					"vAxis": {
						"title": "Casos",
						"gridlines": {
							"count": 10
						}
					},
					"hAxis": {
						"title": "Período"
					}
				},
				data: {
					"cols": [{
						id: "period",
						label: "Período",
						type: "string"
					}, {
						id: "open-cases",
						label: "Alertas realizados",
						type: "number"
					}, {
						id: "pending-cases",
						label: "Casos em andamento",
						type: "number"
					}, {
						id: "closed-cases",
						label: "Crianças (re)matriculadas",
						type: "number"
					}],
					"rows": [{
						c: [{
							v: "Primeira semana"
						}, {
							v: 100
						}, {
							v: 15
						}, {
							v: 50
						}]
					}, {
						c: [{
							v: "Segunda semana"
						}, {
							v: 80
						}, {
							v: 20
						}, {
							v: 60
						}]

					}, {
						c: [{
							v: "Terceira semana"
						}, {
							v: 60
						}, {
							v: 30
						}, {
							v: 120
						}]
					}, {
						c: [{
							v: "Quarta semana"
						}, {
							v: 75
						}, {
							v: 25
						}, {
							v: 160
						}]
					}]
				}
			},

			generateCasesTimelineChart: function() {

				var settings = {
					options: {
						chart: {
							type: 'line'
						},

						xAxis: {
							currentMin: 1,
							currentMax: 30,
							title: {text: 'Últimos 30 dias'},
							allowDecimals: false
						},

						yAxis: {
							title: {text: 'Quantidade de casos'}
						}
					},
					series: [
						{
							name: 'Alertas realizados',
							data: []
						},
						{
							name: 'Casos em andamento',
							data: []
						},
						{
							name: 'Crianças (re)matriculadas',
							data: []
						}
					],
					title: {
						text: ''
					},

					loading: false
				};

				var numDays = 30;

				for(var i = 0; i < 30; i++) {
					settings.series[0].data.push(Math.floor(160 + (Math.random() * (numDays / 2))));
					settings.series[1].data.push(Math.floor(150 + (Math.random() * (numDays / 2))));
					settings.series[2].data.push(Math.floor(120 + (Math.random() * (numDays / 2))));
				}

				return settings;

			},

			brazilMapData: brazilMapData,

			brazilMapSettings: {

				options: {
					legend: {
						enabled: false
					},
					plotOptions: {
						map: {
							mapData: Highcharts.maps['countries/br/br-all'],
							joinBy: ['hc-key']
						}
					},

					mapNavigation: {
						enabled: true,
						buttonOptions: {
							verticalAlign: 'bottom'
						}
					},

					colorAxis: {
						min: 0
					}
				},

				chartType: 'map',
				title: {
					text: ''
				},

				series : [{
					data : brazilMapData,
					mapData: Highcharts.maps['countries/br/br-all'],
					joinBy: 'hc-key',
					name: 'Quantidade (abs)',
					states: {
						hover: {
							color: '#BADA55'
						}
					},
					dataLabels: {
						enabled: true,
						format: '{point.name}'
					}
				}]
			}


		}

	});

})();
(function () {
  angular
    .module('BuscaAtivaEscolar')
    .factory('Modals', function ($q, $uibModal) {
      return {
        show: function (params) {
          //console.log('[modals] Show modal: ', params);

          var def = $q.defer();

          var instance = $uibModal.open(params);

          instance.result.then(
            function (data) {
              def.resolve(data.response);
            },
            function (data) {
              def.reject(data);
            }
          );

          return def.promise;
        },

        Alert: function (message, details) {
          return {
            templateUrl: '/views/modals/alert.html',
            controller: 'AlertModalCtrl',
            size: 'sm',
            resolve: {
              message: function () {
                return message;
              },
              details: function () {
                return details;
              },
            },
          };
        },

        Confirm: function (message, details, canDismiss) {
          var params = {
            templateUrl: '/views/modals/confirm.html',
            controller: 'ConfirmModalCtrl',
            size: 'sm',
            resolve: {
              message: function () {
                return message;
              },
              details: function () {
                return details;
              },
              canDismiss: function () {
                return canDismiss;
              },
            },
          };

          if (!canDismiss) {
            params.keyboard = false;
            params.backdrop = 'static';
          }

          return params;
        },

        ConfirmLarge: function (message, details, canDismiss) {
          var params = {
            templateUrl: '/views/modals/confirm.html',
            controller: 'ConfirmLargeModalCtrl',
            size: 'lg',
            resolve: {
              message: function () {
                return message;
              },
              details: function () {
                return details;
              },
              canDismiss: function () {
                return canDismiss;
              },
            },
          };

          if (!canDismiss) {
            params.keyboard = false;
            params.backdrop = 'static';
          }

          return params;
        },

        ConfirmEmail: function (message, details, schools, canDismiss) {
          var params = {
            templateUrl: '/views/modals/confirm_email.html',
            controller: 'ConfirmEmailModalCtrl',
            size: 'lg',
            resolve: {
              message: function () {
                return message;
              },
              details: function () {
                return details;
              },
              schools: function () {
                return schools;
              },
              canDismiss: function () {
                return canDismiss;
              },
            },
          };

          if (!canDismiss) {
            params.keyboard = false;
            params.backdrop = 'static';
          }

          return params;
        },

        GeneralAlerts: function (message, canDismiss) {
          var params = {
            templateUrl: '/views/modals/general.html',
            controller: 'GeneralAlertsModalCtrl',
            size: 'lg',
            resolve: {
              message: function () {
                return message;
              },
              canDismiss: function () {
                return canDismiss;
              },
            },
          };

          if (!canDismiss) {
            params.keyboard = false;
            params.backdrop = 'static';
          }

          return params;
        },

        /**
         * Função do pop-up após o login.
         * @param {*} message
         * @param {*} canDismiss
         * @returns
         */
        GeneralPopUpAlerts: function (message, canDismiss) {
          var params = {
            templateUrl: '/views/modals/add_popup_search.html',
            controller: 'GeneralAlertsModalCtrl',
            size: 'md',
            resolve: {
              message: function () {
                return message;
              },
              canDismiss: function () {
                return canDismiss;
              },
            },
          };

          if (!canDismiss) {
            params.keyboard = false;
            params.backdrop = 'static';
          }

          return params;
        },

        Prompt: function (
          question,
          defaultAnswer,
          canDismiss,
          answerPlaceholder
        ) {
          var params = {
            templateUrl: '/views/modals/prompt.html',
            controller: 'PromptModalCtrl',
            size: 'md',
            resolve: {
              question: function () {
                return question;
              },
              defaultAnswer: function () {
                return defaultAnswer;
              },
              canDismiss: function () {
                return canDismiss;
              },
              answerPlaceholder: function () {
                return answerPlaceholder;
              },
            },
          };

          if (!canDismiss) {
            params.keyboard = false;
            params.backdrop = 'static';
          }

          return params;
        },

        NewSupportTicketModal: function () {
          var params = {
            templateUrl: '/views/modals/new_support_ticket.html',
            controller: 'NewSupportTicketModalCtrl',
            size: 'md',
            resolve: {},
          };

          return params;
        },

        Login: function (reason, canDismiss) {
          var params = {
            templateUrl: '/views/modals/login.html',
            controller: 'LoginModalCtrl',
            size: 'md',
            resolve: {
              reason: function () {
                return reason;
              },
              canDismiss: function () {
                return canDismiss;
              },
            },
          };

          if (!canDismiss) {
            params.keyboard = false;
            params.backdrop = 'static';
          }

          return params;
        },

        UserPicker: function (
          title,
          message,
          users,
          canDismiss,
          noUsersMessage
        ) {
          var params = {
            templateUrl: '/views/modals/user_picker.html',
            controller: 'UserPickerModalCtrl',
            size: 'md',
            resolve: {
              title: function () {
                return title;
              },
              message: function () {
                return message;
              },
              noUsersMessage: function () {
                return noUsersMessage;
              },
              users: function () {
                return users;
              },
              canDismiss: function () {
                return canDismiss;
              },
            },
          };

          if (!canDismiss) {
            params.keyboard = false;
            params.backdrop = 'static';
          }

          return params;
        },

        CaseCancel: function () {
          return {
            templateUrl: '/views/modals/case_cancel.html',
            controller: 'CaseCancelModalCtrl',
            size: 'md',
          };
        },

        FileUploader: function (title, message, uploadUrl, uploadParameters) {
          return {
            templateUrl: '/views/modals/file_uploader.html',
            controller: 'FileUploaderModalCtrl',
            size: 'md',
            resolve: {
              title: function () {
                return title;
              },
              message: function () {
                return message;
              },
              uploadUrl: function () {
                return uploadUrl;
              },
              uploadParameters: function () {
                return uploadParameters;
              },
            },
          };
        },

        FileUploaderTitulo: function (
          title,
          message,
          uploadUrl,
          uploadParameters
        ) {
          return {
            templateUrl: '/views/modals/file_uploader_titulo.html',
            controller: 'FileUploaderTituloModalCtrl',
            size: 'md',
            resolve: {
              title: function () {
                return title;
              },
              message: function () {
                return message;
              },
              uploadUrl: function () {
                return uploadUrl;
              },
              uploadParameters: function () {
                return uploadParameters;
              },
            },
          };
        },

        DownloadLink: function (title, message, href) {
          return {
            templateUrl: '/views/modals/download_link.html',
            controller: 'DownloadLinkModalCtrl',
            size: 'md',
            resolve: {
              title: function () {
                return title;
              },
              message: function () {
                return message;
              },
              href: function () {
                return href;
              },
            },
          };
        },

        CaseReopen: function ($typeUser) {
          var params = {
            templateUrl: '/views/modals/case_reopen.html',
            controller: 'CaseReopenModalCtrl',
            size: 'md',
            resolve: {
              $typeUser: function () {
                return $typeUser;
              },
            },
          };

          return params;
        },

        CaseTransfer: function ($typeUser) {
          var params = {
            templateUrl: '/views/modals/case_transfer.html',
            controller: 'CaseTransferModalCtrl',
            size: 'md',
            resolve: {
              $typeUser: function () {
                return $typeUser;
              },
            },
          };

          return params;
        },

        CaseReject: function ($typeUser) {
          var params = {
            templateUrl: '/views/modals/case_reject.html',
            controller: 'CaseRejectModalCtrl',
            size: 'md',
            resolve: {
              $typeUser: function () {
                return $typeUser;
              },
            },
          };

          return params;
        },

        CaseActivityLogEntry: function () {
          var params = {
            templateUrl: '/views/modals/case_activity_log_entry.html',
            controller: 'CaseActivityLogEntryCtrl',
            size: 'md',
            resolve: {},
          };

          //if (!canDismiss) {
          //params.keyboard = false;
          //params.backdrop = 'static';
          //}

          return params;
        },

        AddPeriodFrequency: function (
          message,
          subtitle,
          clazz,
          period,
          canDismiss
        ) {
          var params = {
            templateUrl: '/views/modals/add_period_frequency.html',
            controller: 'AddPeriodFrequencyModalCtrl',
            size: 'md',
            resolve: {
              message: function () {
                return message;
              },
              subtitle: function () {
                return subtitle;
              },
              clazz: function () {
                return clazz;
              },
              period: function () {
                return period;
              },
              canDismiss: function () {
                return canDismiss;
              },
            },
          };

          if (!canDismiss) {
            params.keyboard = false;
            params.backdrop = 'static';
          }

          return params;
        },
      };
    });
})();

(function () {

    angular.module('BuscaAtivaEscolar')
        .service('Notifications', function ($interval, $location, $rootScope, ngToast, Auth, Identity, Config, Platform, UserNotifications) {

            var notifications = [];
            var seenNotifications = [];
            var isBusy = false;

            function refresh(isFirstRefresh) {

                if (!Identity.isLoggedIn()) return;
                if (Auth.isRefreshExpired()) return;
                if (!Identity.can('notifications')) return;

                isBusy = true;

                UserNotifications.getUnread({$hide_loading_feedback: true}, function (res) {
                    notifications = res.data;
                    isBusy = false;
                    setTimeout(emitToastsOnNewNotifications(isFirstRefresh), 60000);
                });
            }

            function setup() {
                refresh(true);

                $interval(checkForNewNotifications, Config.NOTIFICATIONS_REFRESH_INTERVAL);

                $rootScope.$on('auth.logged_in', function () {
                    notifications = [];
                    seenNotifications = [];

                    refresh(true);
                });

                $rootScope.$on('auth.logged_out', function () {
                    notifications = [];
                    seenNotifications = [];
                });
            }

            function checkForNewNotifications() {
                refresh(false);
            }

            function emitToastsOnNewNotifications(isFirstRefresh) {

                if (!notifications) return;

                for (var i in notifications) {
                    if (!notifications.hasOwnProperty(i)) continue;
                    if (seenNotifications.indexOf(notifications[i].id) !== -1) continue;

                    seenNotifications.push(notifications[i].id);

                    if (isFirstRefresh) continue;

                    ngToast.create({
                        className: notifications[i].data.type || 'info',
                        content: notifications[i].data.title
                    })
                }

                if (isFirstRefresh) {
                    console.info("[notifications.init] ", notifications.length, " notifications unread");
                }
            }

            function isLoading() {
                return isBusy;
            }

            function hasUnread() {
                return (notifications && notifications.length > 0);
            }

            function markAsRead(notification) {
                if (!notification) return false;
                UserNotifications.markAsRead({id: notification.id}, function () {
                    refresh();
                });
            }

            function open(notification) {
                if (!notification) return false;
                if (!notification.open_url) return false;

                $location.url(notification.open_url);

                return false;
            }

            function getNotifications() {
                return notifications;
            }

            return {
                getUnread: getNotifications,
                markAsRead: markAsRead,
                open: open,
                refresh: refresh,
                isBusy: isLoading,
                hasUnread: hasUnread,
                setup: setup,
            }

        })
        .run(function (Notifications) {
            Notifications.setup();
        })

})();

(function() {

	angular.module('BuscaAtivaEscolar')
		.run(function (Platform) {
			Platform.setup();
		})
		.service('Platform', function Platform($q, $state, $rootScope, StaticData, Language) {

			var servicesRequired = [
				'StaticData',
				'Language',
				'Identity'
			];

			var servicesReady = [];
			var allReady = false;

			var flags = {};

			var whenReadyCallbacks = [];

			function setup() {

				//console.log('[platform.service_registry] Setting up service registry...');

				for(var i in servicesRequired) {
					if(!servicesRequired.hasOwnProperty(i)) continue;

					//console.log("\tAwait for service: ", servicesRequired[i]);

					$rootScope.$on(servicesRequired[i] + '.ready', function(event) {
						onServiceReady(event.name.split('.').shift());
					})
				}

				$rootScope.$on('$stateChangeStart', clearRegisteredCallbacks);
				$rootScope.$on('$stateChangeSuccess', checkIfAllServicesReady);
				$rootScope.$on('Platform.ready', fireRegisteredCallbacks);
			}

			function setFlag(flag, value) {
				//console.log('[platform.flags] Set flag: ', flag, '->', value);
				flags[flag] = value;
			}

			function getFlag(flag) {
				return flags[flag];
			}

			function onServiceReady(service) {
				//console.log('[platform.service_registry] Service is ready: ' + service);

				if(servicesReady.indexOf(service) === -1) {
					servicesReady.push(service);
				}

				checkIfAllServicesReady();
			}

			function clearRegisteredCallbacks() {
				//console.log('[platform.service_registry] Cleared callbacks');
				whenReadyCallbacks = [];
			}

			function checkIfAllServicesReady() {
				if(servicesReady.length < servicesRequired.length) return;
				allReady = true;

				//console.log("[platform.service_registry] All services ready!");

				$rootScope.$broadcast('Platform.ready');
			}

			function fireRegisteredCallbacks() {
				//console.log('[platform.service_registry] Firing registered callbacks: ', whenReadyCallbacks);
				for(var i in whenReadyCallbacks) {
					if(!whenReadyCallbacks.hasOwnProperty(i)) continue;
					whenReadyCallbacks[i]();
				}
			}

			function isReady() {
				return allReady;
			}

			function whenReady(callback) {
				if(isReady()) return callback(); // Callback being registered post-ready, so we can already ping it

				whenReadyCallbacks.push(callback);
			}

			return {
				setup: setup,
				isReady: isReady,
				whenReady: whenReady,
				setFlag: setFlag,
				getFlag: getFlag,
			}

		});

})();
(function() {

	angular.module('BuscaAtivaEscolar')
		.run(function (Platform) {
			Platform.setup();
		})
		.service('Ufs', function Platform() {
			return [
                {"nome": "Acre", "sigla": "AC"},
                {"nome": "Alagoas", "sigla": "AL"},
                {"nome": "Amapá", "sigla": "AP"},
                {"nome": "Amazonas", "sigla": "AM"},
                {"nome": "Bahia", "sigla": "BA"},
                {"nome": "Ceará", "sigla": "CE"},
                {"nome": "Distrito Federal", "sigla": "DF"},
                {"nome": "Espírito Santo", "sigla": "ES"},
                {"nome": "Goiás", "sigla": "GO"},
                {"nome": "Maranhão", "sigla": "MA"},
                {"nome": "Mato Grosso", "sigla": "MT"},
                {"nome": "Mato Grosso do Sul", "sigla": "MS"},
                {"nome": "Minas Gerais", "sigla": "MG"},
                {"nome": "Pará", "sigla": "PA"},
                {"nome": "Paraíba", "sigla": "PB"},
                {"nome": "Paraná", "sigla": "PR"},
                {"nome": "Pernambuco", "sigla": "PE"},
                {"nome": "Piauí", "sigla": "PI"},
                {"nome": "Rio de Janeiro", "sigla": "RJ"},
                {"nome": "Rio Grande do Norte", "sigla": "RN"},
                {"nome": "Rio Grande do Sul", "sigla": "RS"},
                {"nome": "Rondônia", "sigla": "RO"},
                {"nome": "Roraima", "sigla": "RR"},
                {"nome": "Santa Catarina", "sigla": "SC"},
                {"nome": "São Paulo", "sigla": "SP"},
                {"nome": "Sergipe", "sigla": "SE"},
                {"nome": "Tocantins", "sigla": "TO"}
            ]

		});

})();
(function () {

    identify("core", "utils.js");

    var app = angular.module('BuscaAtivaEscolar');

    app
        .run(function () {
            Array.prototype.shuffle = function () {
                var i = this.length, j, temp;
                if (i == 0) return this;
                while (--i) {
                    j = Math.floor(Math.random() * (i + 1));
                    temp = this[i];
                    this[i] = this[j];
                    this[j] = temp;
                }
                return this;
            };

            Array.prototype.clone = function () {
                return this.slice(0);
            };

        })
        .filter('orderObjectBy', function () {
            return function (items, field, reverse) {
                var filtered = [];

                angular.forEach(items, function (item) {
                    filtered.push(item);
                });

                filtered.sort(function (a, b) {
                    return (a[field] > b[field] ? 1 : -1);
                });

                if (reverse) filtered.reverse();

                return filtered;
            };
        })
        .factory('Utils', function (ngToast) {

            function generateRandomID() {
                return 'rand-' + (new Date()).getTime() + '-' + Math.round(Math.random() * 10000);
            }

            function convertISOtoBRDate(iso_date) {
                if (!iso_date) return '';
                return iso_date.split('-').reverse().join('/');
            }

            function convertBRtoISODate(br_date) {
                if (!br_date) return '';
                return br_date.split('/').reverse().join('-');
            }

            function prepareDateFields(data, dateOnlyFields) {
                for (var i in data) {
                    if (!data.hasOwnProperty(i)) continue;
                    if (dateOnlyFields.indexOf(i) === -1) continue;

                    if (!data[i]) continue;
                    if (("" + data[i]).length <= 0) continue;

                    data[i] = stripTimeFromTimestamp(data[i]);

                    if (("" + data[i]).toLowerCase() === "invalid date") {
                        data[i] = null;
                    }
                }

                return data;
            }

            function prepareCityFields(data, cityFields) {
                for (var i in data) {
                    if (!data.hasOwnProperty(i)) continue;
                    if (cityFields.indexOf(i) === -1) continue;

                    data[i + '_id'] = data[i] ? data[i].id : null;
                    data[i + '_name'] = data[i] ? data[i].name : null;
                }

                return data;
            }

            function unpackDateFields(data, dateOnlyFields) {

                for (var i in data) {
                    if (!data.hasOwnProperty(i)) continue;
                    if (dateOnlyFields.indexOf(i) === -1) continue;
                    data[i] = new Date(data[i] + " 00:00:00");
                }
                return data;
            }

            function stripTimeFromTimestamp(timestamp) {
                return moment(timestamp).format('YYYY-MM-DD');
            }

            function displayValidationErrors(response) {
                if (!response || !response.messages) return false;

                for (var i in response.messages) {
                    if (!response.messages.hasOwnProperty(i)) continue;
                    ngToast.danger(response.messages[i])
                }

                return true;
            }

            function filter(obj, predicate) {
                if (obj.constructor === Array) return obj.filter(predicate);

                var result = {}, key;

                for (key in obj) {
                    if (obj.hasOwnProperty(key) && !!predicate(obj[key])) {
                        result[key] = obj[key];
                    }
                }

                return result;
            }

            function extract(field, obj, predicate) {
                var filtered = filter(obj, predicate);
                var result = [];

                for (var i in filtered) {
                    if (!filtered.hasOwnProperty(i)) continue;
                    result.push(filtered[i][field]);
                }

                return result;
            }

            function pluck(collection, value_column, key_column) {
                var hasKeyColumn = !!key_column;
                var plucked = (hasKeyColumn) ? {} : [];

                for (var i in collection) {
                    if (!collection.hasOwnProperty(i)) continue;

                    var value = collection[i][value_column] ? collection[i][value_column] : null;

                    if (!hasKeyColumn) {
                        plucked.push(value);
                        continue;
                    }

                    var key = collection[i][key_column] ? collection[i][key_column] : i;
                    plucked[key] = value;

                }

                return plucked;
            }

            function search(object, callback) {
                for (var i in object) {
                    if (!object.hasOwnProperty(i)) continue;
                    if (callback(object[i])) return object[i];
                }

                return false;
            }

            function validateFields(data, requiredFields) {
                var invalid = [];

                for (var i in requiredFields) {
                    if (!requiredFields.hasOwnProperty(i)) continue;
                    if (data[requiredFields[i]]) continue;

                    invalid.push(requiredFields[i]);
                }

                return invalid;
            }

            function isValid(data, requiredFields, fieldNames, message) {
                var invalidFields = validateFields(data, requiredFields);

                if (invalidFields.length <= 0) return true;

                message += invalidFields
                    .map(function (field) {
                        return fieldNames[field] || field;
                    })
                    .join(", ");

                ngToast.danger(message);

                return false;
            }

            function haveEqualsValue(name, values) {
                var value = _.uniq(values)
                if(value.length === 1){
                    ngToast.danger(name + ' não podem ser iguais');
                    return false;
                }else{
                    return true;
                }
            }
            
            function isvalidTerm(value) {
                if (value)
                    return true;
                ngToast.danger("Os TERMOS DE USO E POLÍTICA DE PRIVACIDADE precisam ser lidos e aceitos");
                return false;
            }

            function basename(str) {
                var base = ("" + str).substring(str.lastIndexOf('/') + 1);

                if (base.lastIndexOf(".") !== -1) {
                    base = base.substring(0, base.lastIndexOf("."));
                }

                return base;
            }

            function renderCallStack(stack, knownRootPaths) {
                if (!stack) return ['[ empty stack! ]'];

                var messages = [];
                var maxCalls = 12;
                var numCalls = 0;

                for (var callNum in stack) {

                    if (numCalls++ > maxCalls) {
                        messages.push("[ snip ... other " + (stack.length - numCalls) + " calls in stack ]");
                        return messages;
                    }

                    if (!stack.hasOwnProperty(callNum)) continue;
                    var c = stack[callNum];

                    messages.push(
                        'at '
                        + (c.class ? c.class : '[root]')
                        + (c.type ? c.type : '@')
                        + (c.function ? c.function : '[anonymous function]')
                        + '()'
                        + ((c.file) ? (" @ " + basename(c.file) + ':' + (c.line ? c.line : '[NL]')) : ' [no file]')
                    );
                }

                return messages;

            }

            return {
                stripTimeFromTimestamp: stripTimeFromTimestamp,
                prepareDateFields: prepareDateFields,
                prepareCityFields: prepareCityFields,
                unpackDateFields: unpackDateFields,
                convertISOtoBRDate: convertISOtoBRDate,
                displayValidationErrors: displayValidationErrors,
                convertBRtoISODate: convertBRtoISODate,
                generateRandomID: generateRandomID,
                validateFields: validateFields,
                renderCallStack: renderCallStack,
                isValid: isValid,
                basename: basename,
                filter: filter,
                extract: extract,
                pluck: pluck,
                search: search,
                haveEqualsValue: haveEqualsValue,
                isvalidTerm: isvalidTerm
            };
        })
        .directive('stringToNumber', function () {
            return {
                require: 'ngModel',
                link: function (scope, element, attrs, ngModel) {
                    ngModel.$parsers.push(function (value) {
                        return '' + value;
                    });
                    ngModel.$formatters.push(function (value) {
                        return parseFloat(value);
                    });
                }
            };
        })
        .filter('parseDate', function () {
            return function (input) {
                return new Date(input);
            };
        });

})();

function identify(namespace, file) {
    //console.log("[core.load] ", namespace, file);
}
(function() {
	angular
		.module('BuscaAtivaEscolar')
		.factory('Alerts', function Alerts(API, Identity, $resource) {

			var headers = API.REQUIRE_AUTH;

			return $resource(API.getURI('alerts/:id'), {id: '@id'}, {
				find: {method: 'GET', headers: headers},
				getPending: {url: API.getURI('alerts/pending'), isArray: false, method: 'GET', headers: headers},
				mine: {url: API.getURI('alerts/mine'), isArray: false, method: 'GET', headers: headers},
				accept: {url: API.getURI('alerts/:id/accept'), method: 'POST', headers: headers},
				reject: {url: API.getURI('alerts/:id/reject'), method: 'POST', headers: headers}
			});
		});
})();
(function() {
	angular
		.module('BuscaAtivaEscolar')
		.factory('CaseSteps', function CaseSteps(API, Identity, $resource) {

			var headers = API.REQUIRE_AUTH;

			var repository = $resource(API.getURI('steps/:type/:id'), {id: '@id', type: '@type', with: '@with'}, {
				find: {method: 'GET', headers: headers},
				save: {method: 'POST', headers: headers},
				complete: {url: API.getURI('steps/:type/:id/complete'), method: 'POST', headers: headers},
				assignableUsers: {url: API.getURI('steps/:type/:id/assignable_users'), method: 'GET', headers: headers},
				assignUser: {url: API.getURI('steps/:type/:id/assign_user'), method: 'POST', headers: headers}
			});

			repository.where = {
				idEquals: function(id) {
					return function(item) { return item.id === id; }
				},

				caseCurrentStepIdEquals: function(id) {
					return function(item) { return item.current_step_id === id; }
				}
			};

			return repository;

		});
})();
(function() {
	angular
		.module('BuscaAtivaEscolar')
		.factory('Cases', function Cases(API, Identity, $resource) {

			var headers = API.REQUIRE_AUTH;

			return $resource(API.getURI('cases/:id'), {id: '@id', with: '@with'}, {
				find: {method: 'GET', headers: headers},
				update: {method: 'POST', headers: headers}
			});

		});
})();
(function() {
	angular
		.module('BuscaAtivaEscolar')
		.factory('Children', function Children(API, Identity, $resource) {

			var headers = API.REQUIRE_AUTH;

			var Children = $resource(API.getURI('children/:id'), {id: '@id'}, {
				find: {method: 'GET', headers: headers, params: {with: 'reopens'}},
				update: {method: 'POST', headers: headers},
				search: {url: API.getURI('children/search'), method: 'POST', isArray: false, headers: headers},
				export: {url: API.getURI('children/export'), method: 'POST', isArray: false, headers: headers},
				getComments: {url: API.getURI('children/:id/comments'), isArray: false, method: 'GET', headers: headers},
				getMap: {url: API.getURI('children/map'), method: 'GET', headers: headers},
				getAttachments: {url: API.getURI('children/:id/attachments'), isArray: false, method: 'GET', headers: headers},
				getActivity: {url: API.getURI('children/:id/activity'), isArray: false, method: 'GET', headers: headers},
				postComment: {url: API.getURI('children/:id/comments'), method: 'POST', headers: headers},
				removeAttachment: {url: API.getURI('children/:id/attachments/:attachment_id'), method: 'DELETE', headers: headers, params: {id: '@id', attachment_id: '@attachment_id'}},
				spawnFromAlert: {method: 'POST', headers: headers},
				cancelCase: {url: API.getURI('cases/:id/cancel'), params: {id: '@case_id'}, method: 'POST', headers: headers},
				reopenCase: {url: API.getURI('cases/:id/reopen'), params: {id: '@case_id'}, method: 'POST', headers: headers},
				requestReopenCase: {url: API.getURI('cases/:id/request-reopen'), params: {id: '@case_id'}, method: 'POST', headers: headers},
				requestTransferCase: {url: API.getURI('cases/:id/request-transfer'), params: {id: '@case_id'}, method: 'POST', headers: headers},
				transferCase: {url: API.getURI('cases/:id/transfer'), params: {id: '@case_id'}, method: 'POST', headers: headers},
				requests: {url: API.getURI('requests/all'), method: 'GET', isArray: false, headers: headers},
				reject: {url: API.getURI('requests/:id/reject'), method: 'PUT', headers: headers}
			});
			return Children;
		});
})();
(function() {
	angular
		.module('BuscaAtivaEscolar')
		.factory('Cities', function Cities(API, Identity, $resource) {

			var headers = {};

			return $resource(API.getURI('cities/:id'), {id: '@id'}, {
				find: {method: 'GET', headers: headers},
				search: {url: API.getURI('cities/search'), method: 'POST', headers: headers},
				checkIfAvailable: {url: API.getURI('cities/check_availability'), method: 'POST', headers: headers},
			});

		});
})();
(function () {
    angular
        .module('BuscaAtivaEscolar')
        .factory('Classes', function Schools(API, $resource) {
            var Classes = $resource(API.getURI('classes/:id'), {id: '@id'}, {
                find: {method: 'GET', params: {}},
                update: {method: 'PUT'},
                create: {method: 'POST'},
                deleteClasse: {method: 'DELETE', url: API.getURI('classes/:id')},
                updateSettings: {method: 'PUT', url: API.getURI('classes/:id')},
                frequencies: {method: 'GET', params: {}, url: API.getURI('frequencies/:id')},
                updateFrequency: {method: 'PUT', url: API.getURI('frequency/:id')},
                updateFrequencies: {method: 'PUT', url: API.getURI('frequencies')}
            });
            return Classes;
        });
})();
(function () {
    angular
        .module('BuscaAtivaEscolar')
        .factory('Graph', function Reports(API, Identity, $resource) {
            return $resource(API.getURI('graph/:entity'), {entity: '@entity'}, {
                getReinsertEvolution: {method: 'GET', url: API.getURI('graph/reinsertion_evolution?uf=:uf&tenant_id=:tenant_id')},
            });
        });
})();
(function() {
	angular
		.module('BuscaAtivaEscolar')
		.factory('Groups', function Groups(API, $resource) {

			var headers = API.REQUIRE_AUTH;

			return $resource(API.getURI('groups/:id'), {id: '@id', with: '@with'}, {
				find: {method: 'GET', headers: headers},
                findByTenant: {method: 'POST', url: API.getURI('groups/tenant'), headers: headers},
                findByUf: {method: 'POST', url: API.getURI('groups/uf'), headers: headers},
				updateSettings: {method: 'PUT', url: API.getURI('groups/:id/settings'), headers: headers},
				create: {method: 'POST', headers: headers},
				delete: {method: 'DELETE', headers: headers},
				update: {method: 'PUT', headers: headers}
			});

		});
})();
// (function() {
// 	angular
// 		.module('BuscaAtivaEscolar')
// 		.factory('Alerts', function Alerts(API, Identity, $resource) {
//
// 			var headers = API.REQUIRE_AUTH;
//
// 			return $resource(API.getURI('alerts/:id'), {id: '@id'}, {
// 				find: {method: 'GET', headers: headers},
// 				getPending: {url: API.getURI('alerts/pending'), isArray: false, method: 'GET', headers: headers},
// 				mine: {url: API.getURI('alerts/mine'), isArray: false, method: 'GET', headers: headers},
// 				accept: {url: API.getURI('alerts/:id/accept'), method: 'POST', headers: headers},
// 				reject: {url: API.getURI('alerts/:id/reject'), method: 'POST', headers: headers}
// 			});
// 		});
// })();
'use strict';
(function () {
    //these are just references the instance of related lib so we can inject them to the controllers/services in an angular way.
    angular.module('BuscaAtivaEscolar').factory('H', [
        '$window',
        function ($window) {
    	//console.log($window);
            return $window.H;
        }
    ]);

    // app.factory('Modernizr', [
    // 	'$window',
    // 	function ($window) {
    // 		return $window.Modernizr;
    // 	}
    // ]);
    //
    // app.factory('Highcharts', [
    // 	'$window',
    // 	function ($window) {
    // 		return $window.Highcharts;
    // 	}
    // ]);

})();
(function() {
	angular
		.module('BuscaAtivaEscolar')
		.factory('ImportJobs', function ImportJobs(API, Identity, $resource) {

			var authHeaders = API.REQUIRE_AUTH;

			return $resource(API.getURI('maintenance/import_jobs/:id'), {id: '@id'}, {
				find: {method: 'GET', headers: authHeaders},
				all: {url: API.getURI('maintenance/import_jobs'), method: 'GET', headers: authHeaders},
				upload: {url: API.getURI('maintenace/import_jobs/new'), method: 'POST', headers: authHeaders},
				process: {url: API.getURI('maintenance/import_jobs/:id/process'), method: 'POST', headers: authHeaders}
			});

		});
})();
(function () {
    angular
        .module('BuscaAtivaEscolar')
        .factory('Maintenance', function CaseSteps(API, Identity, $resource) {
            var headers = API.REQUIRE_AUTH;
            var repository = $resource(API.getURI('maintenance/:user_id'), {user_id: '@id'}, {
                assignForAdminUser: {url: API.getURI('maintenance/:user_id'), method: 'POST', headers: headers}
            });
            return repository;
        });
})();
(function() {
	angular
		.module('BuscaAtivaEscolar')
		.factory('PasswordReset', function Users(API, $resource) {

			var headers = {};

			return $resource(API.getURI('password_reset/:id'), {id: '@id', with: '@with'}, {
				begin: {url: API.getURI('password_reset/begin'), method: 'POST', headers: headers},
				complete: {url: API.getURI('password_reset/complete'), method: 'POST', headers: headers}
			});

		});
})();
(function () {
    angular
        .module('BuscaAtivaEscolar')
        .factory('Report', function Reports(API_PUBLIC, Identity, $resource) {
            return $resource(API_PUBLIC.getURI('report/:entity'), {entity: '@entity'}, {
                getStatusCity: {method: 'GET', url: API_PUBLIC.getURI('report/city?city=:city&uf=:uf')},
                getStatusCityByCountry: {method: 'GET', url: API_PUBLIC.getURI('report/city?ibge_id=:ibge_id&uf=:uf')}
            });
        });
})();
(function() {
	angular
		.module('BuscaAtivaEscolar')
		.factory('Reports', function Reports(API, Identity, $resource) {

			var headers = API.REQUIRE_AUTH;

			return $resource(API.getURI('reports/:entity'), {entity: '@entity'}, {
				query: {url: API.getURI('reports/:entity'), method: 'POST', headers: headers},
				getCountryStats: {method: 'GET', url: API.getURI('reports/country_stats'), headers: headers},
				getStateStats: {method: 'GET', url: API.getURI('reports/state_stats'), headers: headers},
				getStatusBar: {method: 'GET', url: API.getURI('reports/city_bar'), headers: headers},
				reportsSelo: {url: API.getURI('reports/selo'), method: 'GET', headers: headers},
				createReportSelo: {url: API.getURI('reports/selo/create'), method: 'POST', headers: headers},
				getDailyRematricula: {method: 'GET', url: API.getURI('reports/data_rematricula_daily'), headers: headers},
				getUfsBySelo: {url: API.getURI('reports/ufs_by_selo'), method: 'GET', headers: headers},
				getTenantsBySelo: {url: API.getURI('reports/tenants_by_selo'), method: 'GET', headers: headers},
				getDataMapFusionChart: {method: 'GET', url: API.getURI('reports/data_map_fusion_chart'), headers: headers},
				reportsChild: {url: API.getURI('reports/child'), method: 'GET', headers: headers},
				createReportChild: {url: API.getURI('reports/child/create'), method: 'POST', headers: headers}
			});
		});
})();
(function() {
	angular
		.module('BuscaAtivaEscolar')
		.factory('Schools', function Schools(API, Identity, $resource) {

			var headers = API.REQUIRE_AUTH;
		
			return $resource(API.getURI('schools/:id'), {id: '@id'}, {

				find: {method: 'GET', headers: headers},
				search: {url: API.getURI('schools/search'), method: 'POST', headers: headers}, 
				getById: {url: API.getURI('schools/public'), method: 'GET'},
				all_educacenso: {url: API.getURI('schools/all_educacenso'), method: 'GET', headers: headers},
				update: {method: 'PUT', headers: headers},
				send_educacenso_notifications: {url: API.getURI('schools/educacenso/notification'), method: 'POST', headers: headers},

				all_schools: {url: API.getURI('schools/all'), method: 'GET', headers: headers},
				send_frequency_notifications: {url: API.getURI('schools/frequency/notification'), method: 'POST', headers: headers}
			});

		});
})();
(function() {
	angular
		.module('BuscaAtivaEscolar')
		.factory('SmsConversations', function SmsConversations(API, Identity, $resource) {

			var authHeaders = API.REQUIRE_AUTH;

			return $resource(API.getURI('maintenance/sms_conversations/:id'), {id: '@id'}, {
				find: {method: 'GET', headers: authHeaders},
				all: {url: API.getURI('maintenance/sms_conversations'), method: 'GET', headers: authHeaders},
			});

		});
})();
(function () {
  angular
    .module('BuscaAtivaEscolar')
    .factory('StateSignups', function StateSignups(API, Identity, $resource) {
      var authHeaders = API.REQUIRE_AUTH;
      var headers = {};

      return $resource(
        API.getURI('signups/state/:id'),
        { id: '@id' },
        {
          find: { method: 'GET', headers: authHeaders },

          getPending: {
            url: API.getURI('signups/state/pending'),
            method: 'POST',
            isArray: false,
            headers: authHeaders,
          },
          approve: {
            url: API.getURI('signups/state/:id/approve'),
            method: 'POST',
            headers: authHeaders,
          },

          accept: {
            url: API.getURI('signups/state/:id/accept'),
            method: 'GET',
          },

          accepted: {
            url: API.getURI('signups/state/:id/accepted'),
            method: 'GET',
          },

          reject: {
            url: API.getURI('signups/state/:id/reject'),
            method: 'POST',
            headers: authHeaders,
          },

          updateRegistrationData: {
            url: API.getURI('signups/state/:id/update_registration_data'),
            method: 'POST',
            headers: authHeaders,
          },
          resendNotification: {
            url: API.getURI('signups/state/:id/resend_notification'),
            method: 'POST',
            headers: authHeaders,
          },

          resendMail: {
            url: API.getURI('signups/state/:id/resendmail'),
            method: 'POST',
            headers: authHeaders,
          },

          register: {
            url: API.getURI('signups/state/register'),
            method: 'POST',
            headers: headers,
          },
          checkIfAvailable: {
            url: API.getURI('signups/state/check_if_available'),
            method: 'POST',
            headers: headers,
          },
        }
      );
    });
})();

(function() {
	angular
		.module('BuscaAtivaEscolar')
		.factory('States', function States(API, Identity, $resource) {

			var authHeaders = API.REQUIRE_AUTH;
			var headers = {};

			return $resource(API.getURI('states/:id'), {id: '@id'}, {
				all: {url: API.getURI('states/all'), method: 'POST', headers: authHeaders, params: {'with': 'users'}},
				cancel: {url: API.getURI('states/:id/cancel'), method: 'POST', headers: authHeaders},
				find: {method: 'GET', headers: headers}
			});

		});
})();
(function() {
	angular
		.module('BuscaAtivaEscolar')
		.factory('StaticData', function StaticData(API, Identity, $rootScope, $http) {

			var data = {};
			var self = this;

			var dataFile = API.getURI('static/static_data?version=latest');
			var $promise = {};

			// TODO: cache this?

			function fetchLatestVersion() {
				//console.log("[platform.static_data] Downloading latest static data definitions...");
				$promise = $http.get(dataFile).then(onFetch);
			}

			function refresh() {
				// TODO: validate timestamp?
				fetchLatestVersion();
			}

			function onFetch(res) {
				//console.log("[platform.static_data] Downloaded! Version=", res.data.version, "Timestamp=", res.data.timestamp, "Data=", res.data.data);
				data = res.data.data;

				$rootScope.$broadcast('StaticData.ready');
			}

			function getDataFile() {
				return dataFile;
			}

			function getNumChains() {
				return data.length ? data.length : 0;
			}

			function isReady() {
				return getNumChains() > 0;
			}
			// Ordena pelo valor do indice do objeto
			function orderMotives(value) {
				return _.orderBy(value, ['label'], ['asc']);
			}

			function getUserTypes() { return (data.UserType) ? data.UserType : []; }
			function getAlertCauses() {	return (data.AlertCause) ? orderMotives(data.AlertCause) : [];}
			function getVisibleAlertCauses() { return (data.VisibleAlertCause) ? orderMotives(data.VisibleAlertCause) : [];}
			function getCaseCauses() { return (data.CaseCause) ? data.CaseCause : []; }
			function getVisibleCaseCauses() { return (data.VisibleCaseCause) ? orderMotives(data.VisibleCaseCause) : []; }
			function getGenders() { return (data.Gender) ? data.Gender : []; }
			function getHandicappedRejectReasons() { return (data.HandicappedRejectReason) ? data.HandicappedRejectReason : []; }
			function getAgeRanges() { return (data.AgeRange) ? data.AgeRange : []; }
			function getIncomeRanges() { return (data.IncomeRange) ? data.IncomeRange : []; }
			function getRaces() { return (data.Race) ? data.Race : []; }
			function getSchoolGrades() { return (data.SchoolGrade) ? data.SchoolGrade : []; }
			function getSchoolingLevels() { return (data.SchoolingLevel) ? data.SchoolingLevel : []; }
			function getWorkActivities() { return (data.WorkActivity) ? data.WorkActivity : []; }
			function getCaseStepSlugs() { return (data.CaseStepSlugs) ? data.CaseStepSlugs : []; }
			function getUFs() { return (data.UFs) ? data.UFs : []; }
			function getUFsDropdown() {
				var dropdown = [];

				angular.forEach(data.UFsByCode, function (uf, key) {
					dropdown.push(uf);
				});

				return dropdown;
			}
			function getUFByCode(code) { return (data.UFsByCode) ? data.UFsByCode[code] : null; }
			function getRegions() { return (data.Regions) ? data.Regions : []; }
			function getTypesWithGlobalScope() { return (data.UsersWithGlobalScope) ? data.UsersWithGlobalScope : []; }
			function getTypesWithUFScope() { return (data.UsersWithUFScope) ? data.UsersWithUFScope : []; }
			function getAPIEndpoints() { return (data.APIEndpoints) ? data.APIEndpoints : []; }
			function getCaseCancelReasons() { return (data.CaseCancelReasons) ? data.CaseCancelReasons : []; }
			function getAllowedMimeTypes() { return (data.Config) ? data.Config.uploads.allowed_mime_types: ['image/jpeg', 'image/png']; }
			function getPermissions() { return (data.Permissions) ? data.Permissions : {}; }

			function getUserTypeVisitantes() { return (data.UserTypeVisitantes) ? data.UserTypeVisitantes : []; }
			
			function getPermissionsFormForVisitante() { return (data.PermissionsFormForVisitante) ? data.PermissionsFormForVisitante : []; }

			function getCurrentUF() {
				var user = Identity.getCurrentUser();
				if(!user) return null;
				if(!user.uf) return null;

				return getUFByCode(user.uf);
			}

			return {
				fetchLatestVersion: fetchLatestVersion,
				refresh: refresh,
				getUserTypes: getUserTypes,
				getAlertCauses: getAlertCauses,
				getVisibleAlertCauses: getVisibleAlertCauses,
				getCaseCauses: getCaseCauses,
				getVisibleCaseCauses: getVisibleCaseCauses,
				getGenders: getGenders,
				getHandicappedRejectReasons: getHandicappedRejectReasons,
				getIncomeRanges: getIncomeRanges,
				getAgeRanges: getAgeRanges,
				getRaces: getRaces,
				getSchoolGrades: getSchoolGrades,
				getSchoolingLevels: getSchoolingLevels,
				getWorkActivities: getWorkActivities,
				getCaseStepSlugs: getCaseStepSlugs,
				getAllowedMimeTypes: getAllowedMimeTypes,
				getUFs: getUFs,
				getUFsDropdown: getUFsDropdown,
				getUFByCode: getUFByCode,
				getCurrentUF: getCurrentUF,
				getRegions: getRegions,
				getTypesWithGlobalScope: getTypesWithGlobalScope,
				getTypesWithUFScope: getTypesWithUFScope,
				getAPIEndpoints: getAPIEndpoints,
				getCaseCancelReasons: getCaseCancelReasons,
				isReady: isReady,
				getNumChains: getNumChains,
				getDataFile: getDataFile,
				getPermissions: getPermissions,
				getUserTypeVisitantes: getUserTypeVisitantes,
				getPermissionsFormForVisitante: getPermissionsFormForVisitante
			};

		})
		.run(function (StaticData) {
			StaticData.refresh();
		});
})();

(function() {
	angular
		.module('BuscaAtivaEscolar')
		.factory('SupportTicket', function SupportTicket(API, Identity, $resource) {

			var authRequiredHeaders = API.REQUIRE_AUTH;
			var authOptionalHeaders = API.OPTIONAL_AUTH;

			return $resource(API.getURI('support/tickets/:id'), {id: '@id'}, {
				all: {url: API.getURI('support/tickets/all'), method: 'POST', headers: authRequiredHeaders},
				submit: {url: API.getURI('support/tickets/submit'), method: 'POST', headers: authOptionalHeaders},
				find: {method: 'GET', headers: authRequiredHeaders}
			});

		});
})();
(function() {
	angular
		.module('BuscaAtivaEscolar')
		.factory('SystemHealth', function SystemHealth(API, Identity, $resource) {

			var authHeaders = API.REQUIRE_AUTH;

			return $resource(API.getURI('maintenance/system_health'), {}, {
				getStats: {method: 'GET', headers: authHeaders},
			});

		});
})();
(function () {
  angular
    .module('BuscaAtivaEscolar')
    .factory('TenantSignups', function TenantSignups(API, Identity, $resource) {
      var authHeaders = API.REQUIRE_AUTH;
      var headers = {};

      return $resource(
        API.getURI('signups/tenants/:id'),
        { id: '@id' },
        {
          find: { method: 'GET', headers: authHeaders },

          getPending: {
            url: API.getURI('signups/tenants/pending'),
            method: 'POST',
            isArray: false,
            headers: authHeaders,
          },
          approve: {
            url: API.getURI('signups/tenants/:id/approve'),
            method: 'POST',
            headers: authHeaders,
          },
          reject: {
            url: API.getURI('signups/tenants/:id/reject'),
            method: 'POST',
            headers: authHeaders,
          },

          updateRegistrationData: {
            url: API.getURI('signups/tenants/:id/update_registration_data'),
            method: 'POST',
            headers: authHeaders,
          },
          resendNotification: {
            url: API.getURI('signups/tenants/:id/resend_notification'),
            method: 'POST',
            headers: authHeaders,
          },

          resendMail: {
            url: API.getURI('signups/tenants/:id/resendmail'),
            method: 'POST',
            headers: authHeaders,
          },

          completeSetup: {
            url: API.getURI('signups/tenants/complete_setup'),
            method: 'POST',
            headers: authHeaders,
          },

          accepted: {
            url: API.getURI('signups/tenants/:id/accepted'),
            method: 'GET',
          },

          register: {
            url: API.getURI('signups/tenants/register'),
            method: 'POST',
            headers: headers,
          },
          getViaToken: {
            url: API.getURI('signups/tenants/via_token/:id'),
            method: 'GET',
            headers: headers,
          },
          complete: {
            url: API.getURI('signups/tenants/:id/complete'),
            method: 'POST',
            headers: headers,
          },

          getMayorByCPF: {
            url: API.getURI('signups/tenants/mayor/by/cpf/:cpf'),
            method: 'GET',
            headers: authHeaders,
          },
          getUserViaToken: {
            url: API.getURI('signups/users/via_token/:id'),
            method: 'GET',
            headers: headers,
          },
          activeUser: {
            url: API.getURI('signups/users/:id/confirm'),
            method: 'POST',
            headers: headers,
          },
        }
      );
    });
})();

(function() {
	angular
		.module('BuscaAtivaEscolar')
		.factory('Tenants', function Tenants(API, Identity, $resource) {

			var authHeaders = API.REQUIRE_AUTH;
			var headers = {};

			return $resource(API.getURI('tenants/:id'), {id: '@id'}, {
				all: {url: API.getURI('tenants/all'), method: 'POST', headers: authHeaders, params: {'with': 'city,political_admin,operational_admin, users'}},
				getSettings: {url: API.getURI('settings/tenant'), method: 'GET', headers: authHeaders},
				updateSettings: {url: API.getURI('settings/tenant'), method: 'PUT', headers: authHeaders},
				cancel: {url: API.getURI('tenants/:id/cancel'), method: 'POST', headers: authHeaders},
				getRecentActivity: {url: API.getURI('tenants/recent_activity'), method: 'GET', headers: authHeaders},
				find: {method: 'GET', headers: headers},
                findByUfPublic: {url: API.getURI('tenants/public/uf'), method: 'GET', headers: authHeaders},
                findByUf: {url: API.getURI('tenants/uf'), method: 'GET', headers: authHeaders},
				getEducacensoJobs: {url: API.getURI('settings/educacenso/jobs'), method: 'GET', headers: authHeaders},
				getXlsChildrenJobs: {url: API.getURI('settings/import/jobs'), method: 'GET', headers: authHeaders},
			    getSettingsOftenantOfcase: {url: API.getURI('settingstenantcase/tenant/:id'), method: 'GET', headers: authHeaders},
			    mayorConfirmation: {url: API.getURI('signups/tenants/:id/accept'), method: 'GET'}
			});

		});
})();
(function() {
	angular
		.module('BuscaAtivaEscolar')
		.factory('UserNotifications', function UserNotifications(API, Identity, $resource) {

			var authHeaders = API.REQUIRE_AUTH;

			return $resource(API.getURI('notifications/:id'), {id: '@id'}, {
				find: {method: 'GET', headers: authHeaders},

				getUnread: {url: API.getURI('notifications/unread'), method: 'GET', isArray: false, headers: authHeaders},
				markAsRead: {url: API.getURI('notifications/:id/mark_as_read'), method: 'POST', headers: authHeaders},
			});

		});
})();
(function() {
	angular
		.module('BuscaAtivaEscolar')
		.factory('UserPreferences', function UserPreferences(API, Identity, $resource) {

			var authHeaders = API.REQUIRE_AUTH;

			return $resource(API.getURI('user_preferences'), {id: '@id'}, {
				get: {method: 'GET', isArray: false, headers: authHeaders},
				update: {method: 'POST', headers: authHeaders},
			});

		});
})();
(function() {
	angular
		.module('BuscaAtivaEscolar')
		.factory('Users', function Users(API, $resource) {

			var headers = API.REQUIRE_AUTH;

			return $resource(API.getURI('users/:id'), {id: '@id', with: '@with'}, {
				myself: {url: API.getURI('users/myself'), method: 'GET', headers: headers},
				find: {method: 'GET', headers: headers},
				create: {method: 'POST', headers: headers},
				update: {method: 'PUT', headers: headers, url: API.getURI('users/:id')},
				search: {url: API.getURI('users/search'), method: 'POST', isArray: false, headers: headers},
				suspend: {method: 'DELETE', headers: headers},
				restore: {url: API.getURI('users/:id/restore'), method: 'POST', headers: headers},
				reports: {url: API.getURI('users/reports'), method: 'GET', headers: headers},
				createReport: {url: API.getURI('users/reports/create'), method: 'POST', headers: headers},
				
				updateYourself: {method: 'PUT', headers: headers, url: API.getURI('user/:id/update_yourself')},
				sendReactivationMail: {url: API.getURI('user/:id/send_reactivation_mail'), method: 'POST', headers: headers},

			});

		});
})();
(function() {

	angular.module('BuscaAtivaEscolar')
		.controller('ImportEducacensoCtrl', function ($scope, $window, Modals, API, Tenants, ngToast) {

			$scope.hasImported = false;
			$scope.jobs = null;
			$scope.importDetails = false;

			$scope.refresh = function() {
				Tenants.getSettings(function (res) {
					//console.log("Settings: ", res);
					$scope.importDetails = res.educacensoImportDetails;
				});

				Tenants.getEducacensoJobs(function (res) {
					//console.log("Educacenso Jobs: ", res);
					$scope.jobs = res.data;
				});
			};

			$scope.beginImport = function() {
				Modals.show(Modals.FileUploader(
					'Enviar planilha do Educacenso',
					'Selecione o arquivo de planilha do Educacenso recebido pelo INEP. O arquivo deve estar intacto e sem modificações, exatamente da forma como foi recebido.',
					API.getURI('settings/educacenso/import')
				)).then(function (file) {

					if(file.status == "error"){

						ngToast.danger('Arquivo inválido! '+ file.reason);
                        $scope.hasImported = false;
						$scope.refresh();
						
					}else{

                        ngToast.warning('Arquivo importado com sucesso!');
                        $scope.hasImported = true;
                        $scope.refresh();
					}

				});
			};

			$scope.refresh();

		});

})();
(function() {
	angular.module('BuscaAtivaEscolar')
		.controller('ImportXLSChildrenCtrl', function ($scope, $window, Modals, API, Tenants, ngToast) {

			$scope.jobs = null;

			$scope.refresh = function() {
				Tenants.getXlsChildrenJobs(function (res) {
					$scope.jobs = res.data;
				});
			};

			$scope.beginImport = function() {
				Modals.show(Modals.FileUploader(
					'Enviar planilha com casos',
					'Selecione a planilha com os dados das crianças/ adolescentes a serem importados. O arquivo precisar estar exatamente igual ao exemplo disponível aqui na plataforma. ',
					API.getURI('settings/import/xls')
				)).then(function (file) {

					if(file.status == "error"){

						ngToast.danger('Erro na importação! '+ file.reason);
						$scope.refresh();

					}else{

						ngToast.warning('Arquivo encaminhado para fila de processamento');
						$scope.refresh();
					}

				});
			};

			$scope.refresh();

		});

})();
(function() {

	angular.module('BuscaAtivaEscolar')
		.controller('ManageCaseWorkflowCtrl', function ($scope, $rootScope, $q, ngToast, Platform, Identity, Tenants, Groups, StaticData) {

			$scope.static = StaticData;

			$scope.groups = [];
			$scope.settings = {};

			$scope.getGroups = function() {
				return $scope.groups;
			};

			$scope.save = function() {

                for(var index_g in $scope.groups){
                	if( index_g == 0){
                    	var alerts = $scope.groups[index_g].settings.alerts;
                        for(var index_a in alerts){
                        	if(index_a != 500 && index_a != 600 && alerts[index_a] == false){
                                ngToast.danger('O grupo Secretaria Municipal de Educação, obrigatoriamente, deve estar selecionado para todos os motivos de evasão escolar!');
                        		return;
							}
						}
                	}
                }

				var promises = [];

				for(var i in $scope.groups) {
					if(!$scope.groups.hasOwnProperty(i)) continue;
					//console.log('\t[manage_case_workflow.save] Update group: ', $scope.groups[i]);
					promises.push( Groups.updateSettings($scope.groups[i]).$promise );
				}

				//console.log('\t[manage_case_workflow.save] Update tenant: ', $scope.settings);
				promises.push( Tenants.updateSettings($scope.settings).$promise );

				$q.all(promises).then(
					function (res) {
						ngToast.success('Configurações salvas com sucesso!');
						//console.log('[manage_case_workflow.save] Saved! ', res);
						$scope.refresh();
					}, function (err) {
						ngToast.danger('Ocorreu um erro ao salvar as configurações!');
						console.error('[manage_case_workflow.save] Error: ', err);
					}
				);

			};

			$scope.refresh = function() {
				Groups.find({with: 'settings'}, function(res) {
					$scope.groups = res.data;
				});

				Tenants.getSettings(function (res) {
					$scope.settings = res;
				});
			};

			Platform.whenReady(function() {
				$scope.refresh();
			})

		});

})();
(function() {

	angular.module('BuscaAtivaEscolar')
		.controller('ManageDeadlinesCtrl', function ($scope, $rootScope, $q, ngToast, Platform, Identity, Tenants, Groups, StaticData) {

			$scope.static = StaticData;
			$scope.tenantSettings = {};

			$scope.save = function() {

				Tenants.updateSettings($scope.tenantSettings).$promise.then(
					function (res) {
						//console.log('[manage_deadlines.save] Saved! ', res);
						ngToast.success('Configurações salvas com sucesso!');
						$scope.refresh();
					},
					function (err) {
						//console.error('[manage_deadlines.save] Error: ', err);
						ngToast.danger('Ocorreu um erro ao atualizar as configurações');
					}
				);

			};

			$scope.refresh = function() {
				Tenants.getSettings(function (res) {
					//console.log('[manage_deadlines] Current settings: ', res);
					$scope.tenantSettings = res;
				});
			};

			Platform.whenReady(function() {
				$scope.refresh();
			})

		});

})();
(function() {

	angular.module('BuscaAtivaEscolar')
		.controller('ManageGroupsCtrl', function ($scope, $rootScope, $q, ngToast, Platform, Identity, Groups, StaticData) {

			$scope.groups = [];
			$scope.newGroupName = '';

			$scope.getGroups = function() {
				if(!$scope.groups) return [];
				return $scope.groups;
			};

			$scope.removeGroup = function(i) {
				if(!$scope.groups[i]) return;

				if($scope.groups[i].is_creating) {
					delete $scope.groups[i];
					return;
				}

				$scope.groups[i].is_deleting = true;

                $scope.save();
			};

			$scope.cancelRemoval = function (i) {
				if(!$scope.groups[i]) return;
				$scope.groups[i].is_deleting = false;
			};

			$scope.save = function() {

				var promises = [];

				for(var i in $scope.groups) {
					if(!$scope.groups.hasOwnProperty(i)) continue;

					var group = $scope.groups[i];

					if(group.is_deleting && !group.is_primary) {
						promises.push(Groups.delete({id: group.id}).$promise);
						//console.log("\t [groups.save] REMOVED, DELETE-> Group #" + i + ': ', group);
						continue;
					}

					if(group.is_creating) {
						promises.push(Groups.create({name: group.name}).$promise);
						//console.log("\t [groups.save] NEW, CREATE-> Group #" + i + ': ', group);
						continue;
					}

					if($scope.groupsEdit['group_' + i] && !$scope.groupsEdit['group_' + i].$pristine) {
						promises.push(Groups.update({id: group.id, name: group.name}).$promise);
						//console.log("\t [groups.save] MODIFIED, UPDATE -> Group #" + i + ': ', group);
						continue;
					}

					//console.log("\t [groups.save] PRISTINE, NOOP -> Group #" + i + ': ', group);

				}

				$q.all(promises).then(function(res) {
					console.info('[groups.save] Saved! ', res);
					ngToast.success('Grupos alterados com sucesso!')
					$scope.refresh();
				}, function (err) {
					console.error('[groups.save] Error: ', err);
					ngToast.danger('Ocorreu um erro ao salvar os grupos!')
					$scope.refresh();
				});
			};

			$scope.addGroup = function() {
				if(!$scope.newGroupName) return;
				if($scope.newGroupName.length < 5) return;

				var group = {
					name: $scope.newGroupName,
					is_primary: false,
					is_creating: true
				};

				$scope.groups.push(group);

				$scope.newGroupName = '';
                $scope.save();
			};

            $scope.updateGroup = function(value,index) {

                if(!$scope.groups[index].name) return;
                if($scope.groups[index].name.length < 5) return;

				if(value !== $scope.groupsCopy[index].name){
                    $scope.save();

                }
            };


			$scope.refresh = function() {
				Groups.find(function(res) {
					$scope.groups = res.data;
					$scope.groupsCopy = angular.copy($scope.groups);
				});
			};

			Platform.whenReady(function() {
				$scope.refresh();
			});
		});

})();
(function () {
  angular
    .module('BuscaAtivaEscolar')
    .config(function ($stateProvider) {
      $stateProvider.state('manager_confirmation', {
        url: '/confirmacao_gestor_estadual/{id}',
        templateUrl: '/views/state_signup/manager_confirmation.html',
        controller: 'ManagerConfirmationCtrl',
        unauthenticated: true,
      });
    })
    .controller(
      'ManagerConfirmationCtrl',
      function ($scope, $state, $stateParams, StateSignups, ngToast) {
        $scope.prevStep = function () {
          return $state.go('login');
        };

        $scope.provisionState = function () {
          var confirm = StateSignups.accept({
            id: $stateParams.id,
          }).$promise;

          confirm.then(function (res) {
            if (res.status === 'ok') {
              ngToast.success(
                'A sua solicitação de adesão foi confirmada com sucesso!'
              );
              $state.go('login');
            } else {
              $scope.css = 'alert alert-danger';
              $scope.resposta =
                'Problema na solicitação, por favor entre em contato com o nosso suporte!';
            }
          });
        };
        // http://api.busca-ativa-escolar.test/api/v1/signups/tenants/8d239e40-2550-11eb-978f-cd8b250fb29a/accept
        /*var confirm = Tenants.mayorConfirmation({
          id: $stateParams.id,
        }).$promise;

        confirm.then(function (res) {
          if (res.status === 'ok') {
            $scope.css = 'alert alert-success';
            $scope.resposta =
              'A sua solicitação de adesão foi confirmada com sucesso!';
          } else {
            $scope.css = 'alert alert-danger';
            $scope.resposta =
              'Problema na solicitação, por favor entre em contato com o nosso suporte!';
          }
        });*/
      }
    );
})();

(function () {
  angular
    .module('BuscaAtivaEscolar')
    .controller(
      'StateSignupCtrl',
      function (
        $scope,
        $rootScope,
        $window,
        ngToast,
        Utils,
        StateSignups,
        Cities,
        Modals,
        StaticData
      ) {
        $scope.static = StaticData;

        $scope.step = 1;
        $scope.numSteps = 4;
        $scope.isCityAvailable = false;

        $scope.stepChecks = [false, false, false];
        $scope.stepsNames = [
          'Indique a UF',
          'Gestor(a) Estadual',
          'Coordenador(a) Estadual',
        ];

        $scope.form = {
          uf: null,
          admin: {},
          coordinator: {},
        };

        var fieldNames = {
          cpf: 'CPF',
          name: 'nome',
          email: 'e-mail institucional',
          position: 'posição',
          institution: 'instituição',
          password: 'senha',
          dob: 'data de nascimento',
          phone: 'telefone institucional',
          mobile: 'celular institucional',
          personal_phone: 'telefone pessoal',
          personal_mobile: 'celular pessoal',
        };

        var messages = {
          invalid_admin:
            'Dados do(a) gestor(a) estadual incompletos! Campos inválidos: ',
          invalid_coordinator:
            'Dados do(a) coordenador(a) estadual incompletos! Campos inválidos: ',
        };

        var requiredAdminFields = ['email', 'name', 'cpf', 'dob', 'phone'];
        var requiredCoordinatorFields = [
          'email',
          'name',
          'cpf',
          'dob',
          'phone',
        ];

        $scope.goToStep = function (step) {
          //console.log($scope.step, $scope.numSteps)
          if ($scope.step < 1) return;
          if ($scope.step >= $scope.numSteps) return;
          //console.log($scope.step, $scope.numSteps)
          $scope.step = step;
          $window.scrollTo(0, 0);
        };

        $scope.nextStep = function (step) {
          if ($scope.step >= $scope.numSteps) return;

          if (
            $scope.step === 2 &&
            !Utils.isValid(
              $scope.form.admin,
              requiredAdminFields,
              fieldNames,
              messages.invalid_admin
            )
          )
            return;

          $scope.step++;
          $window.scrollTo(0, 0);
          $scope.stepChecks[step] = true;
        };

        $scope.prevStep = function () {
          if ($scope.step <= 1) return;

          $scope.step--;
          $window.scrollTo(0, 0);
        };

        $scope.onUFSelect = function (uf) {
          //console.log("UF selected: ", uf);
          if (!uf) return;
          $scope.checkStateAvailability(uf);
        };

        $scope.checkStateAvailability = function (uf) {
          $scope.hasCheckedAvailability = false;

          StateSignups.checkIfAvailable({ uf: uf }, function (res) {
            $scope.hasCheckedAvailability = true;
            $scope.isStateAvailable = !!res.is_available;
          });
        };

        $scope.showPassword = function (elementId) {
          var field_password = document.getElementById(elementId);
          field_password.type === 'password'
            ? (field_password.type = 'text')
            : (field_password.type = 'password');
        };
        $scope.agree = function (value) {
          $scope.agreeTOS = value;
        };

        $scope.finish = function (step) {
          if (!$scope.agreeTOS) return;
          if (
            $scope.step === 3 &&
            !Utils.isValid(
              $scope.form.coordinator,
              requiredCoordinatorFields,
              fieldNames,
              messages.invalid_coordinator
            )
          )
            return;
          if (
            $scope.step === 3 &&
            !Utils.haveEqualsValue('Os CPFs', [
              $scope.form.admin.cpf,
              $scope.form.coordinator.cpf,
            ])
          )
            return;
          if (
            $scope.step === 3 &&
            !Utils.haveEqualsValue('Os nomes', [
              $scope.form.admin.name,
              $scope.form.coordinator.name,
            ])
          )
            return;

          if (
            $scope.step === 3 &&
            !Utils.haveEqualsValue('Os emails', [
              $scope.form.admin.email,
              $scope.form.coordinator.email,
            ])
          )
            return;

          var data = {};
          data.admin = Object.assign({}, $scope.form.admin);
          data.coordinator = Object.assign({}, $scope.form.coordinator);
          data.uf = $scope.form.uf;

          if (
            !Utils.isValid(
              data.admin,
              requiredAdminFields,
              messages.invalid_admin
            )
          )
            return;
          if (
            !Utils.isValid(
              data.coordinator,
              requiredCoordinatorFields,
              messages.invalid_coordinator
            )
          )
            return;

          data.admin = Utils.prepareDateFields(data.admin, ['dob']);
          data.coordinator = Utils.prepareDateFields(data.coordinator, ['dob']);

          StateSignups.register(data, function (res) {
            if (res.status === 'ok') {
              ngToast.success('Solicitação de adesão registrada!');
              $scope.step = 5;
              return;
            }

            if (res.reason === 'admin_email_in_use') {
              $scope.step = 2;
              return ngToast.danger(
                'O e-mail indicado para o(a) gestor(a) estadual já está em uso. Por favor, escolha outro e-mail'
              );
            }

            if (res.reason === 'coordinator_email_in_use') {
              $scope.step = 2;
              return ngToast.danger(
                'O e-mail indicado para o(a) coordenador(a) estadual já está em uso. Por favor, escolha outro e-mail'
              );
            }

            if (res.reason === 'invalid_admin_data') {
              $scope.step = 2;
              ngToast.danger(messages.invalid_admin);

              return Utils.displayValidationErrors(res);
            }

            ngToast.danger(
              'Ocorreu um erro ao registrar a adesão: ' + res.reason
            );
          });
          $scope.stepChecks[step] = true;
        };
      }
    );
})();

(function () {
  angular
    .module('BuscaAtivaEscolar')
    .config(function ($stateProvider) {
      $stateProvider.state('pending_state_signups', {
        url: '/pending_state_signups',
        templateUrl: '/views/states/pending_signups.html',
        controller: 'PendingStateSignupsCtrl',
      });
    })
    .controller(
      'PendingStateSignupsCtrl',
      function (
        $scope,
        $rootScope,
        ngToast,
        Identity,
        StateSignups,
        StaticData
      ) {
        $scope.identity = Identity;
        $scope.static = StaticData;

        $scope.signups = {};
        $scope.signup = {};
        $scope.query = {
          sort: { created_at: 'desc' },
          filter: { status: 'pending' },
          max: 16,
          page: 1,
        };

        $scope.refresh = function () {
          $scope.signups = StateSignups.getPending($scope.query);
          return $scope.signups.$promise;
        };

        $scope.preview = function (signup) {
          const accepted = StateSignups.accepted({ id: signup.id }).$promise;

          accepted.then(function (res) {
            if (res.status === 200) {
              $scope.signup = signup;
              if (signup.data.admin.dob.includes('-')) {
                let adminDate = signup.data.admin.dob.split('-');
                adminDate =
                  adminDate[2] + '/' + adminDate[1] + '/' + adminDate[0];
                signup.data.admin.dob = adminDate;
              }
              if (signup.data.coordinator.dob.includes('-')) {
                let coordinationDate = signup.data.coordinator.dob.split('-');
                coordinationDate =
                  coordinationDate[2] +
                  '/' +
                  coordinationDate[1] +
                  '/' +
                  coordinationDate[0];
                signup.data.coordinator.dob = coordinationDate;
              }

              signup.is_approved_by_manager = false;
              if (res.data) {
                signup.is_approved_by_manager = true;
              }
            }
          });
        };

        $scope.approve = function (signup) {
          StateSignups.approve({ id: signup.id }, function () {
            $scope.refresh();
            $scope.signup = {};
          });
        };

        $scope.reject = function (signup) {
          StateSignups.reject({ id: signup.id }, function () {
            $scope.refresh();
            $scope.signup = {};
          });
        };

        $scope.updateRegistrationData = function (type, signup) {
          StateSignups.updateRegistrationData(
            { id: signup.id, type: type, data: signup.data[type] },
            function (res) {
              typeName = type === 'admin' ? 'gestor' : 'coordenador';

              if (res.status !== 'ok') {
                ngToast.danger(
                  `Falha ao atualizar os dados do(a) ${typeName}(a): ${res.reason} `
                );
                return;
              }

              //`horseThumb_${id}`
              ngToast.success(`Dados do(a) ${typeName}(a)  atualizado!`);
            }
          );
        };

        $scope.resendNotification = function (signup) {
          StateSignups.resendNotification({ id: signup.id }, function () {
            ngToast.success('Notificação reenviada!');
          });
        };

        $scope.resendMail = function (signup) {
          StateSignups.resendMail({ id: signup.id }, function () {
            ngToast.success('Notificação reenviada!');
          });
        };

        $scope.refresh();
      }
    );
})();

(function() {

	angular.module('BuscaAtivaEscolar')
		.config(function($stateProvider) {
			$stateProvider.state('state_browser', {
				url: '/states',
				templateUrl: '/views/states/list.html',
				controller: 'StateBrowserCtrl'
			})
		})
		.controller('StateBrowserCtrl', function ($scope, $rootScope, ngToast, $state, StaticData, States, Modals, Identity, Config) {

			$scope.identity = Identity;
			$scope.static = StaticData;
			$scope.states = {};
			$scope.query = {
				filter: {},
				sort: {},
				max: 27,
				page: 1
			};

			$scope.refresh = function() {
				$scope.states = States.all($scope.query);
			};

            $scope.export = function() {
                Identity.provideToken().then(function (token) {
                    window.open(Config.getAPIEndpoint() + 'states/export?token=' + token);
                });
            };
			
			$scope.refresh();

		});

})();
(function() {
    angular.module('BuscaAtivaEscolar')
        .config(function ($stateProvider) {
            $stateProvider.state('user_browser', {
                url: '/users',
                templateUrl: '/views/users/browser.html',
                controller: 'UserBrowserCtrl'
            })
        })
        .controller('UserBrowserCtrl', function ($scope, $rootScope, ngToast, API, Config, Platform, Identity, Users, Groups, Tenants, StaticData, Modals, Maintenance) {

            $scope.identity = Identity;
            $scope.query = {
                tenant_id: null,
                uf: null,
                group_id: null,
                type: null,
                email: null,
                with: 'tenant',
                sort: {},
                show_suspended: false,
                max: 16,
                page: 1
            };

            $scope.info = false;

            $scope.quickAdd = false;

            $scope.onCheckCanceled = function () {
                $scope.query.show_suspended = $scope.query.show_suspended ? false : true;
                $scope.refresh();
            };

            $scope.enableQuickAdd = function () {
                $scope.quickAdd = true;
            };

            $scope.setMaxResults = function (max) {
                $scope.query.max = max;
                $scope.query.page = 1;
                $scope.refresh();
            };

		    $scope.export = function() {

			    var final_uri = $scope.prepareUriToExport();

                if (
                        Identity.isUserType('gestor_nacional') &&
                        (
                             !final_uri.includes('uf') &&
                             !final_uri.includes('type') &&
                             !final_uri.includes('email')
                        )

                    )
                {
                    Modals.show(Modals.Alert("Atenção", "Utilize a opção Relatórios completos, ou faça o filtro de um estado que deseja baixar"));
                    return false;
                }

                Identity.provideToken().then(function (token) {
                    window.open(Config.getAPIEndpoint() + 'users/export?token=' + token + $scope.prepareUriToExport());
                });
            };

            $scope.prepareUriToExport = function () {
                var uri = "";
                Object.keys($scope.query).forEach(function (element) {
                    if (element != "sort" && $scope.query[element] != null) uri = uri.concat("&" + element + "=" + $scope.query[element]);
                });
                uri = uri.concat("&show_suspended=" + $scope.query.show_suspended);
                return uri;
            };

            $scope.canEditUser = function (user) {
                var currentUser = Identity.getCurrentUser();
                return (StaticData.getPermissions().can_manage_types[currentUser.type]).indexOf(user.type) !== -1;
            };

            $scope.isCurrentUser = function (user) {
                return (Identity.getCurrentUser().id === user.id);
            };

            $scope.static = StaticData;
            $scope.tenants = [];
            $scope.groups = Groups.find();
            $scope.canFilterByTenant = false;

            $scope.checkboxes = {};
            $scope.search = {};

            $scope.getGroups = function () {
                if (!$scope.groups || !$scope.groups.data) return [];
                return $scope.groups.data;
            };

            $scope.getTenants = function () {
                if (!$scope.tenants || !$scope.tenants.data) return [];
                return $scope.tenants.data;
            };

            $scope.getUFs = function () {
                return StaticData.getUFs();
            };
            
            $scope.refresh = function () {
                if(Identity.can('tenants.view')) {
                    $scope.tenants = Tenants.findByUf({'uf': $scope.query.uf});
                }
                $scope.search = Users.search($scope.query);
            };

            $scope.suspendUser = function (user) {
                Users.suspend({id: user.id}, function (response) {
                    if (response.have_data) {
                        Modals.show(Modals.Confirm(
                            'Deseja prosseguir!',
                            'Existem casos sob responsabilidade deste usuário. Ao desativá-lo, estes casos serão atribuídos a você, que deve administrá-los, repassando-os para outra pessoa que assumirá a função ou redistribuindo-os para outros profissionais. ' +
                            'Quantidade por etapas: ' +
                            'Pesquisa: ' + response.pesquisa.casos + ', ' +
                            'Análise Técnica: ' + response.analise_tecnica.casos + ', ' +
                            'Gestão do caso: ' + response.gestao_caso.casos + ', ' +
                            '(Ré)matrícula: ' + response.rematricula.casos + ', ' +
                            'Observação: ' + response.observacao.casos + ', ' +
                            'Clique sim para prosseguir'
                        )).then(function (res) {
                            Maintenance.assignForAdminUser({id: user.id}, function (response) {
                                ngToast.success(
                                    'Usuário desativado e casos atribuidos com sucesso!'
                                );
                                $scope.refresh();                            });
                        });
                    } else {
                        ngToast.success('Usuário desativado!');
                        $scope.refresh();
                    }
                });
            };

            $scope.restoreUser = function (user) {
                Users.restore({id: user.id}, function (res) {
                    ngToast.success('Usuário reativado!');
                    $scope.refresh();
                });
            };

            $scope.sendReactivationMail = function (user) {
                Users.sendReactivationMail({id: user.id}, function (res) {
                    ngToast.success('Email encaminhado!');
                    $scope.refresh();
                });
            };

            $scope.refresh();

            Platform.whenReady(function () {
                $scope.canFilterByTenant = (Identity.getType() === 'gestor_nacional' || Identity.getType() === 'superuser');
                console.log("[user_browser] Can filter by tenant? ", Identity.getType(), $scope.canFilterByTenant);
            });

        });
})();
(function() {

	angular.module('BuscaAtivaEscolar')
		.config(function ($stateProvider) {
			$stateProvider.state('user_editor', {
				url: '/users/{user_id}?quick_add',
				templateUrl: '/views/users/editor.html',
				controller: 'UserEditorCtrl'
			})
		})
		.controller('UserEditorCtrl', function ($rootScope, $scope, $state, $stateParams, ngToast, Platform, Cities, Utils, Tenants, Identity, Users, Groups, StaticData) {

			$scope.user = {};
			$scope.isCreating = (!$stateParams.user_id || $stateParams.user_id === "new");
			$scope.isReviewing = false;

			$scope.identity = Identity;
			$scope.static = StaticData;
			$scope.showInputKey = false;

			$scope.groups = {};
			$scope.tenants = Tenants.find();
			$scope.quickAdd = ($stateParams.quick_add === 'true');

			var permissions = {};
			var dateOnlyFields = ['dob'];

			var userTypeVisitantes = [];
			var permissionsFormForVisitante = [];

			$scope.perfilVisitante = { name: '' };
			$scope.permissionsVisitantes = ['relatorios'];

			Platform.whenReady(function() {
				permissions = StaticData.getPermissions();
				userTypeVisitantes = StaticData.getUserTypeVisitantes();
				permissionsFormForVisitante = StaticData.getPermissionsFormForVisitante();
			});

			if(!$scope.isCreating) {
				$scope.user = Users.find({id: $stateParams.user_id}, prepareUserModel);
			}else{
				if( Identity.getType() === 'superuser' || Identity.getType() === 'gestor_nacional' ){
                    $scope.groups = {};
				}else{
					$scope.groups = Groups.find();
				}
			}

			$scope.isSuperAdmin = function() {
				return (Identity.getType() === 'superuser' || Identity.getType() === 'gestor_nacional');
			};

			$scope.isTargetUserTenantBound = function () {
				return (StaticData.getTypesWithGlobalScope().indexOf($scope.user.type) === -1 && StaticData.getTypesWithUFScope().indexOf($scope.user.type) === -1)
			};

			$scope.isTargetUserUFBound = function () {
				return StaticData.getTypesWithUFScope().indexOf($scope.user.type) !== -1;
			};

			$scope.canDefineUserTenant = function() {
				// Can specify user tenant only if superadmin, and only if target user type is tenant-bound
				if(!$scope.isSuperAdmin()) return false;
				return $scope.isTargetUserTenantBound();
			};

			$scope.canDefineUserUF = function() {
				// Only superusers can define user UF, and only on UF-bound user types
				if(!$scope.isSuperAdmin()) return false;
				return StaticData.getTypesWithUFScope().indexOf($scope.user.type) !== -1;
			};

			$scope.openUser = function(user_id, is_reviewing) {
				$scope.isCreating = false;
				$scope.isReviewing = !!is_reviewing;
				$scope.user = Users.find({id: user_id}, prepareUserModel);
			};

			$scope.goBack = function() {
				return $state.go($rootScope.previousState, $rootScope.previousStateParams);
			};

			$scope.getUserTypes = function() {
				if(!permissions) return {};
				if(!permissions.can_manage_types) return {};

				var finalPermissions = permissions.can_manage_types[ Identity.getCurrentUser().type ].filter( function( el ) {
						return $scope.getUserTypesVisitantes().indexOf( el ) < 0;
					} );

				return finalPermissions;
			};

			$scope.getUserTypesVisitantes = function(){
				if(!permissions) return {};
				if(!permissions.can_manage_types) return {};
				return userTypeVisitantes;
			};

			$scope.getPermissionsFormForVisitante = function(){
				return permissionsFormForVisitante;
			};

			$scope.save = function() {

				if( $scope.user.type === "perfil_visitante" ){
					$scope.user.type = getFinalTypeUser();
				}

				var data = Object.assign({}, $scope.user);
				data = Utils.prepareDateFields(data, dateOnlyFields);
				data = Utils.prepareCityFields(data, ['work_city']);

				if($scope.isCreating) {
					return Users.create(data).$promise.then(onSaved)
				}

				Users.update(data).$promise.then(onSaved);

			};

            $scope.onSelectTenant = function(){
                $scope.groups = Groups.findByTenant({'tenant_id': $scope.user.tenant_id});
			}

            $scope.onSelectUf = function(){
                $scope.groups = Groups.findByUf({'uf': $scope.user.uf});
            }

            $scope.onSelectFunction = function(){
                if( Identity.getType() === 'superuser' || Identity.getType() === 'gestor_nacional' ){
                    $scope.groups = {};
                    $scope.user.uf = null;
                    $scope.user.tenant_id = null;
                    $scope.perfilVisitante.name = '';
                }
			}

			function prepareUserModel(user) {

                if( Identity.getType() === 'superuser' || Identity.getType() === 'gestor_nacional' ){

                	if(user.type === 'coordenador_estadual' || user.type === 'gestor_estadual' || user.type === 'supervisor_estadual'){
                        $scope.groups = Groups.findByUf({'uf': user.uf});
					}else {
                        $scope.groups = Groups.findByTenant({'tenant_id': user.tenant_id});
                    }

                	//perfil de visitante
                	if( user.type.includes("visitante_") ){
						$scope.permissionsVisitantes = permissionsFormForVisitante[user.type];
                		if( user.type.includes("visitante_nacional") ){
							$scope.perfilVisitante.name = "visitante_nacional";
						}
						if( user.type.includes("visitante_estadual") ){
							$scope.perfilVisitante.name = "visitante_estadual";
						}
						$scope.user.type = "perfil_visitante";
					}

                }else{
                    $scope.groups = Groups.find();
				}

                return Utils.unpackDateFields(user, dateOnlyFields)
			}

			$scope.showPassowrd = function () {
                var field_password = document.getElementById("fld-password");
                field_password.type === "password" ? field_password.type = "text" : field_password.type = "password"
            }

			function onSaved(res) {
				if(res.status === "ok") {
					ngToast.success("Dados de usuário salvos com sucesso!");

					if($scope.quickAdd && $rootScope.previousState) return $state.go($rootScope.previousState, $rootScope.previousStateParams);
					if($scope.isCreating) return $state.go('user_editor', {user_id: res.id});

					return;
				}

				if(res.messages) return Utils.displayValidationErrors(res);

				ngToast.danger("Ocorreu um erro ao salvar o usuário<br>por favor entre em contato com o nosso suporte informando o nome do erro: " + res.reason);
			}

			function getFinalTypeUser() {
            	var finalType = "";
				for (var [key, value] of Object.entries($scope.getPermissionsFormForVisitante())) {
					if ( arraysEqual($scope.permissionsVisitantes.filter(function(obj) { return obj }), value) && key.includes($scope.perfilVisitante.name)){
						finalType = key;
					}
				}
				return finalType;
			}

			function arraysEqual(_arr1, _arr2) {
				if (!Array.isArray(_arr1) || ! Array.isArray(_arr2) || _arr1.length !== _arr2.length)
					return false;
				var arr1 = _arr1.concat().sort();
				var arr2 = _arr2.concat().sort();
				for (var i = 0; i < arr1.length; i++) {
					if (arr1[i] !== arr2[i])
						return false;
				}
				return true;
			}

		});

})();
(function() {

    angular.module('BuscaAtivaEscolar')
        .config(function ($stateProvider) {
            $stateProvider.state('user_editor_visitante', {
                url: '/users/visitantes/{user_id}?quick_add',
                templateUrl: '/views/users/editor_visitante.html',
                controller: 'UserEditorVisitanteCtrl'
            })
        })
        .controller('UserEditorVisitanteCtrl', function ($rootScope, $scope, $state, $stateParams, ngToast, Platform, Cities, Utils, Tenants, Identity, Users, Groups, StaticData) {

            $scope.user = {};
            $scope.isCreating = (!$stateParams.user_id || $stateParams.user_id === "new");
            $scope.isReviewing = false;

            $scope.identity = Identity;
            $scope.static = StaticData;

            $scope.quickAdd = ($stateParams.quick_add === 'true');

            var userTypeVisitantes = [];
            var dateOnlyFields = ['dob'];

            Platform.whenReady(function() {
                userTypeVisitantes = StaticData.getUserTypeVisitantes();
            });

            if(!$scope.isCreating) {
                $scope.user = Users.find({id: $stateParams.user_id}, prepareUserModel);
            }

            $scope.isSuperAdmin = function() {
                return (Identity.getType() === 'superuser' || Identity.getType() === 'gestor_nacional');
            };

            $scope.goBack = function() {
                return $state.go($rootScope.previousState, $rootScope.previousStateParams);
            };

            $scope.getUserTypes = function() {
                return userTypeVisitantes;
            };

            $scope.canDefineUserUF = function() {
                return StaticData.getTypesWithUFScope().indexOf($scope.user.type) !== -1;
            };

            $scope.save = function() {

                var data = Object.assign({}, $scope.user);
                data = Utils.prepareDateFields(data, dateOnlyFields);
                data = Utils.prepareCityFields(data, ['work_city']);

                if($scope.isCreating) {
                    return Users.create(data).$promise.then(onSaved)
                }

                Users.update(data).$promise.then(onSaved);

            };

            function prepareUserModel(user) {

                if( Identity.getType() === 'superuser' || Identity.getType() === 'gestor_nacional' ){

                    if(user.type === 'coordenador_estadual' || user.type === 'gestor_estadual' || user.type === 'supervisor_estadual'){
                        $scope.groups = Groups.findByUf({'uf': user.uf});
                    }else {
                        $scope.groups = Groups.findByTenant({'tenant_id': user.tenant_id});
                    }

                }else{
                    $scope.groups = Groups.find();
                }

                return Utils.unpackDateFields(user, dateOnlyFields)
            }

            $scope.showPassowrd = function () {
                var field_password = document.getElementById("fld-password");
                field_password.type === "password" ? field_password.type = "text" : field_password.type = "password"
            }

            function onSaved(res) {
                if(res.status === "ok") {
                    ngToast.success("Dados de usuário salvos com sucesso!");

                    if($scope.quickAdd && $rootScope.previousState) return $state.go($rootScope.previousState, $rootScope.previousStateParams);
                    if($scope.isCreating) return $state.go('user_editor', {user_id: res.id});

                    return;
                }

                if(res.messages) return Utils.displayValidationErrors(res);

                ngToast.danger("Ocorreu um erro ao salvar o usuário<br>por favor entre em contato com o nosso suporte informando o nome do erro: " + res.reason);
            }

        });

})();
(function() {

    angular.module('BuscaAtivaEscolar')
        .config(function ($stateProvider) {
            $stateProvider.state('user_report', {
                url: '/report/users/',
                templateUrl: '/views/users/report.html',
                controller: 'ReportUsersCtrl'
            })
        })
        .controller('ReportUsersCtrl', function ($scope, $rootScope, ngToast, API, Config, Platform, Identity, Users, Groups, Tenants, StaticData, Modals) {

            $scope.reports = {};
            $scope.lastOrder = {
                date: null
            };

            $scope.createReport = function() {

                Modals.show(
                    Modals.Confirm(
                        'Confirma a criação de um novo relatório?',
                        'Esse processo pode demorar alguns minutos devido a quantidade de usuários registrados na plataforma'
                    )).then(function () {
                        Users.createReport().$promise
                        .then(function (res) {
                            $scope.lastOrder.date = res.date;
                        });
                    });

            };

            $scope.downloadFile = function(file) {
                Identity.provideToken().then(function (token) {
                    window.open(Config.getAPIEndpoint() + 'users/reports/download?token=' + token + "&file=" + file);
                });
            };

            $scope.refresh = function() {
                $scope.reports = Users.reports();
                setInterval(function() {
                    $scope.reports = Users.reports();
                }, 600000);
            };

            $scope.refresh();

        });

})();
(function () {
  var app = angular
    .module('BuscaAtivaEscolar')
    .config(function ($stateProvider) {
      $stateProvider.state('admin_setup', {
        url: '/admin_setup/{id}?token',
        templateUrl: '/views/initial_admin_setup/main.html',
        controller: 'AdminSetupCtrl',
        unauthenticated: true,
      });
    })
    .controller(
      'AdminSetupCtrl',
      function (
        $scope,
        $stateParams,
        $window,
        moment,
        ngToast,
        Platform,
        Utils,
        TenantSignups,
        Cities,
        Modals,
        StaticData
      ) {
        $scope.static = StaticData;

        var signupID = $stateParams.id;
        var signupToken = $stateParams.token;

        // console.info('[admin_setup] Admin setup for signup: ', signupID, 'token=', signupToken);

        $scope.step = 1;
        $scope.numSteps = 4;
        $scope.ready = false;

        $scope.panelTerm = false;

        var fieldNames = {
          cpf: 'CPF',
          name: 'nome',
          email: 'e-mail institucional',
          position: 'posição',
          institution: 'instituição',
          password: 'senha',
          dob: 'data de nascimento',
          phone: 'telefone institucional',
          mobile: 'celular institucional',
          personal_phone: 'telefone pessoal',
          personal_mobile: 'celular pessoal',
          lgpd: 'termo de adesão',
        };

        var requiredAdminFieldsPolitical = [
          'email',
          'name',
          'cpf',
          'dob',
          'phone',
          'password',
          'lgpd',
        ];
        var requiredAdminFieldsOperational = [
          'email',
          'name',
          'cpf',
          'dob',
          'phone',
        ];

        var messages = {
          invalid_gp:
            'Dados do(a) gestor(a) político(a) incompletos! Campos inválidos: ',
          invalid_co:
            'Dados do(a) coordenador(a) operacional incompletos! Campos inválidos: ',
        };

        $scope.signup = {};
        $scope.admins = {
          political: {},
          operational: {},
        };

        $scope.lastTenant = null;
        $scope.lastCoordinators = [];
        $scope.isNecessaryNewCoordinator = true;

        $scope.goToStep = function (step) {
          if ($scope.step < 1) return;
          if ($scope.step > $scope.numSteps) return;

          $scope.step = step;
          $window.scrollTo(0, 0);
        };

        $scope.nextStep = function () {
          //set lgpd = 1 - obrigatório na API
          $scope.admins.political.lgpd = 1;

          if ($scope.step >= $scope.numSteps) return;

          if (
            $scope.step === 3 &&
            !Utils.isValid(
              $scope.admins.political,
              requiredAdminFieldsPolitical,
              fieldNames,
              messages.invalid_gp
            )
          )
            return;
          if (
            $scope.step === 4 &&
            !Utils.isValid(
              $scope.admins.operational,
              requiredAdminFieldsOperational,
              fieldNames,
              messages.invalid_co
            )
          )
            return;

          if (
            $scope.step === 3 &&
            !Utils.isvalidTerm($scope.admins.political.lgpd)
          )
            return;

          $scope.step++;
          $window.scrollTo(0, 0);
        };

        $scope.prevStep = function () {
          if ($scope.step <= 1) return;

          $scope.step--;
          $window.scrollTo(0, 0);
        };

        $scope.fetchSignupDetails = function () {
          TenantSignups.getViaToken(
            { id: signupID, token: signupToken },
            function (data) {
              $scope.ready = true;
              $scope.signup = data;
              $scope.admins.political = data.data.admin;
              $scope.admins.political.dob = moment(
                data.data.admin.dob
              ).toDate();

              $scope.lastCoordinators = data.last_coordinators;
              $scope.lastTenant = data.last_tenant;

              $scope.step = 3;
            }
          );
        };

        $scope.showPassowrd = function (elementId) {
          var field_password = document.getElementById(elementId);
          field_password.type === 'password'
            ? (field_password.type = 'text')
            : (field_password.type = 'password');
        };

        $scope.provisionTenant = function () {
          //set lgpd = 1 - obrigatório na API
          $scope.admins.political.lgpd = 1;

          if (
            !Utils.isValid(
              $scope.admins.political,
              requiredAdminFieldsPolitical,
              fieldNames,
              messages.invalid_gp
            )
          )
            return;

          if ($scope.isNecessaryNewCoordinator) {
            if (
              !Utils.isValid(
                $scope.admins.operational,
                requiredAdminFieldsOperational,
                fieldNames,
                messages.invalid_co
              )
            )
              return;
          }

          Modals.show(
            Modals.Confirm(
              'Tem certeza que deseja prosseguir com o cadastro?',
              'Os dados informados serão utilizados para cadastrar os demais usuários. A configuração do município será realizada pelo(a) Coordenador(a) Operacional.'
            )
          ).then(function (res) {
            var data = {
              id: signupID,
              token: signupToken,
            };

            data.political = Object.assign({}, $scope.admins.political);
            data.political = Utils.prepareDateFields(data.political, ['dob']);
            data.political = Utils.prepareCityFields(data.political, [
              'work_city',
            ]);

            data.operational = Object.assign({}, $scope.admins.operational);
            data.operational = Utils.prepareDateFields(data.operational, [
              'dob',
            ]);
            data.operational = Utils.prepareCityFields(data.operational, [
              'work_city',
            ]);

            data.lastTenant = $scope.lastTenant;
            data.lastCoordinators = $scope.lastCoordinators;
            data.isNecessaryNewCoordinator = $scope.isNecessaryNewCoordinator;

            TenantSignups.complete(data, function (res) {
              if (res.status === 'ok') {
                ngToast.success('Adesão finalizada!');
                $scope.step = 5;
                return;
              }

              if (res.reason === 'political_admin_email_in_use') {
                $scope.step = 3;
                return ngToast.danger(
                  'O e-mail indicado para o(a) gestor(a) político(a) já está em uso. Por favor, escolha outro e-mail'
                );
              }

              if (res.reason === 'operational_admin_email_in_use') {
                $scope.step = 4;
                return ngToast.danger(
                  'O e-mail indicado para o(a) coordenador(a) já está em uso. Por favor, escolha outro e-mail'
                );
              }

              if (res.reason === 'admin_emails_are_the_same') {
                $scope.step = 4;
                return ngToast.danger(
                  'Você precisa informar e-mails diferentes para o gestor(a) político(a) e o(a) coordenador(a) operacional'
                );
              }

              if (res.reason === 'invalid_political_admin_data') {
                $scope.step = 3;
                ngToast.danger(messages.invalid_gp);
                return Utils.displayValidationErrors(res);
              }

              if (res.reason === 'invalid_operational_admin_data') {
                $scope.step = 4;
                ngToast.danger(messages.invalid_co);
                return Utils.displayValidationErrors(res);
              }

              if (res.reason === 'coordinator_emails_are_the_same') {
                $scope.step = 4;
                return ngToast.danger(
                  'Você precisa informar e-mails diferentes para o(a) gestor(a) político(a), o(a) novo(a) coordenador(a) operacional e os demais coordenadores'
                );
              }

              if (res.reason === 'coordinator_email_in_use') {
                $scope.step = 4;
                return ngToast.danger(
                  'Email do(a) coordenador(a) desativado já está em uso por outro perfil'
                );
              }

              ngToast.danger(
                'Ocorreu um erro ao finalizar a adesão: ' + res.reason
              );
            });
          });
        };

        $scope.fetchSignupDetails();

        // $scope.openTerm = function () {
        // 	$scope.panelTerm = !$scope.panelTerm;
        // };

        $scope.changeNecessityCoordinator = function (necessity) {
          $scope.isNecessaryNewCoordinator = necessity;
          $scope.admins.operational = {};
        };
      }
    );

  app.directive('myDirective', function () {
    return {
      require: 'ngModel',
      link: function (scope, element, attr, mCtrl) {
        function myValidation(value) {
          const capital = document.getElementById('capital');
          const number = document.getElementById('number');
          const length = document.getElementById('length');
          const letter = document.getElementById('letter');
          const symbol = document.getElementById('symbol');
          const check = function (entrada) {
            entrada.classList.remove('invalid');
            entrada.classList.add('valid');
            //mCtrl.$setValidity('charE', true);
          };
          const uncheck = function (entrada) {
            entrada.classList.remove('valid');
            entrada.classList.add('invalid');
          };
          if (typeof value === 'string') {
            var lowerCaseLetters = /[a-z]/g;
            if (value.match(lowerCaseLetters)) {
              check(letter);
            } else {
              uncheck(letter);
            }
            var upperCaseLetters = /[A-Z]/g;
            if (value.match(upperCaseLetters)) {
              check(capital);
            } else {
              uncheck(capital);
            }
            var numbers = /[0-9]/g;
            if (value.match(numbers)) {
              check(number);
            } else {
              uncheck(number);
            }
            var symbols = /[!@#$%&*?]/g;
            if (value.match(symbols)) {
              check(symbol);
            } else {
              uncheck(symbol);
            }
            // Validate length
            if (value.length >= 8 && value.length <= 16) {
              check(length);
            } else {
              uncheck(length);
            }
          }

          /*else {
													mCtrl.$setValidity('charE', false);
											}*/
          return value;
        }
        mCtrl.$parsers.push(myValidation);
      },
    };
  });
})();

(function () {
  angular
    .module('BuscaAtivaEscolar')
    .config(function ($stateProvider) {
      $stateProvider.state('mayor_confirmation', {
        url: '/confirmacao_prefeito/{id}',
        templateUrl: '/views/initial_tenant_setup/mayor_confirmation.html',
        controller: 'MayorConfirmationCtrl',
        unauthenticated: true,
      });
    })
    .controller(
      'MayorConfirmationCtrl',
      function ($scope, $state, $stateParams, Tenants, ngToast) {
        $scope.prevStep = function () {
          return $state.go('login');
        };

        $scope.provisionTenant = function () {
          var confirm = Tenants.mayorConfirmation({
            id: $stateParams.id,
          }).$promise;

          confirm.then(function (res) {
            if (res.status === 'ok') {
              ngToast.success(
                'A sua solicitação de adesão foi confirmada com sucesso!'
              );
              $state.go('login');
              /*$scope.css = 'alert alert-success';
              $scope.resposta =
                'A sua solicitação de adesão foi confirmada com sucesso!';*/
            } else {
              ngToast.danger('Adesão já realizada.');
            }
          });
        };
        // http://api.busca-ativa-escolar.test/api/v1/signups/tenants/8d239e40-2550-11eb-978f-cd8b250fb29a/accept
        /*var confirm = Tenants.mayorConfirmation({
          id: $stateParams.id,
        }).$promise;

        confirm.then(function (res) {
          if (res.status === 'ok') {
            $scope.css = 'alert alert-success';
            $scope.resposta =
              'A sua solicitação de adesão foi confirmada com sucesso!';
          } else {
            $scope.css = 'alert alert-danger';
            $scope.resposta =
              'Problema na solicitação, por favor entre em contato com o nosso suporte!';
          }
        });*/
      }
    );
})();

(function() {

	angular.module('BuscaAtivaEscolar')
		.config(function ($stateProvider) {
			$stateProvider.state('tenant_setup', {
				url: '/tenant_setup?step',
				templateUrl: '/views/initial_tenant_setup/main.html',
				controller: 'TenantSetupCtrl'
			});
		})
		.controller('TenantSetupCtrl', function ($scope, $state, $stateParams, Platform, Identity, TenantSignups, Tenants, Modals) {

			if(!$stateParams.step) return $state.go('tenant_setup', {step: 1});

			$scope.step = parseInt($stateParams.step, 10);
			$scope.isReady = false;
			$scope.tenant = {};

			$scope.getAdminUserID = function() {
				return $scope.tenant.operational_admin_id;
			};

			$scope.goToStep = function(step) {
				if(step > 6) return;
				if(step < 1) return;
				$state.go('tenant_setup', {step: step});
			};

			$scope.nextStep = function() {

				var step = $scope.step + 1;
				if($scope.step > 6) {
					return $scope.completeSetup();
				}

				$state.go('tenant_setup', {step: step});
			};

			$scope.prevStep = function() {
				var step = $scope.step - 1;
				if(step <= 0) step = 1;

				$state.go('tenant_setup', {step: step});
			};

			$scope.getCurrentStep = function() {
				return $scope.step;
			};

			$scope.completeSetup = function() {
				Modals.show(Modals.Confirm(
				'Deseja prosseguir com o cadastro?',
				'Os dados informados poderão ser alterados por você e pelos gestores na área de Configurações.'
				)).then(function(res) {
					TenantSignups.completeSetup({}, function() {
						Platform.setFlag('HIDE_NAVBAR', false);

						Identity.refresh();

						$state.go('dashboard');
					});
				});
			};

			Platform.whenReady(function() {
				Platform.setFlag('HIDE_NAVBAR', true);

				$scope.tenant = Identity.getCurrentUser().tenant;
				$scope.isReady = true;

				console.info('[tenant_setup] Tenant setup for: ', $scope.tenant);
			});

		});

})();
(function () {
  angular
    .module('BuscaAtivaEscolar')
    .controller(
      'TenantSignupCtrl',
      function (
        $scope,
        $rootScope,
        $window,
        ngToast,
        Utils,
        TenantSignups,
        Cities,
        Modals,
        StaticData,
        API,
        Config
      ) {
        $scope.static = StaticData;

        $scope.step = 1;
        $scope.numSteps = 4;

        $scope.isCityAvailable = false;

        $scope.stepChecks = [false, false, false];
        $scope.stepsNames = [
          'Cadastre o município',
          'Cadastre o(a) prefeito(a)',
          'Gestor(a) Político(a)',
        ];

        $scope.form = {
          uf: null,
          city: null,
          admin: {},
          mayor: {},
        };

        var fieldNames = {
          cpf: 'CPF',
          name: 'nome',
          email: 'e-mail institucional',
          position: 'posição',
          institution: 'instituição',
          password: 'senha',
          dob: 'data de nascimento',
          phone: 'telefone institucional',
          mobile: 'celular institucional',
          personal_phone: 'telefone pessoal',
          personal_mobile: 'celular pessoal',
          //link_titulo: 'Documento com foto'
        };

        var messages = {
          invalid_gp:
            'Dados do(a) gestor(a) político incompletos! Campos inválidos: ',
          invalid_mayor:
            'Dados do(a) prefeito(a) incompletos! Campos inválidos: ',
        };

        //Campos obrigatórios do formulario
        var requiredAdminFields = ['email', 'name', 'cpf', 'dob', 'phone'];
        //var requiredMayorFields = ['name', 'cpf', 'dob', 'phone', 'link_titulo'];
        var requiredMayorFields = ['name', 'cpf', 'dob', 'phone'];

        $scope.fetchCities = function (query) {
          var data = { name: query, $hide_loading_feedback: true };
          if ($scope.form.uf) data.uf = $scope.form.uf;

          return Cities.search(data).$promise.then(function (res) {
            return res.results;
          });
        };

        $scope.renderSelectedCity = function (city) {
          if (!city) return '';
          return city.uf + ' / ' + city.name;
        };

        $scope.goToStep = function (step) {
          //console.log($scope.step, $scope.numSteps)
          if ($scope.step < 1) return;
          if ($scope.step >= $scope.numSteps) return;
          //console.log($scope.step, $scope.numSteps)

          $scope.step = step;
          $window.scrollTo(0, 0);
        };

        $scope.nextStep = function (step) {
          if ($scope.step >= $scope.numSteps) return;

          if (
            $scope.step === 3 &&
            !Utils.isValid(
              $scope.form.admin,
              requiredAdminFields,
              fieldNames,
              messages.invalid_gp
            )
          )
            return;
          if (
            $scope.step === 2 &&
            !Utils.isValid(
              $scope.form.mayor,
              requiredMayorFields,
              fieldNames,
              messages.invalid_mayor
            )
          )
            return;
          if (
            $scope.step === 3 &&
            !Utils.haveEqualsValue('Os CPFs', [
              $scope.form.admin.cpf,
              $scope.form.mayor.cpf,
            ])
          )
            return;
          if (
            $scope.step === 3 &&
            !Utils.haveEqualsValue('Os nomes', [
              $scope.form.admin.name,
              $scope.form.mayor.name,
            ])
          )
            return;

          $scope.step++;
          $window.scrollTo(0, 0);

          $scope.stepChecks[step] = true;
        };

        $scope.prevStep = function () {
          if ($scope.step <= 1) return;

          $scope.step--;
          $window.scrollTo(0, 0);
        };

        $scope.onCitySelect = function (uf, city) {
          if (!uf || !city) return;
          $scope.checkCityAvailability(city);
        };

        $scope.checkCityAvailability = function (city) {
          if (!$scope.form.uf) $scope.form.uf = city.uf;

          $scope.hasCheckedAvailability = false;

          Cities.checkIfAvailable({ id: city.id }, function (res) {
            $scope.hasCheckedAvailability = true;
            $scope.isCityAvailable = !!res.is_available;
          });
        };
        $scope.agree = function (value) {
          $scope.agreeTOS = value;
          console.log($scope.agreeTOS);
        };

        $scope.finish = function (step) {
          if (!$scope.agreeTOS) return;

          if (
            $scope.step === 3 &&
            !Utils.haveEqualsValue('Os CPFs', [
              $scope.form.admin.cpf,
              $scope.form.mayor.cpf,
            ])
          )
            return;
          if (
            $scope.step === 3 &&
            !Utils.haveEqualsValue('Os nomes', [
              $scope.form.admin.name,
              $scope.form.mayor.name,
            ])
          )
            return;

          if (
            $scope.step === 3 &&
            !Utils.haveEqualsValue('Os emails', [
              $scope.form.admin.email,
              $scope.form.mayor.email,
            ])
          )
            return;

          var data = {};
          data.admin = Object.assign({}, $scope.form.admin);
          data.mayor = Object.assign({}, $scope.form.mayor);
          data.city = Object.assign({}, $scope.form.city);

          if (
            !Utils.isValid(data.admin, requiredAdminFields, messages.invalid_gp)
          )
            return;
          if (
            !Utils.isValid(
              data.mayor,
              requiredMayorFields,
              messages.invalid_mayor
            )
          )
            return;

          data.city_id = data.city ? data.city.id : null;
          data.admin = Utils.prepareDateFields(data.admin, ['dob']);
          data.mayor = Utils.prepareDateFields(data.mayor, ['dob']);

          TenantSignups.register(data, function (res) {
            if (res.status === 'ok') {
              ngToast.success('Solicitação de adesão registrada!');
              $scope.step = 5;
              return;
            }

            if (res.reason === 'political_admin_email_in_use') {
              $scope.step = 2;
              return ngToast.danger(
                'O e-mail indicado para o(a) gestor(a) político já está em uso. Por favor, escolha outro e-mail'
              );
            }

            if (res.reason === 'invalid_political_admin_data') {
              $scope.step = 2;
              ngToast.danger(messages.invalid_gp);

              return Utils.displayValidationErrors(res);
            }

            ngToast.danger(
              'Ocorreu um erro ao registrar a adesão: ' + res.reason
            );
          });
          $scope.stepChecks[step] = true;
        };

        // $scope.beginImport = function() {
        //     Modals.show(Modals.FileUploaderTitulo(
        //         'Enviar documento com foto',
        //         'Selecione uma cópia do documento em formato PNG ou JPG. Arquivos em outros formatos não serão aceitos',
        //         API.getURI('signups/tenants/uploadfile')
        //     )).then(function (file) {
        //
        //         if(file.status == "error"){
        //             $scope.form.mayor.link_titulo = null;
        //             ngToast.danger('Erro na importação! '+ file.reason);
        //         }else{
        //             $scope.form.mayor.link_titulo = file.link;
        //             ngToast.warning('Arquivo importado com sucesso');
        //         }
        //
        //     });
        // };
      }
    );
})();

(function() {

    var app = angular.module('BuscaAtivaEscolar')
        .config(function ($stateProvider) {
            $stateProvider.state('user_first_config', {
                url: '/user_setup/{id}?token',
                templateUrl: '/views/initial_admin_setup/review_user.html',
                controller: 'UserSetupCtrl',
                unauthenticated: true
            });
        })
        .controller('UserSetupCtrl', function ($scope, $stateParams, $window, moment, ngToast, Platform, Utils, TenantSignups, Modals, $state) {

            $scope.canUpdateDataUser = true;
            $scope.message = "";

            var userID = $stateParams.id;
            var userToken = $stateParams.token;

            $scope.user = {};

            var fieldNames = {
                cpf: 'CPF',
                name: 'nome',
                email: 'e-mail institucional',
                position: 'posição',
                institution: 'instituição',
                password: 'senha',
                dob: 'data de nascimento',
                phone: 'telefone institucional',
                mobile: 'celular institucional',
                personal_phone: 'telefone pessoal',
                personal_mobile: 'celular pessoal',
                lgpd: 'termo de adesão'
            };

            var requiredFields = ['email','name','cpf','dob','phone','password', 'lgpd'];

            var messages = {
                invalid_user: 'Dados do usuário incompletos! Campos inválidos: '
            };

            var dateOnlyFields = ['dob'];

            $scope.fetchUserDetails = function() {
                TenantSignups.getUserViaToken(
                    {id: userID, token: userToken},
                    function (data) {

                        if( 'status' in data && 'reason' in data ){
                            $scope.canUpdateDataUser = false;
                            if(data.reason == 'token_mismatch') { $scope.message = "Token inválido"; }
                            if(data.reason == 'invalid_token') { $scope.message = "Token inválido"; }
                            if(data.reason == 'lgpd_already_accepted') { $scope.message = "Usuário já ativado"; }
                        }

                        if( 'email' in data && 'name' in data ){
                            $scope.canUpdateDataUser = true;
                            $scope.message = "";

                            $scope.user = data;
                            $scope.user.dob = moment(data.dob).toDate();
                        }

                    });
            };

            $scope.activeUser = function () {

                //set lgpd = 1 pois na API é obrigatório
                $scope.user.lgpd = 1;

                if(!Utils.isValid($scope.user, requiredFields, fieldNames, messages.invalid_user)) return;

                Modals.show(Modals.Confirm(
                    'Confirma os dados?',
                    'Revise todos os dados informados, pois o seu acesso à plataforma se dará a partir deles, sobretudo do e-mail e senha cadastrados.'
                )).then(function(res) {

                    var finalUser = Object.assign({}, $scope.user);
                    finalUser = Utils.prepareDateFields(finalUser, dateOnlyFields);

                    var data = {
                        id: userID,
                        token: userToken,
                        user: finalUser
                    };

                    TenantSignups.activeUser(data, function (res) {

                        if( 'status' in res && 'reason' in res ){

                            if(res.reason == 'token_mismatch') {
                                ngToast.danger("Token inválido");
                            }
                            if(res.reason == 'invalid_token') {
                                ngToast.danger("Token inválido");
                            }
                            if(res.reason == 'lgpd_already_accepted') {
                                ngToast.danger("Usuário já ativado");
                            }
                            if(res.reason == 'email_already_used') {
                                ngToast.danger("Email inválido. Já pertence a outro usuário");
                            }
                            if(res.reason == 'invalid_password') {
                                ngToast.danger("Senha inválida.");
                            }
                            if(res.reason == 'validation_failed') {
                                ngToast.danger("Campos inválidos. Preencha todos os campos obrigatórios");
                            }
                        }

                        if( 'status' in res && 'updated' in res ){
                            ngToast.success("Perfil ativado");
                            $state.go('login');
                        }

                    });

                });
            };

            $scope.openTerm = function () {
                $scope.panelTerm = !$scope.panelTerm;
            };

            $scope.showPassowrd = function () {
                var field_password = document.getElementById("fld-co-password");
                field_password.type === "password" ? field_password.type = "text" : field_password.type = "password";
            };

            $scope.fetchUserDetails();

        });
        app.directive('myDirective', function() {
			return {
					require: 'ngModel',
					link: function(scope, element, attr, mCtrl) {
							function myValidation(value) {
									const capital = document.getElementById('capital');
									const number = document.getElementById('number');
									const length = document.getElementById('length');
									const letter = document.getElementById('letter');
									const symbol = document.getElementById('symbol')
									const check = function(entrada) {
											entrada.classList.remove('invalid');
											entrada.classList.add('valid');
											//mCtrl.$setValidity('charE', true);
									}
									const uncheck = function(entrada) {
											entrada.classList.remove('valid');
											entrada.classList.add('invalid');
									}
									if(typeof(value) === "string"){
											var lowerCaseLetters = /[a-z]/g;
											if (value.match(lowerCaseLetters)) {
													check(letter)
											} else {
													uncheck(letter)
											}
											var upperCaseLetters = /[A-Z]/g;
											if (value.match(upperCaseLetters)) {
													check(capital)
											} else {
													uncheck(capital)
											}
											var numbers = /[0-9]/g;
											if (value.match(numbers)) {
													check(number)
											} else {
													uncheck(number)
											}
											var symbols = /[!@#$%&*?]/g;
											if (value.match(symbols)) {
													check(symbol)
											} else {
													uncheck(symbol)
											}
									// Validate length
											if (value.length >= 8 && value.length <= 16) {
													check(length);
											} else {
													uncheck(length);
											}
									}
									
									/*else {
													mCtrl.$setValidity('charE', false);
											}*/
									return value;
							}
							mCtrl.$parsers.push(myValidation);
					}
			};
	});

})();
(function () {
  var app = angular
    .module('BuscaAtivaEscolar')
    .config(function ($stateProvider) {
      $stateProvider.state('lgpd_signup', {
        url: '/lgpd_signup/:user_id',
        templateUrl: '/views/users/user_lgpd_signup.html',
        controller: 'LgpdSignupCtrl',
      });
    })
    .controller(
      'LgpdSignupCtrl',
      function (
        $rootScope,
        $scope,
        $state,
        $stateParams,
        $localStorage,
        ngToast,
        Platform,
        Cities,
        Utils,
        Tenants,
        Identity,
        Users,
        Groups,
        StaticData
      ) {
        $scope.signed = false;
        $scope.term = true;

        $scope.currentState = $state.current.name;

        $scope.user = {};
        $scope.isReviewing = false;

        $scope.identity = Identity;
        $scope.static = StaticData;

        $scope.groups = {};
        $scope.tenants = Tenants.find();
        $scope.quickAdd = $stateParams.quick_add === 'true';

        var permissions = {};
        var dateOnlyFields = ['dob'];

        var userTypeVisitantes = [];
        var permissionsFormForVisitante = [];

        $scope.perfilVisitante = { name: '' };
        $scope.permissionsVisitantes = ['relatorios'];

        Platform.whenReady(function () {
          permissions = StaticData.getPermissions();
          userTypeVisitantes = StaticData.getUserTypeVisitantes();
          permissionsFormForVisitante =
            StaticData.getPermissionsFormForVisitante();
          $scope.isCreating =
            !$scope.identity.getCurrentUser().id ||
            $scope.identity.getCurrentUser().id === 'new';

          if (!$scope.isCreating) {
            $scope.user = Users.myself(
              { id: $scope.identity.getCurrentUser().id },
              prepareUserModel
            );
          } else {
            if (
              Identity.getType() === 'superuser' ||
              Identity.getType() === 'gestor_nacional'
            ) {
              $scope.groups = {};
            } else {
              $scope.groups = Groups.find();
            }
          }

          if (Identity.getCurrentUser().lgpd) {
            $scope.signed = true;
          }
        });

        $scope.isSuperAdmin = function () {
          return (
            Identity.getType() === 'superuser' ||
            Identity.getType() === 'gestor_nacional'
          );
        };

        $scope.isTargetUserTenantBound = function () {
          return (
            StaticData.getTypesWithGlobalScope().indexOf($scope.user.type) ===
              -1 &&
            StaticData.getTypesWithUFScope().indexOf($scope.user.type) === -1
          );
        };

        $scope.isTargetUserUFBound = function () {
          return (
            StaticData.getTypesWithUFScope().indexOf($scope.user.type) !== -1
          );
        };

        $scope.canDefineUserTenant = function () {
          // Can specify user tenant only if superadmin, and only if target user type is tenant-bound
          if (!$scope.isSuperAdmin()) return false;
          return $scope.isTargetUserTenantBound();
        };

        $scope.canDefineUserUF = function () {
          // Only superusers can define user UF, and only on UF-bound user types
          if (!$scope.isSuperAdmin()) return false;
          return (
            StaticData.getTypesWithUFScope().indexOf($scope.user.type) !== -1
          );
        };

        $scope.openUser = function (user_id, is_reviewing) {
          $scope.isCreating = false;
          $scope.isReviewing = !!is_reviewing;
          $scope.user = Users.find({ id: user_id }, prepareUserModel);
        };

        $scope.goBack = function () {
          return $state.go(
            $rootScope.previousState,
            $rootScope.previousStateParams
          );
        };

        $scope.getUserTypes = function () {
          if (!permissions) return {};
          if (!permissions.can_manage_types) return {};

          var finalPermissions = permissions.can_manage_types[
            Identity.getCurrentUser().type
          ].filter(function (el) {
            return $scope.getUserTypesVisitantes().indexOf(el) < 0;
          });

          return finalPermissions;
        };

        $scope.getUserTypesVisitantes = function () {
          if (!permissions) return {};
          if (!permissions.can_manage_types) return {};
          return userTypeVisitantes;
        };

        $scope.getPermissionsFormForVisitante = function () {
          return permissionsFormForVisitante;
        };

        $scope.save = function () {
          //1 pois a API valida essa opção;
          $scope.user.lgpd = 1;
          // if ($scope.user.lgpd === 0) {
          //     ngToast.danger('Para prosseguir, é preciso concordar com o termo de adesão. Em caso de dúvidas, entre em contato');
          //     return;
          // }

          if ($scope.user.type === 'perfil_visitante') {
            $scope.user.type = getFinalTypeUser();
          }

          var data = Object.assign({}, $scope.user);
          //onsole.log(data);
          data = Utils.prepareDateFields(data, dateOnlyFields);
          data = Utils.prepareCityFields(data, ['work_city']);

          if ($scope.isCreating) {
            return Users.create(data).$promise.then(onSaved);
          }

          Users.updateYourself(data).$promise.then(function (res) {
            if (res.status === 'ok') {
              ngToast.success(
                'TERMO DE RESPONSABILIDADE E CONFIDENCIALIDADE Assinado com Sucesso'
              );
              $localStorage.identity.current_user.lgpd = 1;
              $state.go('dashboard');
            }

            if (res.status === 'error') {
              ngToast.danger(
                'Ocorreu um erro, por favor procure o nosso suporte' +
                  res.messages[0]
              );
            }
          });
        };

        $scope.onSelectTenant = function () {
          $scope.groups = Groups.findByTenant({
            tenant_id: $scope.user.tenant_id,
          });
        };

        $scope.onSelectUf = function () {
          $scope.groups = Groups.findByUf({ uf: $scope.user.uf });
        };

        $scope.onSelectFunction = function () {
          if (
            Identity.getType() === 'superuser' ||
            Identity.getType() === 'gestor_nacional'
          ) {
            $scope.groups = {};
            $scope.user.uf = null;
            $scope.user.tenant_id = null;
            $scope.perfilVisitante.name = '';
          }
        };

        function prepareUserModel(user) {
          if (
            Identity.getType() === 'superuser' ||
            Identity.getType() === 'gestor_nacional'
          ) {
            if (
              user.type === 'coordenador_estadual' ||
              user.type === 'gestor_estadual' ||
              user.type === 'supervisor_estadual'
            ) {
              $scope.groups = Groups.findByUf({ uf: user.uf });
            } else {
              $scope.groups = Groups.findByTenant({
                tenant_id: user.tenant_id,
              });
            }

            //perfil de visitante
            if (user.type.includes('visitante_')) {
              $scope.permissionsVisitantes =
                permissionsFormForVisitante[user.type];
              if (user.type.includes('visitante_nacional')) {
                $scope.perfilVisitante.name = 'visitante_nacional';
              }
              if (user.type.includes('visitante_estadual')) {
                $scope.perfilVisitante.name = 'visitante_estadual';
              }
              $scope.user.type = 'perfil_visitante';
            }
          } else {
            $scope.groups = Groups.find();
          }

          return Utils.unpackDateFields(user, dateOnlyFields);
        }

        $scope.test = () => {
          let field_password = document.getElementById('fld-gp-password');
          field_password.onfocus = function () {
            document.getElementById('message').style.display = 'block';
          };
        };

        $scope.showPassowrd = function () {
          var field_password = document.getElementById('fld-gp-password');

          field_password.type === 'password'
            ? (field_password.type = 'text')
            : (field_password.type = 'password');
        };

        function onSaved(res) {
          if (res.status === 'ok') {
            ngToast.success('Dados de usuário salvos com sucesso!');

            if ($scope.quickAdd && $rootScope.previousState)
              return $state.go(
                $rootScope.previousState,
                $rootScope.previousStateParams
              );
            if ($scope.isCreating)
              return $state.go('user_editor', { user_id: res.id });

            return;
          }

          if (res.messages) return Utils.displayValidationErrors(res);

          ngToast.danger(
            'Ocorreu um erro ao salvar o usuário<br>por favor entre em contato com o nosso suporte informando o nome do erro: ' +
              res.reason
          );
        }

        function getFinalTypeUser() {
          var finalType = '';
          for (var [key, value] of Object.entries(
            $scope.getPermissionsFormForVisitante()
          )) {
            if (
              arraysEqual(
                $scope.permissionsVisitantes.filter(function (obj) {
                  return obj;
                }),
                value
              ) &&
              key.includes($scope.perfilVisitante.name)
            ) {
              finalType = key;
            }
          }
          return finalType;
        }

        function arraysEqual(_arr1, _arr2) {
          if (
            !Array.isArray(_arr1) ||
            !Array.isArray(_arr2) ||
            _arr1.length !== _arr2.length
          )
            return false;
          var arr1 = _arr1.concat().sort();
          var arr2 = _arr2.concat().sort();
          for (var i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) return false;
          }
          return true;
        }

        $scope.openTerm = function () {
          $scope.panelTerm = !$scope.panelTerm;

          console.log($scope.lastCoordinators);
        };
      }
    );
  app.directive('myDirective', function () {
    return {
      require: 'ngModel',
      link: function (scope, element, attr, mCtrl) {
        function myValidation(value) {
          const capital = document.getElementById('capital');
          const number = document.getElementById('number');
          const length = document.getElementById('length');
          const letter = document.getElementById('letter');
          const symbol = document.getElementById('symbol');
          const check = function (entrada) {
            entrada.classList.remove('invalid');
            entrada.classList.add('valid');
            //mCtrl.$setValidity('charE', true);
          };
          const uncheck = function (entrada) {
            entrada.classList.remove('valid');
            entrada.classList.add('invalid');
          };
          if (typeof value === 'string') {
            var lowerCaseLetters = /[a-z]/g;
            if (value.match(lowerCaseLetters)) {
              check(letter);
            } else {
              uncheck(letter);
            }
            var upperCaseLetters = /[A-Z]/g;
            if (value.match(upperCaseLetters)) {
              check(capital);
            } else {
              uncheck(capital);
            }
            var numbers = /[0-9]/g;
            if (value.match(numbers)) {
              check(number);
            } else {
              uncheck(number);
            }
            var symbols = /[!@#$%&*?]/g;
            if (value.match(symbols)) {
              check(symbol);
            } else {
              uncheck(symbol);
            }
            // Validate length
            if (value.length >= 8 && value.length <= 16) {
              check(length);
            } else {
              uncheck(length);
            }
          }

          /*else {
                            mCtrl.$setValidity('charE', false);
                        }*/
          return value;
        }
        mCtrl.$parsers.push(myValidation);
      },
    };
  });
})();

(function () {
  angular
    .module('BuscaAtivaEscolar')
    .config(function ($stateProvider) {
      $stateProvider.state('pending_tenant_signups', {
        url: '/pending_tenant_signups',
        templateUrl: '/views/tenants/pending_signups.html',
        controller: 'PendingTenantSignupsCtrl',
      });
    })
    .controller(
      'PendingTenantSignupsCtrl',
      function (
        $scope,
        $rootScope,
        ngToast,
        Identity,
        TenantSignups,
        StaticData,
        Config
      ) {
        $scope.identity = Identity;
        $scope.static = StaticData;

        $scope.signups = {};
        $scope.signup = {};

        $scope.query = {
          max: 16,
          page: 1,
          sort: { created_at: 'desc' },
          filter: { status: 'pending_approval' },
        };

        $scope.electedMayor = null;

        $scope.copyText = function () {
          $scope.msgCopy = 'URL COPIADA';
          setTimeout(function () {
            $scope.msgCopy = '';
          }, 500);
        };

        $scope.onSelectType = function () {
          $scope.query.page = 1;
          $scope.refresh();
        };

        $scope.refresh = function () {
          $scope.signups = TenantSignups.getPending($scope.query);
          return $scope.signups.$promise;
        };

        $scope.export = function () {
          Identity.provideToken().then(function (token) {
            window.open(
              Config.getAPIEndpoint() +
                'signups/tenants/export?token=' +
                token +
                $scope.prepareUriToExport()
            );
          });
        };

        $scope.prepareUriToExport = function () {
          var uri = '';
          Object.keys($scope.query.filter).forEach(function (element) {
            uri = uri.concat(
              '&' + element + '=' + $scope.query.filter[element]
            );
          });
          return uri;
        };

        $scope.preview = function (signup) {
          const accepted = TenantSignups.accepted({ id: signup.id }).$promise;

          accepted.then(function (res) {
            if (res.status === 200) {
              $scope.signup = signup;
              if (signup.data.admin.dob.includes('-')) {
                let adminDate = signup.data.admin.dob.split('-');
                adminDate =
                  adminDate[2] + '/' + adminDate[1] + '/' + adminDate[0];
                signup.data.admin.dob = adminDate;
              }
              if (signup.data.mayor.dob.includes('-')) {
                let mayorDate = signup.data.mayor.dob.split('-');
                mayorDate =
                  mayorDate[2] + '/' + mayorDate[1] + '/' + mayorDate[0];
                signup.data.mayor.dob = mayorDate;
              }

              signup.is_approved_by_manager = false;
              if (res.data) {
                signup.is_approved_by_manager = true;
              }
            }
          });

          $scope.getMayorByCPF(signup.data.mayor.cpf);
        };

        $scope.approve = function (signup) {
          TenantSignups.approve({ id: signup.id }, function () {
            $scope.refresh();
            $scope.signup = {};
          });
        };

        $scope.reject = function (signup) {
          TenantSignups.reject({ id: signup.id }, function () {
            $scope.refresh();
            $scope.signup = {};
          });
        };

        $scope.updateRegistrationData = function (type, signup) {
          TenantSignups.updateRegistrationData(
            { id: signup.id, type: type, data: signup.data[type] },
            function (res) {
              typeName = type === 'mayor' ? 'prefeito' : 'gestor';

              if (res.status !== 'ok') {
                ngToast.danger(
                  `Falha ao atualizar os dados do(a) ${typeName}(a): ${res.reason} `
                );
                return;
              }

              ngToast.success(`Dados do(a) ${typeName}(a)  atualizado!`);
            }
          );
        };

        $scope.resendNotification = function (signup) {
          TenantSignups.resendNotification({ id: signup.id }, function () {
            ngToast.success('Notificação reenviada!');
          });
        };

        $scope.resendMail = function (signup) {
          TenantSignups.resendMail({ id: signup.id }, function () {
            ngToast.success('Notificação reenviada!');
          });
        };

        $scope.refresh();

        $scope.getMayorByCPF = function (numberCPF) {
          TenantSignups.getMayorByCPF({ cpf: numberCPF }, function (res) {
            $scope.electedMayor = res;
          });
        };
      }
    );
})();

(function() {

	angular.module('BuscaAtivaEscolar')
		.config(function($stateProvider) {
			$stateProvider.state('tenant_browser', {
				url: '/tenants',
				templateUrl: '/views/tenants/list.html',
				controller: 'TenantBrowserCtrl'
			})
		})
		.controller('TenantBrowserCtrl', function ($scope, $rootScope, ngToast, $state, Tenants, Modals, Identity, Config, Ufs) {

			$scope.identity = Identity;
			$scope.tenants = {};
			$scope.ufs = Ufs;
			$scope.query = {
                show_suspended: false,
				filter: {},
				sort: {},
				max: 16,
				page: 1
			};

			$scope.showCanceledCities = function () {
				$scope.query.show_suspended = $scope.query.show_suspended ? false : true;
				$scope.refresh();
            }

			$scope.refresh = function() {
				$scope.tenants = Tenants.all($scope.query);
			};

			$scope.export = function() {
				Identity.provideToken().then(function (token) {
					window.open(Config.getAPIEndpoint() + 'tenants/export?token='+token+$scope.prepareUriToExport());
				});
			};

            $scope.prepareUriToExport = function () {
                var uri = "";
                Object.keys($scope.query.filter).forEach( function (element) {
					uri = uri.concat("&"+element+"="+$scope.query.filter[element]);
                });
                uri = uri.concat("&show_suspended="+$scope.query.show_suspended);
                return uri;
            };

			$scope.disableTenant = function(tenant) {

				Modals.show(
					Modals.Confirm(
						'Tem certeza que deseja cancelar o município: ' + tenant.name,
						'Ao confirmar, os acessos do município serão cancelados, e todos os dados recebidos serão arquivados, e não poderão mais ser acessados. ' +
						'Os alertas e lembretes não serão disparados. As estatísticas e métricas coletadas não serão apagadas'
					))
					.then(function () {
						return Tenants.cancel({id: tenant.id}).$promise;
					})
					.then(function (res) {
						if(res && res.status === 'ok') {
							ngToast.success('Município cancelado com sucesso!');
							$scope.refresh();
							return;
						}

						ngToast.danger('Ocorreu um erro ao cancelar o município!');
						console.error("[tenants.cancel] Failed to cancel tenant: ", res);
					})

			};
			
			$scope.refresh();

		});

})();
//# sourceMappingURL=app.js.map
