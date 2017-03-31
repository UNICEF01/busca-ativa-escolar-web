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

		])
})();

(function() {
	console.log("[core.load] Loaded: config.js");

	angular
		.module('BuscaAtivaEscolar.Config', [])
		.factory('Config', function Config($rootScope, $cookies) {

			numeral.language('pt-br');
			moment.locale('pt-br');

			var config = {

				BUILD_PREFIX: 'b060.', // @DEPRECATED: see config/local_storage.js instead!

				API_ENDPOINTS: {
					local_http: {
						label: 'V1 Local - Homestead (Insecure)',
						api: 'http://api.busca-ativa-escolar.local/api/v1/',
						token: 'http://api.busca-ativa-escolar.local/api/auth/token',
					},
					homolog_http: {
						label: 'V1 Homolog - web4-lqdi (Insecure)',
						api: 'http://api.busca-ativa-escolar.dev.lqdi.net/api/v1/',
						token: 'http://api.busca-ativa-escolar.dev.lqdi.net/api/auth/token',
					}
				},

				NOTIFICATIONS_REFRESH_INTERVAL: 30000, // 30 sec

				TOKEN_EXPIRES_IN: 3600, // 1 hour
				REFRESH_EXPIRES_IN: 1209600, // 2 weeks

				ALLOWED_ENDPOINTS: ['local_http', 'homolog_http'],
				CURRENT_ENDPOINT: 'homolog_http'

			};

			var hasCheckedCookie = false;

			config.setEndpoint = function(endpoint) {
				if(config.ALLOWED_ENDPOINTS.indexOf(endpoint) === -1) {
					console.error("[core.config] Cannot set endpoint to ", endpoint,  ", not in valid endpoints list: ", config.ALLOWED_ENDPOINTS);
					return;
				}

				console.info("[core.config] Setting API endpoint: ", endpoint);
				config.CURRENT_ENDPOINT = endpoint;

				$cookies.put('FDENP_API_ENDPOINT', config.CURRENT_ENDPOINT);
			};

			config.getCurrentEndpoint = function() {
				if(hasCheckedCookie) return config.CURRENT_ENDPOINT;
				hasCheckedCookie = true;

				var cookie = $cookies.get('FDENP_API_ENDPOINT');
				if(cookie) config.setEndpoint($cookies.get('FDENP_API_ENDPOINT'));

				console.info("[core.config] Resolved current API endpoint: ", config.CURRENT_ENDPOINT, "cookie=", cookie);

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

		console.log("[core] @ChildActivityLogCtrl", $scope.$parent.entries);

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
		.controller('ChildAttachmentsCtrl', function ($scope, $state, $stateParams, ngToast, Auth, API, Modals, Children) {

			$scope.Children = Children;

			$scope.attachments = {};
			$scope.uploadToken = "";

			$scope.refresh = function() {
				$scope.attachments = Children.getAttachments({id: $stateParams.child_id});
			};

			$scope.uploadAttachment = function() {
				Modals.show(Modals.Prompt('Qual a descrição do anexo que será enviado?', '', false))
					.then(function(description) {
						return Modals.show(Modals.FileUploader(
							'Anexar arquivo',
							'Selecione um arquivo para anexar ao perfil da criança',
							API.getURI('children/' + $stateParams.child_id + '/attachments'),
							{description: description}
						))
					})
					.then(function (file) {
						ngToast.success('Arquivo anexado!');
						$scope.refresh();
					})
			};

			console.log("[core] @ChildAttachmentsCtrl", $stateParams);

			$scope.refresh();

		});

})();
(function() {

	angular.module('BuscaAtivaEscolar')
		.config(function ($stateProvider) {
			$stateProvider.state('child_browser', {
				url: '/children',
				templateUrl: '/views/children/browser.html',
				controller: 'ChildSearchCtrl'
			})
		})
		.controller('ChildSearchCtrl', function ($scope, Children, Decorators) {

			$scope.Decorators = Decorators;
			$scope.Children = Children;

			$scope.defaultQuery = {
				name: '',
				step_name: '',
				cause_name: '',
				assigned_user_name: '',
				location_full: '',
				alert_status: ['accepted'],
				case_status: ['in_progress'],
				risk_level: ['low','medium','high'],
				age: {from: 0, to: 28},
				age_null: true,
				gender: ['male', 'female', 'undefined'],
				gender_null: true,
				place_kind: ['rural','urban'],
				place_kind_null: true,
			};

			$scope.resetQuery = function() {
				return $scope.query = angular.merge({}, $scope.defaultQuery);;
			};

			$scope.query = $scope.resetQuery();
			$scope.search = {};

			$scope.refresh = function() {
				$scope.search = Children.search($scope.query);
			};

			$scope.refresh();


		});

})();
(function() {
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

	function ChildCasesCtrl($q, $scope, $state, $stateParams, ngToast, Identity, Utils, Alerts, Modals, Children, CaseSteps, Decorators) {

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

			console.log("[child_viewer.cases] Opening current case for child: ", child);

			$scope.openedCase = child.cases.find(function(item) {
				if($stateParams.case_id) return item.id === $stateParams.case_id;
				return item.case_status === 'in_progress';
			});

			// Don't try to open a step; UI-Router will already open the one in the URL
			if($stateParams.step_id) return;
			if(!$scope.openedCase) return;

			console.log("[child_viewer.cases] Current case: ", $scope.openedCase, "; finding current step to open");

			var stepToOpen = $scope.openedCase.steps.find(function (step) {
				return ($scope.openedCase.current_step_id === step.id);
			});

			console.log("[child_viewer.cases] Opening current step... ", stepToOpen);

			$scope.openStep(stepToOpen);
		}

		console.log("[core] @ChildCasesCtrl", $scope.child, $scope.openedCase);

		$scope.collapseCase = function (childCase) {
			$scope.openedCase = childCase;
		};

		$scope.isCaseCollapsed = function(childCase) {
			if(!$scope.openedCase) return true;
			return $scope.openedCase.id !== childCase.id;
		};

		$scope.renderStepStatusClass = function(childCase, step) {

			var toggleClass = (step.id === $scope.openStepID) ? ' step-open' : '';

			if(step.is_completed) return 'step-completed' + toggleClass;
			if(childCase.current_step_id === step.id) return 'step-current' + toggleClass;
			return 'step-pending' + toggleClass;
		};

		$scope.canOpenStep = function(step) {
			if(step.is_completed || step.id === $scope.openedCase.current_step_id) {
				return Identity.can('cases.step.' + step.slug)
			}
			return false;
		};

		$scope.canEditStep = function(step) {
			return !step.is_completed;
		};

		$scope.openStep = function(selectedStep) {
			if(!$scope.canOpenStep(selectedStep)) return false;

			$scope.openStepID = selectedStep.id;

			console.log("[child_viewer.cases] Opening step: ", selectedStep);

			$state.go('child_viewer.cases.view_step', {step_type: selectedStep.step_type, step_id: selectedStep.id});
		};

		$scope.canCompleteStep = function(childCase, step) {
			if(step.step_type === 'BuscaAtivaEscolar\\CaseSteps\\Alerta') return false;
			if(!Identity.can('cases.step.' + step.slug)) return false;
			return (step.id === childCase.current_step_id && !step.is_completed && !step.is_pending_assignment);
		};

		$scope.isPendingAssignment = function (step) {
			return !step.is_completed && step.is_pending_assignment;
		};

		$scope.hasNextStep = function(step) {
			if(!step) return false;
			if(step.step_type === 'BuscaAtivaEscolar\\CaseSteps\\Observacao' && step.report_index === 4) return false;
			return true;
		};

		$scope.cancelCase = function() {

			Modals.show(Modals.CaseCancel())
				.then(function (reason) {
					if(!reason) return $q.reject();
					return Children.cancelCase({case_id: $scope.openedCase.id, reason: reason})
				})
				.then(function (res) {
					ngToast.success("A última etapa de observação foi concluída, e o caso foi encerrado!");
					$state.go('child_viewer.cases', {child_id: $scope.child.id}, {reload: true});
				});

		}

		$scope.completeStep = function(step) {

			console.log("[child_viewer.cases] Attempting to complete step: ", step);

			var question = 'Tem certeza que deseja prosseguir para a próxima etapa?';
			var explanation = 'Ao progredir de etapa, a etapa atual será marcada como concluída. Os dados preenchidos serão salvos.';

			if(step.step_type === "BuscaAtivaEscolar\\CaseSteps\\AnaliseTecnica") {
				question = 'Tem certeza que deseja concluir a Análise Técnica?';
				explanation = 'Ao dizer SIM, a Análise Técnica será marcada como concluída e nenhuma informação poderá ser editada. Os dados preenchidos serão salvos.';
			}

			Modals.show(Modals.Confirm(question, explanation)).then(function () {
				return CaseSteps.complete({type: step.step_type, id: step.id}).$promise;
			}).then(function (response) {

				if(response.messages) {
					ngToast.danger("É necessário preencher todos os campos obrigatórios para concluir essa etapa.");
					Utils.displayValidationErrors(response);
					$state.go('child_viewer.cases.view_step', {step_type: step.step_type, step_id: step.id});
					return;
				}

				if(response.status !== "ok") {
					ngToast.danger("Ocorreu um erro ao concluir a etapa! (reason=" + response.reason + ")")
					return;
				}

				if(!response.hasNext) {
					ngToast.success("A última etapa de observação foi concluída, e o caso foi encerrado!");
					$state.go('child_viewer.cases', {child_id: $scope.child.id}, {reload: true});
					return;
				}

				ngToast.success("Etapa concluída! A próxima etapa já está disponível para início");
				$state.go('child_viewer.cases.view_step', {step_type: response.nextStep.step_type, step_id: response.nextStep.id}, {reload: true});

			})
		};

	}

	function ChildCaseStepCtrl($scope, $state, $stateParams, ngToast, Utils, Modals, Alerts, Schools, Cities, Children, Decorators, CaseSteps, StaticData) {
		$scope.Decorators = Decorators;
		$scope.Children = Children;
		$scope.CaseSteps = CaseSteps;
		$scope.static = StaticData;

		$scope.editable = true;
		$scope.showAll = false;
		$scope.showTitle = true;

		$scope.child_id = $scope.$parent.child_id;
		$scope.child = $scope.$parent.child;
		$scope.checkboxes = {};

		$scope.step = {};
		$scope.isMapReady = false;
		$scope.defaultMapZoom = 14;

		function fetchStepData() {
			$scope.step = CaseSteps.find({type: $stateParams.step_type, id: $stateParams.step_id, with: 'fields,case'});
			$scope.step.$promise.then(function (step) {
				$scope.fields = Utils.unpackDateFields(step.fields, dateOnlyFields);
				$scope.case = step.case;
				$scope.$parent.openStepID = $scope.step.id;

				if(step.fields && step.fields.place_coords) {
					step.fields.place_map_center = Object.assign({}, step.fields.place_coords);
				}

			});
		}

		fetchStepData();

		var handicappedCauseIDs = [];
		var dateOnlyFields = ['enrolled_at', 'report_date', 'dob', 'guardian_dob', 'reinsertion_date'];

		console.log("[core] @ChildCaseStepCtrl", $scope.step);

		$scope.saveAndProceed = function() {
			console.log("[child_viewer.cases.step] Attempting to save and complete step: ", $scope.step);

			$scope.save().then(function() {
				$scope.$parent.completeStep($scope.step);
			});
		};

		$scope.isStepOpen = function (stepClassName) {
			if(!$scope.step) return false;
			return $scope.step.step_type === "BuscaAtivaEscolar\\CaseSteps\\" + stepClassName;
		};

		$scope.hasNextStep = function() {
			if(!$scope.step) return false;
			if($scope.step.step_type === 'BuscaAtivaEscolar\\CaseSteps\\Observacao' && $scope.step.report_index === 4) return false;
			return true;
		};

		$scope.canEditStep = function() {
			if(!$scope.step) return false;
			if(!$scope.$parent.openedCase) return false;
			return (!$scope.step.is_completed);
		};

		$scope.acceptAlert = function(childID) {
			Alerts.accept({id: childID}, function() {
				$state.reload();
			})
		};

		$scope.rejectAlert = function(childID) {
			Alerts.reject({id: childID}, function() {
				$state.reload();
			})
		};

		$scope.isHandicapped = function() {
			if(!$scope.step || !$scope.step.fields || !$scope.step.fields.case_cause_ids) return false;

			if(!handicappedCauseIDs || handicappedCauseIDs.length <= 0) {
				handicappedCauseIDs = Utils.extract('id', StaticData.getCaseCauses(), function (item) {
					return (item.is_handicapped === true);
				});
			}

			var currentCauses = $scope.step.fields.case_cause_ids;

			for(var i in currentCauses) {
				if(!currentCauses.hasOwnProperty(i)) continue;
				var cause = currentCauses[i];
				if(handicappedCauseIDs.indexOf(cause) !== -1) return true;
			}

			return false;
		};

		$scope.canCompleteStep = function() {
			if(!$scope.step) return false;
			if(!$scope.$parent.openedCase) return false;
			return ($scope.step.id === $scope.$parent.openedCase.current_step_id && !$scope.step.is_completed && !$scope.step.is_pending_assignment);
		};

		$scope.isPendingAssignment = function () {
			if(!$scope.step) return false;
			return !$scope.step.is_completed && !!$scope.step.is_pending_assignment;
		};

		convertFormatDate = function(date){
			var value = date.toISOString().substring(0, 10);
			var from = value.toString().split("-");
			return (from[2]+"/" +from[1] +"/" +from[0]);
		}

		$scope.fillWithCurrentDate = function (field) {
			$scope.fields[field] = convertFormatDate(new Date);
		};

		function filterOutEmptyFields(data) {
			var filtered = {};

			for(var i in data) {
				if(!data.hasOwnProperty(i)) continue;
				if(data[i] === null) continue;
				if(data[i] === undefined) continue;
				if(("" + data[i]).trim().length <= 0) continue;
				filtered[i] = data[i];
			}

			return filtered;
		}


		$scope.assignUser = function() {

			console.log("[child_viewer.cases.step] Attempting to assign new user for step: ", $scope.step);

			CaseSteps.assignableUsers({type: $scope.step.step_type, id: $scope.step.id}).$promise
				.then(function (res) {
					if(!res.users) return ngToast.danger("Nenhum usuário pode ser atribuído para essa etapa!");
					return Modals.show(Modals.UserPicker('Atribuindo responsabilidade', 'Indique qual usuário deve ficar responsável por essa etapa:', res.users, true))
				})
				.then(function (user) {
					return CaseSteps.assignUser({type: $scope.step.step_type, id: $scope.step.id, user_id: user.id}).$promise;
				}).
				then(function (res) {
					ngToast.success("Usuário atribuído!");
					fetchStepData();
				});

		};

		$scope.isCheckboxChecked = function(field, value) {
			if(!$scope.fields) return false;
			if(!$scope.fields[field]) $scope.fields[field] = [];
			return $scope.fields[field].indexOf(value) !== -1;
		};

		$scope.toggleCheckbox = function (field, value) {
			if(!$scope.fields[field]) $scope.fields[field] = []; // Ensures list exists
			var index = $scope.fields[field].indexOf(value); // Check if in list
			if(index === -1) return $scope.fields[field].push(value); // Add to list
			return $scope.fields[field].splice(index, 1); // Remove from list
		};

		$scope.getCaseCauseIDs = function() {
			if(!$scope.$parent.openedCase) return [];
			return $scope.$parent.openedCase.case_cause_ids;
		};

		$scope.fetchCities = function(query) {
			var data = {name: query, $hide_loading_feedback: true};

			if($scope.fields.place_uf) data.uf = $scope.fields.place_uf;
			if($scope.fields.school_uf) data.uf = $scope.fields.school_uf;

			console.log("[create_alert] Looking for cities: ", data);

			return Cities.search(data).$promise.then(function (res) {
				return res.results;
			});
		};

		$scope.fetchSchools = function(query, filter_by_uf, filter_by_city) {
			var data = {name: query, $hide_loading_feedback: true};

			if(filter_by_uf) data.uf = filter_by_uf;
			if(filter_by_city && filter_by_city.id) data.city_id = filter_by_city.id;

			console.log("[create_alert] Looking for schools: ", data);

			return Schools.search(data).$promise.then(function (res) {
				return res.results;
			});
		};

		$scope.renderSelectedCity = function(city) {
			if(!city) return '';
			return city.uf + ' / ' + city.name;
		};

		$scope.renderSelectedSchool = function(school) {
			if(!school) return '';
			return school.name + ' (' + school.city_name + ' / ' + school.uf + ')';
		};

		function clearAuxiliaryFields(fields) {
			var auxiliaryFields = ['place_lat', 'place_lng', 'place_map_center', 'place_map_geocoded_address'];
			var filtered = {};

			for(var i in fields) {
				if(!fields.hasOwnProperty(i)) continue;
				if(auxiliaryFields.indexOf(i) !== -1) continue;
				filtered[i] = fields[i];
			}

			return filtered;
		}

		function unpackTypeaheadField(data, name, model) {
			if(data[name]) {
				data[name + '_id'] = model.id;
				data[name + '_name'] = model.name;
			}

			return data;
		}

		$scope.save = function() {

			var data = $scope.step.fields;
			data = filterOutEmptyFields(data);
			data = clearAuxiliaryFields(data);
			data = Utils.prepareDateFields(data, dateOnlyFields);

			data = unpackTypeaheadField(data, 'place_city', data.place_city);
			data = unpackTypeaheadField(data, 'school_city', data.school_city);
			data = unpackTypeaheadField(data, 'school', data.school);
			data = unpackTypeaheadField(data, 'school_last', data.school_last);

			data.type = $scope.step.step_type;
			data.id = $scope.step.id;

			console.info("[child_viewer.step_editor] Saving step data: ", data);

			return CaseSteps.save(data).$promise.then(function (response) {
				if(response.messages) {
					return Utils.displayValidationErrors(response);
				}

				if(response.status !== "ok") {
					ngToast.danger("Ocorreu um erro ao salvar os dados da etapa! (status=" + response.status + ", reason=" + response.reason + ")");
					return;
				}

				if(response.updated) {
					fetchStepData(); // Updates data
				}

				ngToast.success("Os campos da etapa foram salvos com sucesso!");
			})
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

			console.log("[core] @ChildCommentsCtrl", $stateParams);

			$scope.refresh();

		});

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

	function ChildViewCtrl($scope, $state, $stateParams, Children, Decorators) {
		if ($state.current.name === "child_viewer") $state.go('.cases');

		$scope.Decorators = Decorators;
		$scope.Children = Children;

		$scope.child_id = $stateParams.child_id;
		$scope.child = Children.find({id: $scope.child_id});

		console.log("[core] @ChildViewCtrl", $scope.child);

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

			$scope.alert = {};

			$scope.fetchCities = function(query) {
				var data = {name: query, $hide_loading_feedback: true};
				if($scope.alert.place_uf) data.uf = $scope.alert.place_uf;

				console.log("[create_alert] Looking for cities: ", data);

				return Cities.search(data).$promise.then(function (res) {
					return res.results;
				});
			};

			$scope.renderSelectedCity = function(city) {
				if(!city) return '';
				return city.uf + ' / ' + city.name;
			};

			$scope.createAlert = function() {

				// TODO: validate fields

				var data = $scope.alert;
				data = Utils.prepareDateFields(data, ['dob']);
				data.place_city_id = data.place_city ? data.place_city.id : null;
				data.place_city_name = data.place_city ? data.place_city.name : null;

				Children.spawnFromAlert(data).$promise.then(function (res) {
					if(res.messages) {
						console.warn("[create_alert] Failed validation: ", res.messages);
						return Utils.displayValidationErrors(res);
					}

					if(!res || !res.child_id) {
						ngToast.danger('Ocorreu um erro ao registrar o alerta!');
						return;
					}

					ngToast.success('Alerta registrado com sucesso!');

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

			$scope.children = {};
			$scope.child = {};
			$scope.causes = {};
			$scope.sort = {};
			$scope.filter = {};

			$scope.getFilteredChildren = function() {
				var filtered = [];

				for(var i in $scope.children.data) {
					if(!$scope.children.data.hasOwnProperty(i)) continue;
					var alert = $scope.children.data[i];

					if($scope.filter.name && alert.name.toLowerCase().indexOf($scope.filter.name.toLowerCase()) === -1) continue;
					if($scope.filter.submitter_name && alert.submitter.name.toLowerCase().indexOf($scope.filter.submitter_name.toLowerCase()) === -1) continue;

					filtered.push(alert);
				}

				return filtered;
			};

			$scope.getAlertCauseName = function() {
				if(!$scope.child) return 'err:no_child_open';
				if(!$scope.child.alert) return 'err:no_alert_data';
				if(!$scope.child.alert.alert_cause_id) return 'err:no_alert_cause_id';
				if(!$scope.causes[$scope.child.alert.alert_cause_id]) return 'err:no_cause_with_id';
				return $scope.causes[$scope.child.alert.alert_cause_id].label;
			};

			$scope.static = StaticData;

			$scope.refresh = function() {
				$scope.child = null;
				$scope.children = Alerts.getPending({sort: $scope.sort});
			};

			$scope.preview = function(child) {
				$scope.child = child;
			};

			$scope.accept = function(child) {
				Alerts.accept({id: child.id}, function() {
					$scope.refresh();
					$scope. child = {};
				});
			};

			$scope.reject = function(child) {
				Alerts.reject({id: child.id}, function() {
					$scope.refresh();
					$scope.child = {};
				});
			};


			Platform.whenReady(function() {
				$scope.causes = StaticData.getAlertCauses()
				$scope.refresh();
			});

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
(function() {
	identify('config', 'http.js');

	angular.module('BuscaAtivaEscolar').config(function ($httpProvider) {
		$httpProvider.interceptors.push('InjectAPIEndpointInterceptor');
		$httpProvider.interceptors.push('TrackPendingRequestsInterceptor');
		$httpProvider.interceptors.push('AddAuthorizationHeadersInterceptor');
		$httpProvider.interceptors.push('HandleExceptionResponsesInterceptor');
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
		console.info("------------------------------");
		console.info(" BUSCA ATIVA ESCOLAR");
		console.info(" Copyright (c) LQDI Digital");
		console.info("------------------------------");
		console.info(" WS ENDPOINT: ", Config.getAPIEndpoint());
		console.info(" STORAGE BUILD PREFIX: ", Config.BUILD_PREFIX);
		console.info("------------------------------");

		$.material.init();

		$rootScope.$on('unauthorized', function() {
			console.log('[event.unauthorized] User unauthorized, redirecting to login...');
			Auth.logout();
			$state.go('login');
		})
	})

})();
(function() {
	identify('config', 'states.js');

	angular.module('BuscaAtivaEscolar')
		.config(function($stateProvider, $locationProvider, $urlRouterProvider) {

			$locationProvider.html5Mode(true);
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
					url: '/settings',
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
				.state('sign_up', {
					url: '/sign_up',
					templateUrl: '/views/sign_up/main.html',
					controller: 'SignUpCtrl',
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

	angular.module('BuscaAtivaEscolar').directive('casesMap', function (moment, $timeout, uiGmapGoogleMapApi, Identity, Platform, Children, Decorators) {

		function init(scope, element, attrs) {

			scope.refresh = function() {
				console.log('[widget.cases_map] Loading data...');

				Children.getMap({}, function(data) {
					scope.coordinates = data.coordinates;
					scope.mapCenter = data.center;
					scope.mapZoom = data.center.zoom;
					scope.mapReady = true;

					console.log("[widget.cases_map] Data loaded: ", data.coordinates, data.center);
				});
			};

			scope.onMarkerClick = function (marker, event, coords) {
				console.log('[widget.cases_map] Marker clicked: ', marker, event, coords);
			};

			scope.isMapReady = function() {
				return scope.mapReady;
			};

			scope.reloadMap = function() {
				scope.mapReady = false;
				$timeout(function() {
					scope.mapReady = true;
				}, 10);
			};

			uiGmapGoogleMapApi.then(function (maps) {
				scope.refresh();
			});

		}

		return {
			link: init,
			scope: true,
			replace: true,
			templateUrl: '/views/components/cases_map.html'
		};
	});

})();
(function() {

	angular.module('BuscaAtivaEscolar').directive('causesChart', function ($timeout, moment, Platform, Reports, Charts) {

		function init(scope, element, attrs) {

			var causesData = {};
			var causesChart = {};
			var causesReady = false;

			var isReady = false;
			var hasEnoughData = false;

			scope.getCausesConfig = getCausesConfig;

			scope.isReady = function() {
				return isReady;
			};

			scope.hasEnoughData = function() {
				return hasEnoughData;
			};

			function fetchCausesData() {
				return Reports.query({
					view: 'linear',
					entity: 'children',
					dimension: 'alert_cause_id',
					filters: {
						case_status: ['in_progress', 'completed', 'interrupted'],
						alert_status: ['accepted']
					}
				}, function (data) {
					causesData = data;
					causesChart = getCausesChart();
					causesReady = true;

					isReady = true;
					hasEnoughData = (
						causesData &&
						causesData.response &&
						!angular.equals({}, causesData.response.report)
					);

					$timeout(function() {
						scope.$broadcast('highchartsng.reflow');
					}, 500);
				});
			}

			function getCausesChart() {
				var report = causesData.response.report;
				var chartName = 'Divisão dos casos por causa de evasão escolar';
				var labels = causesData.labels ? causesData.labels : {};

				return Charts.generateDimensionChart(report, chartName, labels, 'pie');
			}

			function getCausesConfig() {
				if(!causesReady) return;
				return causesChart;
			}

			Platform.whenReady(function () {
				fetchCausesData();
			});
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

				console.log("[components.city_select] Looking for cities: ", data);

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

			var sortModes = [null, 'asc', 'desc'];

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

			}

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

			function fetchTimelineData() {
				var lastMonth = moment().subtract(30, 'days').format('YYYY-MM-DD');
				var today = moment().format('YYYY-MM-DD');

				return Reports.query({
					view: 'time_series',
					entity: 'children',
					dimension: 'child_status',
					filters: {
						date: {from: lastMonth, to: today},
						case_status: ['in_progress', 'completed', 'interrupted'],
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
				var chartName = 'Evolução do status dos casos nos últimos 30 dias';
				var labels = timelineData.labels ? timelineData.labels : {};

				return Charts.generateTimelineChart(report, chartName, labels);

			}

			function getTimelineConfig() {
				if(!timelineReady) return;
				return timelineChart;
			}

			Platform.whenReady(function () {
				fetchTimelineData();
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
(function() {

	angular.module('BuscaAtivaEscolar').directive('metricsCountry', function (moment, Platform, Reports, Charts) {

		function init(scope, element, attrs) {
			scope.stats = {};

			function refreshMetrics() {
				return Reports.getCountryStats(function (data) {
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
			templateUrl: '/views/components/metrics_country.html'
		};
	});

})();
(function() {

	angular.module('BuscaAtivaEscolar').directive('metricsOverview', function (moment, Platform, Reports, Charts) {

		function init(scope, element, attrs) {

			var metrics = {};

			function refreshMetrics() {
				return Reports.query({
					view: 'linear',
					entity: 'children',
					dimension: 'deadline_status',
					filters: {
						case_status: ['in_progress', 'completed', 'interrupted'],
						alert_status: ['accepted']
					}
				}, function (data) {
					metrics = data.response;
				});
			}

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
			templateUrl: '/views/components/metrics_overview.html'
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
(function() {

	angular.module('BuscaAtivaEscolar').directive('myAssignments', function (moment, Identity, Platform, Children, Decorators) {

		function init(scope, element, attrs) {
			scope.Decorators = Decorators;
			scope.children = [];

			var isReady = false;

			scope.refresh = function() {
				console.log("[widget.my_assignments] Loading assignments...");
				isReady = false;

				Children.search({assigned_user_id: Identity.getCurrentUserID()}, function(data) {
					console.log("[widget.my_assignments] Loaded: ", data.results);

					scope.children = data.results;
					isReady = true;
				});
			};

			scope.getChildren = function() {
				return scope.children;
			};

			scope.isReady = function() {
				return isReady;
			};

			scope.hasAssignments = function() {
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
(function() {

	angular.module('BuscaAtivaEscolar').directive('appNavbar', function (Identity, Notifications, Platform, Auth) {

		function init(scope, element, attrs) {
			scope.identity = Identity;
			scope.auth = Auth;
			scope.notifications = Notifications;
			scope.platform = Platform;

			scope.showNotifications = true;

			scope.isHidden = function() {
				return !!Platform.getFlag('HIDE_NAVBAR');
			};

			scope.onMenuToggle = function(isOpen) {
				if(isOpen) Notifications.refresh();
			};

			scope.toggleNotifications = function($event) {
				scope.showNotifications = !scope.showNotifications;

				$event.stopPropagation();
				$event.stopImmediatePropagation();
				$event.preventDefault();

				return false;
			};
		}

		return {
			link: init,
			replace: true,
			templateUrl: '/views/navbar.html'
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
			console.log("[widget.platform_updates] Getting latest commits for repository: ", repo);
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
			console.log("[widget.platform_updates] Parsing repository data...");

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
			return Tenants.getRecentActivity({max: 4}, function (data) {
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
(function() {

	angular.module('BuscaAtivaEscolar').directive('searchableCasesMap', function (moment, $timeout, uiGmapGoogleMapApi, Utils, Identity, Platform, Children, StaticData) {

		function init(scope, element, attrs) {

			scope.ctrl = {
				events: {
					tilesloaded: function(map) {
						scope.ctrl.map = map;
					}
				}
			};
			
			scope.onSearch = function(givenUf, givenCity) {
				console.log("[widget.searchable_cases_map] Searching for: ", givenUf, givenCity);

				var uf = Utils.search(StaticData.getUFs(), function (uf) {
					return (uf.code === givenUf);
				});

				if(uf) {
					scope.lookAt(parseFloat(uf.lat), parseFloat(uf.lng), 6);
				}

			};

			scope.refresh = function() {
				console.log('[widget.searchable_cases_map] Loading data...');

				Children.getMap({}, function(data) {
					scope.coordinates = data.coordinates;
					scope.mapCenter = data.center;
					scope.mapZoom = data.center.zoom;
					scope.mapReady = true;

					console.log("[widget.searchable_cases_map] Data loaded: ", data.coordinates, data.center);
				});
			};

			scope.onMarkerClick = function (marker, event, coords) {
				console.log('[widget.searchable_cases_map] Marker clicked: ', marker, event, coords);
			};

			scope.isMapReady = function() {
				return scope.mapReady;
			};

			scope.reloadMap = function() {
				scope.mapReady = false;
				$timeout(function() {
					scope.mapReady = true;
				}, 10);
			};

			scope.lookAt = function(lat, lng, zoom) {
				console.log("[widget.searchable_cases_map] Look at @ ", lat, lng, zoom, scope.ctrl);

				scope.ctrl.map.panTo({lat: lat, lng: lng});
				scope.ctrl.map.setZoom(zoom);

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

	angular.module('BuscaAtivaEscolar').controller('CreditsCtrl', function ($scope, $rootScope, AppDependencies) {

		console.log("Displaying app dependencies: ", AppDependencies);

		$rootScope.section = 'credits';
		$scope.appDependencies = AppDependencies;

	});

})();
(function() {

	angular.module('BuscaAtivaEscolar').controller('DashboardCtrl', function ($scope, moment, Platform, Identity, StaticData, Reports, Charts) {

		$scope.identity = Identity;
		$scope.static = StaticData;

		$scope.ready = false;

		Platform.whenReady(function() {
			$scope.ready = true;
		})


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
(function() {

	angular.module('BuscaAtivaEscolar').controller('LoginCtrl', function ($scope, $rootScope, $cookies, $state, $location, Modals, Config, Auth, Identity) {

		console.log("[core] @Login");

		$rootScope.section = '';

		$scope.email = '';
		$scope.password = '';
		$scope.isLoading = false;

		$scope.endpoints = {
			allowed: Config.ALLOWED_ENDPOINTS,
			list: Config.API_ENDPOINTS
		};

		if(Identity.isLoggedIn()) {
			$state.go('dashboard');
		}

		function onLoggedIn(session) {

			$scope.isLoading = false;

			console.info("[login_ctrl] Logged in!", session);
			console.info("[login_ctrl] Tenant: ", Identity.getCurrentUser().tenant);

			// Check if user should see tenant first time setup
			if(!Identity.isUserType('coordenador_operacional')) return $state.go('dashboard');
			if(!Identity.hasTenant()) return $state.go('dashboard');
			if(!Identity.getCurrentUser().tenant.is_setup) return $state.go('tenant_setup');

			return $state.go('dashboard');
		}

		function onError(err) {
			console.error('[login_ctrl] Login failed: ', err);
			Modals.show(Modals.Alert('Usuário ou senha incorretos', 'Por favor, verifique os dados informados e tente novamente.'));
			$scope.isLoading = false;
		}

		$scope.setAPIEndpoint = function(endpointID) {
			Config.setEndpoint(endpointID);
			$cookies.put('FDENP_API_ENDPOINT', endpointID);
		};

		$scope.login = function() {
			$scope.isLoading = true;
			Auth.login($scope.email, $scope.password).then(onLoggedIn, onError);
		};

	});

})();
(function() {

	angular.module('BuscaAtivaEscolar').controller('ParameterizeGroupCtrl', function ($scope, $rootScope, MockData, Identity) {

		$rootScope.section = 'settings';
		$scope.identity = Identity;

		$scope.reasons = MockData.alertReasons;

	});

})();
(function() {

	angular.module('BuscaAtivaEscolar').controller('SettingsCtrl', function ($scope, $rootScope, $window, ngToast, MockData, Identity) {

		$rootScope.section = 'settings';
		$scope.identity = Identity;

		$scope.step = 4;
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
(function() {

	angular
		.module('BuscaAtivaEscolar')
		.factory('AppDependencies', function() {
			return [
				["Back-end", "Laravel Framework",           "5.3",      "http://laravel.com", "MIT"],
				["Back-end", "PHP",                         "7.1",      "http://php.net", "PHP License 3.01"],
				["Back-end", "MariaDB",                     "10.0.20",  "http://mariadb.org", "GPLv2"],
				["Back-end", "memcached",                   "1.4.31",   "http://memcached.org", "BSD"],
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
				["Aplicativo", "Apache Cordova",             "6.x",         "https://cordova.apache.org/", "Apache"],
				["Aplicativo", "ngCordova",                  "",         "http://ngcordova.com/", "MIT"],
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
(function() {
	angular.module('BuscaAtivaEscolar').service('Decorators', function () {
		var Child = {
			parents: function(child) {
				return (child.mother_name || '')
					+ ((child.mother_name && child.father_name) ? ' / ' : '')
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
	angular
		.module('BuscaAtivaEscolar')
		.service('AddAuthorizationHeadersInterceptor', function ($q, $rootScope, Identity) {

			this.request = function (config) {

				if(config.headers['X-Require-Auth'] !== 'auth-required') return config;

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

			console.log("[router] to=", toState, toParams);

			if(toState.unauthenticated) return;
			if(Identity.isLoggedIn()) return;

			console.log("[router.guard] Trying to access authenticated state, but currently logged out. Redirecting...");

			event.preventDefault();
			$state.go('login');
		}

	});
})();
(function() {
	angular
		.module('BuscaAtivaEscolar')
		.service('HandleExceptionResponsesInterceptor', function () {

			function handleResponse(response) {

				if(!response) return response;
				if(!response.data) return response;
				if(!response.data.reason) return response;
				if(response.data.reason !== 'exception') return response;

				if(response.data.exception.stack) {
					console.log('[interceptors.api_exception] [debug=on] API error: ', response.data.exception.message);
					console.log('[interceptors.api_exception] [debug=on] Error stack: ', response.data.exception.stack);
					return response;
				}

				console.log('[interceptors.api_exception] [debug=off] API error: ', response.data.exception);

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

			console.log("[modal] case_activity_log_entry");

			$scope.close = function() {
				$uibModalInstance.dismiss(false);
			};

		});

})();
(function() {

	angular
		.module('BuscaAtivaEscolar')
		.controller('CaseCancelModalCtrl', function CaseCancelModalCtrl($scope, $uibModalInstance, StaticData, Language) {

			console.log("[modal] case_cancel");

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
(function() {

	angular
		.module('BuscaAtivaEscolar')
		.controller('CaseRestartModalCtrl', function CaseRestartModalCtrl($scope, $q, $uibModalInstance) {

			console.log("[modal] case_restart");

			$scope.step = 1;
			$scope.reason = "";

			$scope.ok = function() {
				$uibModalInstance.close({response: $scope.reason});
			};

			$scope.cancel = function() {
				$uibModalInstance.dismiss(false);
			};

		});

})();
(function() {

	angular
		.module('BuscaAtivaEscolar')
		.controller('ConfirmModalCtrl', function ConfirmModalCtrl($scope, $q, $uibModalInstance, message, details, canDismiss) {

			console.log("[modal] confirm_modal", message, details, canDismiss);

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
		.controller('FileUploaderModalCtrl', function FileUploaderModalCtrl($scope, $q, $uibModalInstance, Auth, API, StaticData, Upload, uploadUrl, uploadParameters, title, message) {

			console.log("[modal] file_uploader", uploadUrl, uploadParameters, title, message);

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
		.controller('LoginModalCtrl', function LoginModalCtrl($scope, $uibModalInstance, Modals, Identity, Auth, reason, canDismiss) {

			console.log("[modal] login", reason, canDismiss);

			$scope.email = '';
			$scope.password = '';

			$scope.reason = reason;
			$scope.canDismiss = canDismiss;

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
		.controller('PromptModalCtrl', function PromptModalCtrl($scope, $q, $uibModalInstance, question, defaultAnswer, canDismiss) {

			console.log("[modal] prompt_modal", question, canDismiss);

			$scope.question = question;
			$scope.answer = defaultAnswer;

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

			console.log("[modal] user_picker", title, message);

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

	angular.module('BuscaAtivaEscolar')
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
						ngToast.danger("Ocorreu um erro ao solicitar a troca de senha: " + res.reason);
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
(function() {

	angular.module('BuscaAtivaEscolar')
		.config(function($stateProvider) {
			$stateProvider.state('reports', {
				url: '/reports',
				templateUrl: '/views/reports/reports.html',
				controller: 'ReportViewerCtrl'
			})
		})
		.controller('ReportViewerCtrl', function ($scope, $rootScope, moment, Platform, Utils, Cities, StaticData, Reports, Identity, Charts) {

			$scope.identity = Identity;
			$scope.static = StaticData;

			$scope.ready = false;

			$scope.filters = {};
			$scope.entities = {};
			$scope.views = {};
			$scope.totals = {};
			$scope.fields = {};

			$scope.reportData = {};

			$scope.current = {
				entity: 'children',
				dimension: 'cause',
				view: 'chart'
			};

			function onInit() {
				$scope.ready = true;

				var lastWeek = moment().subtract(7, 'days').toDate();
				var today = moment().toDate();

				$scope.filters = {
					//deadline_status: ['normal', 'delayed'],
					period: {from: lastWeek, to: today},
					case_status: ['in_progress', 'cancelled', 'completed', 'interrupted'],
					alert_status: ['accepted'],
					child_status: ['in_school', 'in_observation', 'out_of_school'],
					age: {from: 0, to: 28},
					age_null: true,
					gender: Utils.pluck(StaticData.getGenders(), 'slug'), //['male', 'female', 'undefined'],
					gender_null: true,
					race: Utils.pluck(StaticData.getRaces(), 'slug'), //['male', 'female', 'undefined'],
					race_null: true,
					place_kind: ['rural', 'urban'],
					place_kind_null: true
				};

				$scope.entities = {
					children: {
						id: 'children',
						name: 'Crianças e adolescentes',
						value: 'num_children',
						entity: 'children',
						dimensions: ['child_status', 'step_slug', 'age', 'gender', 'parents_income', 'place_kind', 'work_activity', 'case_cause_ids', 'place_uf', 'place_city_id', 'school_last_id'],
						filters: [
							'date',
							'case_status',
							'child_status',
							'alert_status',
							//'deadline_status', // TODO: implement in backend/searchdoc
							'age',
							'gender',
							//'race',
							//'parents_income',
							//'guardian_schooling',
							//'work_activity',
							'place_kind',
							'step_slug',
							'uf',
							'city',
							'case_cause_ids'
						],
						views: ['chart', 'timeline'] //['map', 'chart', 'timeline', 'list']
					}/*,
					 alerts: {
					 id: 'alerts',
					 name: 'Alertas',
					 value: 'num_alerts',
					 dimensions: ['alert_status', 'deadline_status', 'alert_cause_id'],
					 filters: ['age', 'gender', 'assigned_user', 'uf', 'city', 'alert_status', 'child_status', 'deadline_status'],
					 views: ['map', 'chart', 'timeline', 'list']
					 },
					 users: {
					 id: 'users',
					 name: 'Usuários',
					 value: 'num_assignments',
					 dimensions: ['child_status', 'deadline_status', 'case_step'],
					 filters: ['child_status', 'deadline_status', 'case_step', 'user_group', 'user_type'],
					 views: ['chart', 'timeline', 'list']
					 }*/
				};

				$scope.views = {
					map: {id: 'map', name: 'Mapa', allowsDimension: false, viewMode: 'linear'},
					chart: {id: 'chart', name: 'Gráfico', allowsDimension: true, viewMode: 'linear'},
					timeline: {id: 'timeline', name: 'Linha do tempo', allowsDimension: true, viewMode: 'time_series'},
					//list: {id: 'list', name: 'Lista', allowsDimension: true, viewMode: 'linear'}
				};

				$scope.totals = {
					num_children: 'Número de crianças e adolescentes',
					num_alerts: 'Número de alertas',
					num_assignments: 'Número de casos sob sua responsabilidade'
				};

				$scope.fields = {
					period: 'Período',
					child_status: 'Status da criança',
					deadline_status: 'Status do andamento',
					alert_status: 'Status do alerta',
					step_slug: 'Etapa do caso',
					age: 'Faixa etária',
					gender: 'Sexo',
					parents_income: 'Faixa de renda familiar',
					place_kind: 'Região',
					work_activity: 'Atividade econômica',
					case_cause_ids: 'Causa do Caso',
					alert_cause_id: 'Causa do Alerta',
					user_group: 'Grupo do usuário',
					user_type: 'Tipo do usuário',
					assigned_user: 'Usuário responsável',
					parent_scholarity: 'Escolaridade do responsável',
					place_uf: 'UF',
					place_city_id: 'Município',
					school_last_id: 'Última escola que frequentou',
					city: 'Município',
				};

				$scope.chartConfig = getChartConfig();

				$scope.refresh();
			};

			$scope.refresh = function() {

				// Check if selected view is available in entity
				if($scope.entities[$scope.current.entity].views.indexOf($scope.current.view) === -1) {
					$scope.current.view = $scope.current.entity.views[0];
				}

				// Check if selected dimension is available in entity
				var availableDimensions = $scope.entities[$scope.current.entity].dimensions;
				if(availableDimensions.indexOf($scope.current.dimension) === -1) {
					$scope.current.dimension = availableDimensions[0];
				}

				fetchReportData().then(function (res) {

					if($scope.current.view !== "list") {
						$scope.chartConfig = getChartConfig();
					}

				});

			};

			function fetchReportData() {

				var params = Object.assign({}, $scope.current);
				params.view = $scope.views[$scope.current.view].viewMode;
				params.filters = $scope.filters;

				params.filters.place_city_id = (params.filters.place_city) ? params.filters.place_city.id : null;

				if(params.filters.period.from || params.filters.period.to) {
					params.filters.date = {
						from: (params.filters.period.from) ? moment(params.filters.period.from).format('YYYY-MM-DD') : null,
						to: (params.filters.period.to) ? moment(params.filters.period.to).format('YYYY-MM-DD') : null,
					};
				}

				$scope.reportData = Reports.query(params);

				return $scope.reportData.$promise;
			}

			$scope.generateRandomNumber = function(min, max) {
				return min + Math.floor( Math.random() * (max - min));
			};

			$scope.canFilterBy = function(filter_id) {
				if(!$scope.ready) return false;

				if(filter_id === 'date') {
					return $scope.current.view === 'timeline';
				}

				return $scope.entities[$scope.current.entity].filters.indexOf(filter_id) !== -1;
			};

			$scope.fetchCities = function(query) {
				var data = {name: query, $hide_loading_feedback: true};
				if($scope.filters.place_uf) data.uf = $scope.filters.place_uf;

				console.log("[create_alert] Looking for cities: ", data);

				return Cities.search(data).$promise.then(function (res) {
					return res.results;
				});
			};

			$scope.renderSelectedCity = function(city) {
				if(!city) return '';
				return city.uf + ' / ' + city.name;
			};

			function getChartConfig() {
				if($scope.current.view === "chart") return generateDimensionChart($scope.current.entity, $scope.current.dimension);
				if($scope.current.view === "timeline") return generateTimelineChart($scope.current.entity, $scope.current.dimension);
				//if($scope.current.view.id == "map") return MockData.brazilMapSettings;
				return {};
			}

			function generateDimensionChart(entity, dimension) {

				if(!$scope.ready) return false;

				if(!$scope.reportData) return;
				if(!$scope.reportData.$resolved) return;
				if(!$scope.reportData.response) return;
				if(!$scope.reportData.response.report) return;

				var report = $scope.reportData.response.report;
				var seriesName = $scope.totals[$scope.entities[entity].value];
				var labels = $scope.reportData.labels ? $scope.reportData.labels : {};

				return Charts.generateDimensionChart(report, seriesName, labels);
			}

			function generateTimelineChart(entity, dimension) {

				if(!$scope.ready) return false;

				if(!$scope.reportData) return;
				if(!$scope.reportData.$resolved) return;
				if(!$scope.reportData.response) return;
				if(!$scope.reportData.response.report) return;

				var report = $scope.reportData.response.report;
				var chartName = $scope.totals[$scope.entities[entity].value];
				var labels = $scope.reportData.labels ? $scope.reportData.labels : {};

				return Charts.generateTimelineChart(report, chartName, labels);

			}

			Platform.whenReady(onInit); // Must be the last call, since $scope functions are not hoisted to the top

		});

})();
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
				reject: {url: API.getURI('alerts/:id/reject'), method: 'POST', headers: headers},
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

			let headers = API.REQUIRE_AUTH;

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
				find: {method: 'GET', headers: headers, params: {with: 'currentStep'}},
				update: {method: 'POST', headers: headers},
				search: {url: API.getURI('children/search'), method: 'POST', isArray: false, headers: headers},
				getComments: {url: API.getURI('children/:id/comments'), isArray: false, method: 'GET', headers: headers},
				getMap: {url: API.getURI('children/map'), isArray: false, method: 'GET', headers: headers},
				getAttachments: {url: API.getURI('children/:id/attachments'), isArray: false, method: 'GET', headers: headers},
				getActivity: {url: API.getURI('children/:id/activity'), isArray: false, method: 'GET', headers: headers},
				postComment: {url: API.getURI('children/:id/comments'), method: 'POST', headers: headers},
				spawnFromAlert: {method: 'POST', headers: headers},
				cancelCase: {url: API.getURI('cases/:id/cancel'), params: {id: '@case_id'}, method: 'POST', headers: headers}
			});

			return Children;
		});
})();
(function() {
	angular
		.module('BuscaAtivaEscolar')
		.factory('Cities', function Cities(API, Identity, $resource) {

			let headers = {};

			return $resource(API.getURI('cities/:id'), {id: '@id'}, {
				find: {method: 'GET', headers: headers},
				search: {url: API.getURI('cities/search'), method: 'POST', headers: headers},
				checkIfAvailable: {url: API.getURI('cities/check_availability'), method: 'POST', headers: headers},
			});

		});
})();
(function() {
	angular
		.module('BuscaAtivaEscolar')
		.factory('Groups', function Groups(API, $resource) {

			let headers = API.REQUIRE_AUTH;

			return $resource(API.getURI('groups/:id'), {id: '@id', with: '@with'}, {
				find: {method: 'GET', headers: headers},
				updateSettings: {method: 'PUT', url: API.getURI('groups/:id/settings'), headers: headers},
				create: {method: 'POST', headers: headers},
				delete: {method: 'DELETE', headers: headers},
				update: {method: 'PUT', headers: headers},
			});

		});
})();
(function() {
	angular
		.module('BuscaAtivaEscolar')
		.factory('PasswordReset', function Users(API, $resource) {

			let headers = {};

			return $resource(API.getURI('password_reset/:id'), {id: '@id', with: '@with'}, {
				begin: {url: API.getURI('password_reset/begin'), method: 'POST', headers: headers},
				complete: {url: API.getURI('password_reset/complete'), method: 'POST', headers: headers}
			});

		});
})();
(function() {
	angular
		.module('BuscaAtivaEscolar')
		.factory('Reports', function Reports(API, Identity, $resource) {

			var headers = API.REQUIRE_AUTH;

			return $resource(API.getURI('reports/:entity'), {entity: '@entity'}, {
				query: {method: 'POST', headers: headers},
				getCountryStats: {method: 'GET', url: API.getURI('reports/country_stats'), headers: headers},
			});
		});
})();
(function() {
	angular
		.module('BuscaAtivaEscolar')
		.factory('Schools', function Schools(API, Identity, $resource) {

			let headers = API.REQUIRE_AUTH;

			return $resource(API.getURI('schools/:id'), {id: '@id'}, {
				find: {method: 'GET', headers: headers},
				search: {url: API.getURI('schools/search'), method: 'POST', headers: headers},
			});

		});
})();
(function() {
	angular
		.module('BuscaAtivaEscolar')
		.factory('SignUps', function SignUps(API, Identity, $resource) {

			let authHeaders = API.REQUIRE_AUTH;
			let headers = {};

			return $resource(API.getURI('signups/:id'), {id: '@id'}, {
				find: {method: 'GET', headers: authHeaders},

				getPending: {url: API.getURI('signups/pending'), method: 'POST', isArray: false, headers: authHeaders},
				approve: {url: API.getURI('signups/:id/approve'), method: 'POST', headers: authHeaders},
				reject: {url: API.getURI('signups/:id/reject'), method: 'POST', headers: authHeaders},

				resendNotification: {url: API.getURI('signups/:id/resend_notification'), method: 'POST', headers: authHeaders},
				completeSetup: {url: API.getURI('signups/complete_setup'), method: 'POST', headers: authHeaders},

				register: {url: API.getURI('signups/register'), method: 'POST', headers: headers},
				getViaToken: {url: API.getURI('signups/via_token/:id'), method: 'GET', headers: headers},
				complete: {url: API.getURI('signups/:id/complete'), method: 'POST', headers: headers},
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
				console.log("[platform.static_data] Downloading latest static data definitions...");
				$promise = $http.get(dataFile).then(onFetch);
			}

			function refresh() {
				// TODO: validate timestamp?
				fetchLatestVersion();
			}

			function onFetch(res) {
				console.log("[platform.static_data] Downloaded! Version=", res.data.version, "Timestamp=", res.data.timestamp, "Data=", res.data.data);
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

			function getUserTypes() { return (data.UserType) ? data.UserType : []; }
			function getAlertCauses() { return (data.AlertCause) ? data.AlertCause : []; }
			function getCaseCauses() { return (data.CaseCause) ? data.CaseCause : []; }
			function getGenders() { return (data.Gender) ? data.Gender : []; }
			function getHandicappedRejectReasons() { return (data.HandicappedRejectReason) ? data.HandicappedRejectReason : []; }
			function getIncomeRanges() { return (data.IncomeRange) ? data.IncomeRange : []; }
			function getRaces() { return (data.Race) ? data.Race : []; }
			function getSchoolGrades() { return (data.SchoolGrade) ? data.SchoolGrade : []; }
			function getSchoolingLevels() { return (data.SchoolingLevel) ? data.SchoolingLevel : []; }
			function getWorkActivities() { return (data.WorkActivity) ? data.WorkActivity : []; }
			function getCaseStepSlugs() { return (data.CaseStepSlugs) ? data.CaseStepSlugs : []; }
			function getUFs() { return (data.UFs) ? data.UFs : []; }
			function getRegions() { return (data.Regions) ? data.Regions : []; }
			function getAPIEndpoints() { return (data.APIEndpoints) ? data.APIEndpoints : []; }
			function getCaseCancelReasons() { return (data.CaseCancelReasons) ? data.CaseCancelReasons : []; }
			function getAllowedMimeTypes() { return (data.Config) ? data.Config.uploads.allowed_mime_types: []; }
			function getPermissions() { return (data.Permissions) ? data.Permissions : {}; }

			return {
				fetchLatestVersion: fetchLatestVersion,
				refresh: refresh,
				getUserTypes: getUserTypes,
				getAlertCauses: getAlertCauses,
				getCaseCauses: getCaseCauses,
				getGenders: getGenders,
				getHandicappedRejectReasons: getHandicappedRejectReasons,
				getIncomeRanges: getIncomeRanges,
				getRaces: getRaces,
				getSchoolGrades: getSchoolGrades,
				getSchoolingLevels: getSchoolingLevels,
				getWorkActivities: getWorkActivities,
				getCaseStepSlugs: getCaseStepSlugs,
				getAllowedMimeTypes: getAllowedMimeTypes,
				getUFs: getUFs,
				getRegions: getRegions,
				getAPIEndpoints: getAPIEndpoints,
				getCaseCancelReasons: getCaseCancelReasons,
				isReady: isReady,
				getNumChains: getNumChains,
				getDataFile: getDataFile,
				getPermissions: getPermissions,
			};

		})
		.run(function (StaticData) {
			StaticData.refresh();
		});
})();
(function() {
	angular
		.module('BuscaAtivaEscolar')
		.factory('Tenants', function Tenants(API, Identity, $resource) {

			let authHeaders = API.REQUIRE_AUTH;
			let headers = {};

			return $resource(API.getURI('tenants/:id'), {id: '@id'}, {
				all: {url: API.getURI('tenants/all'), method: 'POST', headers: authHeaders, params: {'with': 'city,political_admin,operational_admin'}},
				getSettings: {url: API.getURI('settings/tenant'), method: 'GET', headers: authHeaders},
				updateSettings: {url: API.getURI('settings/tenant'), method: 'PUT', headers: authHeaders},
				getRecentActivity: {url: API.getURI('tenants/recent_activity'), method: 'GET', headers: authHeaders},
				find: {method: 'GET', headers: headers}
			});

		});
})();
(function() {
	angular
		.module('BuscaAtivaEscolar')
		.factory('UserNotifications', function UserNotifications(API, Identity, $resource) {

			let authHeaders = API.REQUIRE_AUTH;

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

			let authHeaders = API.REQUIRE_AUTH;

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

			let headers = API.REQUIRE_AUTH;

			return $resource(API.getURI('users/:id'), {id: '@id', with: '@with'}, {
				myself: {url: API.getURI('users/myself'), method: 'GET', headers: headers},
				find: {method: 'GET', headers: headers},
				create: {method: 'POST', headers: headers},
				update: {method: 'PUT', headers: headers},
				search: {url: API.getURI('users/search'), method: 'POST', isArray: false, headers: headers},
				suspend: {method: 'DELETE', headers: headers},
				restore: {url: API.getURI('users/:id/restore'), method: 'POST', headers: headers},
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

			const REQUIRE_AUTH = {'X-Require-Auth': 'auth-required'};

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

		});
})();
(function() {
	angular
		.module('BuscaAtivaEscolar')
		.service('Auth', function Auth($q, $rootScope, $localStorage, $http, $resource, $state, Modals, API, Identity, Config) {

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

				// Isn't even logged in
				if(!Identity.isLoggedIn()) return requireLogin('Você precisa fazer login para realizar essa ação!');

				// Check if session is valid
				if(!$localStorage.session.token || !$localStorage.session.user_id) return $q.go('login');

				// Has valid token
				if(!isTokenExpired()) return $q.resolve($localStorage.session.token);

				console.log("[auth::token.provide] Token expired! Refreshing...");

				// Is logged in, but both access and refresh token are expired
				if(isRefreshExpired()) {
					console.log("[auth::token.provide] Refresh token also expired! Logging out...");
					return requireLogin('Sua sessão expirou! Por favor, entre seus dados novamente para continuar.');
				}

				// Is logged in, access token expired but refresh token still valid
				return self.refresh().then(function (session) {
					console.log("[auth::token.provide] Refreshed, new tokens: ", session);
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

				if(response.status !== 200) {
					console.log("[auth::login] Rejecting Auth response! Status= ", response.status);
					return $q.reject(response.data);
				}

				if(!response.data || !response.data.token) {
					throw new Error("invalid_token_response");
				}

				$localStorage.session.token = response.data.token;
				$localStorage.session.token_expires_at = (new Date()).getTime() + (Config.TOKEN_EXPIRES_IN * 1000);
				$localStorage.session.refresh_expires_at = (new Date()).getTime() + (Config.REFRESH_EXPIRES_IN * 1000);

				// Auth.refresh doesn't return user/user_id, so we can't always set it
				if(response.data.user) {
					Identity.setCurrentUser(response.data.user);
					$localStorage.session.user_id = response.data.user.id;
				}

				validateSessionIntegrity();

				$rootScope.$broadcast('auth.logged_in');

				return $localStorage.session;
			}

			function validateSessionIntegrity() {
				if(!$localStorage.session || !$localStorage.session.user_id || !$localStorage.session.token) {
					throw new Error("invalid_session_integrity");
				}
			}

			function handleAuthError(response) {

				console.error("[auth::login] API error: ", response);

				if(!response || !response.status || !API.isUseableError(response.status)) {
					console.warn("[auth::login] Error code ", response.status, " not in list of useable errors: ", useableErrors);
					$rootScope.$broadcast('auth.error', response);
				}

				throw (response.data) ? response.data : response;
			}

			this.provideToken = provideToken;
			this.requireLogin = requireLogin;
			this.isTokenExpired = isTokenExpired;
			this.isRefreshExpired = isRefreshExpired;

			this.isLoggedIn = function() {
				return Identity.isLoggedIn();
			};

			$rootScope.$on('identity.disconnect', this.logout);

			this.logout = function() {
				console.log('[auth] Logging out...');

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

			this.login = function(email, password) {

				let tokenRequest = {
					grant_type: 'login',
					email: email,
					password: password
				};

				let options = {
					accept: 'application/json',
				};

				return $http
					.post(API.getTokenURI(), tokenRequest, options)
					.then(handleAuthResponse, handleAuthError);
			};

			this.refresh = function() {

				let tokenRequest = {
					grant_type: 'refresh',
					token: $localStorage.session.token
				};

				let options = {
					accept: 'application/json',
				};

				return $http
					.post(API.getTokenURI(), tokenRequest, options)
					.then(handleAuthResponse, handleAuthError);
			};

		})
		.run(function (Identity, Users, Auth) {
			Identity.setTokenProvider(Auth.provideToken);
			Identity.setUserProvider(function(user_id, callback) {
				if(!user_id) return;

				var user = Users.myself({with: 'tenant'});
				user.$promise.then(callback);

				return user;
			});

			Identity.setup();
		})

})();
(function() {

	var app = angular.module('BuscaAtivaEscolar');

	app.service('Charts', function Charts(Utils) {

		function generateDimensionChart(report, seriesName, labels, chartType, yAxisLabel, valueSuffix) {

			console.log("[charts] Generating dimension chart: ", seriesName, report);

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
				tooltip: {
					valueSuffix: ' ' + valueSuffix
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
							enabled: false,
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
						id: Utils.generateRandomID(),
						colorByPoint: true,
						name: seriesName,
						data: data
					}
				]
			};
		}

		function generateTimelineChart(report, chartName, labels) {

			console.log("[charts] Generating timeline chart: ", chartName, report);

			if(!report || !chartName || !labels) return;

			var series = [];
			var categories = [];
			var data = {};
			var dates = Object.keys(report);

			// Translates ￿date -> metric to metric -> date; prepares list of categories
			for(var date in report) {

				if(!report.hasOwnProperty(date)) continue;
				if(categories.indexOf(date) === -1) categories.push(date);

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
					data: metricData
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
				loading: false
			};
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
			console.info("[core.identity] Setting up identity service...");
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
				console.log("[core.identity] No identity found in session, user is logged out");
				$rootScope.$broadcast('Identity.ready');
				return;
			}

			console.log("[core.identity] Refreshing current identity details...");

			$localStorage.identity.current_user = userProvider($localStorage.session.user_id, function(details) {
				console.log("[core.identity] Identity details ready: ", details);
				$rootScope.$broadcast('Identity.ready');
			})
		}

		function getCurrentUser() {
			return ($localStorage.identity.current_user && $localStorage.identity.current_user.id)
				? $localStorage.identity.current_user
				: {};
		}

		function getCurrentUserID() {
			return ($localStorage.identity.current_user && $localStorage.identity.current_user.id)
				? $localStorage.identity.current_user.id
				: null;
		};

		function setCurrentUser(user) {
			if(!user) clearSession();

			$rootScope.$broadcast('identity.connected', {user: user});

			console.log("[identity] Connected user: ", user);

			$localStorage.identity.is_logged_in = true;
			$localStorage.identity.current_user = user;

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

		function disconnect() {
			console.log('[identity] Disconnecting identity...');

			clearSession();

			$rootScope.$broadcast('identity.disconnect');
			$location.path('/login');
		}

		function clearSession() {
			console.log("[identity] Clearing current session");

			Object.assign($localStorage, {
				identity: {
					is_logged_in: false,
					current_user: {},
				}
			});
		}

		return {
			getCurrentUser: getCurrentUser,
			getCurrentUserID: getCurrentUserID,
			setCurrentUser: setCurrentUser,
			getType: getType,
			can: can,
			isLoggedIn: isLoggedIn,
			refresh: refreshIdentity,
			clearSession: clearSession,
			setup: setup,
			isUserType: isUserType,
			hasTenant: hasTenant,
			setTokenProvider: setTokenProvider,
			setUserProvider: setUserProvider,
			provideToken: provideToken,
			disconnect: disconnect
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
			console.log("[platform.language] Setting up language service...");
			loadFromAPI();
		}

		function loadFromAPI() {
			console.log("[platform.language] Loading language file...");
			$promise = $http.get(langFile).then(onDataLoaded);
		}

		function onDataLoaded(res) {
			if(!res.data || !res.data.database) {
				console.error("[platform.language] Failed to load language file: ", res);
				return;
			}

			database = res.data.database;

			console.log("[platform.language] Language file loaded! ", Object.keys(database).length, " strings available: ", database);

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
			{id: 2, name: 'Técnico Verificador'},
			{id: 3, name: 'Supervisor Institucional'},
			{id: 4, name: 'Coordenador Operacional'}
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
(function() {

	angular
		.module('BuscaAtivaEscolar')
		.factory('Modals', function($q, $uibModal) {

			return {

				show: function(params) {

					console.log('[modals] Show modal: ', params);

					var def = $q.defer();

					var instance = $uibModal.open(params);

					instance.result.then(function (data) {
						def.resolve(data.response);
					}, function (data) {
						def.reject(data);
					});

					return def.promise;
				},


				Alert: function(message, details) {
					return {
						templateUrl: '/views/modals/alert.html',
						controller: 'AlertModalCtrl',
						size: 'sm',
						resolve: {
							message: function() { return message; },
							details: function() { return details; }
						}
					};
				},

				Confirm: function(message, details, canDismiss) {
					var params = {
						templateUrl: '/views/modals/confirm.html',
						controller: 'ConfirmModalCtrl',
						size: 'sm',
						resolve: {
							message: function() { return message; },
							details: function() { return details; },
							canDismiss: function() { return canDismiss; }
						}
					};

					if (!canDismiss) {
						params.keyboard = false;
						params.backdrop = 'static';
					}

					return params;
				},

				Prompt: function(question, defaultAnswer, canDismiss) {
					var params = {
						templateUrl: '/views/modals/prompt.html',
						controller: 'PromptModalCtrl',
						size: 'md',
						resolve: {
							question: function() { return question; },
							defaultAnswer: function() { return defaultAnswer; },
							canDismiss: function() { return canDismiss; }
						}
					};

					if (!canDismiss) {
						params.keyboard = false;
						params.backdrop = 'static';
					}

					return params;
				},

				Login: function(reason, canDismiss) {
					var params = {
						templateUrl: '/views/modals/login.html',
						controller: 'LoginModalCtrl',
						size: 'md',
						resolve: {
							reason: function() { return reason; },
							canDismiss: function() { return canDismiss; }
						}
					};

					if (!canDismiss) {
						params.keyboard = false;
						params.backdrop = 'static';
					}

					return params;
				},

				UserPicker: function(title, message, users, canDismiss, noUsersMessage) {
					var params = {
						templateUrl: '/views/modals/user_picker.html',
						controller: 'UserPickerModalCtrl',
						size: 'md',
						resolve: {
							title: function() { return title; },
							message: function() { return message; },
							noUsersMessage: function() { return noUsersMessage; },
							users: function() { return users; },
							canDismiss: function() { return canDismiss; }
						}
					};

					if (!canDismiss) {
						params.keyboard = false;
						params.backdrop = 'static';
					}

					return params;
				},

				CaseCancel: function() {
					return {
						templateUrl: '/views/modals/case_cancel.html',
						controller: 'CaseCancelModalCtrl',
						size: 'md'
					};
				},

				FileUploader: function(title, message, uploadUrl, uploadParameters) {
					return {
						templateUrl: '/views/modals/file_uploader.html',
						controller: 'FileUploaderModalCtrl',
						size: 'md',
						resolve: {
							title: function() { return title; },
							message: function() { return message; },
							uploadUrl: function() { return uploadUrl; },
							uploadParameters: function() { return uploadParameters; },
						}
					};
				},

				CaseRestart: function() {
					var params = {
						templateUrl: '/views/modals/case_restart.html',
						controller: 'CaseRestartModalCtrl',
						size: 'md',
						resolve: {

						}
					};

					return params;
				},

				CaseActivityLogEntry: function() {
					var params = {
						templateUrl: '/views/modals/case_activity_log_entry.html',
						controller: 'CaseActivityLogEntryCtrl',
						size: 'md',
						resolve: {

						}
					};

					//if (!canDismiss) {
						//params.keyboard = false;
						//params.backdrop = 'static';
					//}

					return params;
				}

			}
		});
})();
(function() {

	angular.module('BuscaAtivaEscolar')
		.service('Notifications', function ($interval, $location, $rootScope, ngToast, Identity, Config, Platform, UserNotifications) {

			var notifications = [];
			var seenNotifications = [];
			var isBusy = false;

			function refresh(isFirstRefresh) {

				if(!Identity.isLoggedIn()) return;

				isBusy = true;

				UserNotifications.getUnread({$hide_loading_feedback: true}, function (res) {
					notifications = res.data;
					isBusy = false;
					emitToastsOnNewNotifications(isFirstRefresh);
				});
			}

			function setup() {
				refresh(true);

				$interval(checkForNewNotifications, Config.NOTIFICATIONS_REFRESH_INTERVAL);

				$rootScope.$on('auth.logged_in', function() {
					notifications = [];
					seenNotifications = [];

					refresh(true);
				});

				$rootScope.$on('auth.logged_out', function() {
					notifications = [];
					seenNotifications = [];
				});
			}

			function checkForNewNotifications() {
				refresh(false);
			}

			function emitToastsOnNewNotifications(isFirstRefresh) {
				for(var i in notifications) {
					if(!notifications.hasOwnProperty(i)) continue;
					if(seenNotifications.indexOf(notifications[i].id) !== -1) continue;

					seenNotifications.push(notifications[i].id);

					if(isFirstRefresh) continue;

					console.info("[notifications.new] ", notifications[i]);

					ngToast.create({
						className: notifications[i].data.type || 'info',
						content: notifications[i].data.title
					})
				}

				if(isFirstRefresh) {
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
				if(!notification) return false;
				UserNotifications.markAsRead({id: notification.id}, function() {
					refresh();
				});
			}

			function open(notification) {
				if(!notification) return false;
				if(!notification.open_url) return false;

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

				console.log('[platform.service_registry] Setting up service registry...');

				for(var i in servicesRequired) {
					if(!servicesRequired.hasOwnProperty(i)) continue;

					console.log("\tAwait for service: ", servicesRequired[i]);

					$rootScope.$on(servicesRequired[i] + '.ready', function(event) {
						onServiceReady(event.name.split('.').shift());
					})
				}

				$rootScope.$on('$stateChangeStart', clearRegisteredCallbacks);
				$rootScope.$on('$stateChangeSuccess', checkIfAllServicesReady);
				$rootScope.$on('Platform.ready', fireRegisteredCallbacks);
			}

			function setFlag(flag, value) {
				console.log('[platform.flags] Set flag: ', flag, '->', value);
				flags[flag] = value;
			}

			function getFlag(flag) {
				return flags[flag];
			}

			function onServiceReady(service) {
				console.log('[platform.service_registry] Service is ready: ' + service);

				if(servicesReady.indexOf(service) === -1) {
					servicesReady.push(service);
				}

				checkIfAllServicesReady();
			}

			function clearRegisteredCallbacks() {
				console.log('[platform.service_registry] Cleared callbacks');
				whenReadyCallbacks = [];
			}

			function checkIfAllServicesReady() {
				if(servicesReady.length < servicesRequired.length) return;
				allReady = true;

				console.log("[platform.service_registry] All services ready!");

				$rootScope.$broadcast('Platform.ready');
			}

			function fireRegisteredCallbacks() {
				console.log('[platform.service_registry] Firing registered callbacks: ', whenReadyCallbacks);
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

	var app = angular.module('BuscaAtivaEscolar');

	app
		.run(function() {
			Array.prototype.shuffle = function() {
				var i = this.length, j, temp;
				if ( i == 0 ) return this;
				while ( --i ) {
					j = Math.floor( Math.random() * ( i + 1 ) );
					temp = this[i];
					this[i] = this[j];
					this[j] = temp;
				}
				return this;
			};

			Array.prototype.clone = function() {
				return this.slice(0);
			};

		})
		.filter('orderObjectBy', function() {
			return function(items, field, reverse) {
				var filtered = [];

				angular.forEach(items, function(item) {
					filtered.push(item);
				});

				filtered.sort(function (a, b) {
					return (a[field] > b[field] ? 1 : -1);
				});

				if(reverse) filtered.reverse();

				return filtered;
			};
		})
		.factory('Utils', function(ngToast) {

			function generateRandomID() {
				return 'rand-' + (new Date()).getTime() + '-' + Math.round(Math.random() * 10000);
			}

			function convertISOtoBRDate(iso_date) {
				if(!iso_date) return '';
				return iso_date.split('-').reverse().join('/');
			}

			function convertBRtoISODate(br_date) {
				if(!br_date) return '';
				return br_date.split('/').reverse().join('-');
			}

			function prepareDateFields(data, dateOnlyFields) {
				for(var i in data) {
					if(!data.hasOwnProperty(i)) continue;
					if(dateOnlyFields.indexOf(i) === -1) continue;

					data[i] = stripTimeFromTimestamp(data[i]);
				}

				return data;
			}

			function prepareCityFields(data, cityFields) {
				for(var i in data) {
					if(!data.hasOwnProperty(i)) continue;
					if(cityFields.indexOf(i) === -1) continue;

					data[i + '_id'] = data[i] ? data[i].id : null;
					data[i + '_name'] = data[i] ? data[i].name : null;
				}

				return data;
			}

			function unpackDateFields(data, dateOnlyFields) {
				for(var i in data) {
					if(!data.hasOwnProperty(i)) continue;
					if(dateOnlyFields.indexOf(i) === -1) continue;

					data[i] = new Date(data[i] + " 00:00:00");
				}

				return data;
			}

			function stripTimeFromTimestamp(timestamp) {
				if(timestamp instanceof Date) {
					if(isNaN(timestamp.getTime())) return null;
					timestamp = timestamp.toISOString();
				}
				return ("" + timestamp).substring(0, 10);
			}

			function displayValidationErrors(response) {
				if(!response || !response.messages) return false;

				for(var i in response.messages) {
					if(!response.messages.hasOwnProperty(i)) continue;
					ngToast.danger(response.messages[i])
				}

				return true;
			}

			function filter(obj, predicate) {
				if(obj.constructor === Array) return obj.filter(predicate);

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

				for(var i in filtered) {
					if(!filtered.hasOwnProperty(i)) continue;
					result.push(filtered[i][field]);
				}

				return result;
			}

			function pluck(collection, value_column, key_column) {
				var hasKeyColumn = !!key_column;
				var plucked = (hasKeyColumn) ? {} : [];

				for(var i in collection) {
					if(!collection.hasOwnProperty(i)) continue;

					var value = collection[i][value_column] ? collection[i][value_column] : null;

					if(!hasKeyColumn) {
						plucked.push(value);
						continue;
					}

					var key = collection[i][key_column] ? collection[i][key_column] : i;
					plucked[key] = value;

				}

				return plucked;
			}

			function search(object, callback) {
				for(var i in object) {
					if(!object.hasOwnProperty(i)) continue;
					if(callback(object[i])) return object[i];
				}

				return false;
			}

			function validateFields(data, requiredFields) {
				var invalid = [];

				for(var i in requiredFields) {
					if(!requiredFields.hasOwnProperty(i)) continue;
					if(data[requiredFields[i]]) continue;

					invalid.push(requiredFields[i]);
				}

				return invalid;
			}

			function isValid(data, requiredFields, fieldNames, message) {
				var invalidFields = validateFields(data, requiredFields);

				if(invalidFields.length <= 0) return true;

				message += invalidFields
					.map(function (field) {
						return fieldNames[field] || field;
					})
					.join(", ");

				ngToast.danger(message);

				return false;
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
				isValid: isValid,
				filter: filter,
				extract: extract,
				pluck: pluck,
				search: search,
			};
		})
		.directive('stringToNumber', function() {
			return {
				require: 'ngModel',
				link: function(scope, element, attrs, ngModel) {
					ngModel.$parsers.push(function(value) {
						return '' + value;
					});
					ngModel.$formatters.push(function(value) {
						return parseFloat(value);
					});
				}
			};
		})
		.filter('parseDate', function() {
			return function(input) {
				return new Date(input);
			};
		});

})();

function identify(namespace, file) {
	console.log("[core.load] ", namespace, file);
}
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

				var promises = [];

				for(var i in $scope.groups) {
					if(!$scope.groups.hasOwnProperty(i)) continue;
					console.log('\t[manage_case_workflow.save] Update group: ', $scope.groups[i]);
					promises.push( Groups.updateSettings($scope.groups[i]).$promise );
				}

				console.log('\t[manage_case_workflow.save] Update tenant: ', $scope.settings);
				promises.push( Tenants.updateSettings($scope.settings).$promise );

				$q.all(promises).then(
					function (res) {
						ngToast.success('Configurações salvas com sucesso!');
						console.log('[manage_case_workflow.save] Saved! ', res);
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
						console.log('[manage_deadlines.save] Saved! ', res);
						ngToast.success('Configurações salvas com sucesso!');
						$scope.refresh();
					},
					function (err) {
						console.error('[manage_deadlines.save] Error: ', err);
						ngToast.danger('Ocorreu um erro ao atualizar as configurações');
					}
				);

			};

			$scope.refresh = function() {
				Tenants.getSettings(function (res) {
					console.log('[manage_deadlines] Current settings: ', res);
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
						console.log("\t [groups.save] REMOVED, DELETE-> Group #" + i + ': ', group);
						continue;
					}

					if(group.is_creating) {
						promises.push(Groups.create({name: group.name}).$promise);
						console.log("\t [groups.save] NEW, CREATE-> Group #" + i + ': ', group);
						continue;
					}

					if($scope.groupsEdit['group_' + i] && !$scope.groupsEdit['group_' + i].$pristine) {
						promises.push(Groups.update({id: group.id, name: group.name}).$promise);
						console.log("\t [groups.save] MODIFIED, UPDATE -> Group #" + i + ': ', group);
						continue;
					}

					console.log("\t [groups.save] PRISTINE, NOOP -> Group #" + i + ': ', group);

				}

				$q.all(promises).then(function(res) {
					console.info('[groups.save] Saved! ', res);
					ngToast.success('Grupos alterados com sucesso!')
					$scope.refresh();
				}, function (err) {
					console.error('[groups.save] Error: ', err);
					ngToast.danger('Ocorreu um erro ao salvar os grupos!')
					$scope.refresh();
				})
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
			};


			$scope.refresh = function() {
				Groups.find(function(res) {
					$scope.groups = res.data;
				});
			};

			Platform.whenReady(function() {
				$scope.refresh();
			})

		});

})();
(function() {

	angular.module('BuscaAtivaEscolar')
		.config(function ($stateProvider) {
			$stateProvider.state('pending_signups', {
				url: '/pending_signups',
				templateUrl: '/views/tenants/pending_signups.html',
				controller: 'PendingSignupsCtrl'
			})
		})
		.controller('PendingSignupsCtrl', function ($scope, $rootScope, ngToast, Identity, SignUps, StaticData) {

			$scope.identity = Identity;
			$scope.static = StaticData;

			$scope.signups = {};
			$scope.signup = {};
			$scope.query = {sort: {created_at: 'desc'}};

			$scope.refresh = function() {
				$scope.signups = SignUps.getPending($scope.query);
			};

			$scope.preview = function(signup) {
				$scope.signup = signup;
			};

			$scope.approve = function(signup) {
				SignUps.approve({id: signup.id}, function() {
					$scope.refresh();
					$scope.signup = {};
				});
			};

			$scope.reject = function(signup) {
				SignUps.reject({id: signup.id}, function() {
					$scope.refresh();
					$scope.signup = {};
				});
			};

			$scope.resendNotification = function(signup) {
				SignUps.resendNotification({id: signup.id}, function() {
					ngToast.success('Notificação reenviada!');
				});
			};

			$scope.refresh();

		});

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
		.controller('TenantBrowserCtrl', function ($scope, $rootScope, Tenants, Identity) {

			$scope.identity = Identity;
			$scope.tenants = {};
			$scope.query = {sort: {registered_at: 'asc'}};

			$scope.refresh = function() {
				$scope.tenants = Tenants.all($scope.query);
			};
			
			$scope.refresh();

		});

})();
(function() {

	angular.module('BuscaAtivaEscolar')
		.config(function ($stateProvider) {
			$stateProvider.state('admin_setup', {
				url: '/admin_setup/{id}?token',
				templateUrl: '/views/initial_admin_setup/main.html',
				controller: 'AdminSetupCtrl',
				unauthenticated: true
			});
		})
		.controller('AdminSetupCtrl', function ($scope, $stateParams, $window, moment, ngToast, Platform, Utils, SignUps, Cities, Modals, StaticData) {

			$scope.static = StaticData;

			var signupID = $stateParams.id;
			var signupToken = $stateParams.token;

			console.info('[admin_setup] Admin setup for signup: ', signupID, 'token=', signupToken);

			$scope.step = 1;
			$scope.numSteps = 4;
			$scope.ready = false;

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
				personal_mobile: 'celular pessoal'
			};

			var requiredAdminFields = ['email','name','cpf','dob','phone','password'];

			var messages = {
				invalid_gp: 'Dados do gestor político incompletos! Campos inválidos: ',
				invalid_co: 'Dados do coordenador operacional incompletos! Campos inválidos: '
			};

			$scope.signup = {};
			$scope.admins = {
				political: {},
				operational: {}
			};

			$scope.goToStep = function (step) {
				if($scope.step < 1) return;
				if($scope.step > $scope.numSteps) return;

				$scope.step = step;
				$window.scrollTo(0, 0);
			};

			$scope.nextStep = function() {
				if($scope.step >= $scope.numSteps) return;

				if($scope.step === 3 && !Utils.isValid($scope.admins.political, requiredAdminFields, fieldNames, messages.invalid_gp)) return;
				if($scope.step === 4 && !Utils.isValid($scope.admins.operational, requiredAdminFields, fieldNames, messages.invalid_co)) return;

				$scope.step++;
				$window.scrollTo(0, 0);
			};

			$scope.prevStep = function() {
				if($scope.step <= 1) return;

				$scope.step--;
				$window.scrollTo(0, 0);
			};

			$scope.fetchSignupDetails = function() {
				SignUps.getViaToken({id: signupID, token: signupToken}, function (data) {
					$scope.ready = true;
					$scope.signup = data;
					$scope.admins.political = data.data.admin;
					$scope.admins.political.dob = moment(data.data.admin.dob).toDate();
					$scope.step = 3;
				});
			};

			$scope.provisionTenant = function() {

				if(!Utils.isValid($scope.admins.political, requiredAdminFields, fieldNames, messages.invalid_gp)) return;
				if(!Utils.isValid($scope.admins.operational, requiredAdminFields, fieldNames, messages.invalid_co)) return;

				Modals.show(Modals.Confirm(
					'Tem certeza que deseja prosseguir com o cadastro?',
					'Os dados informados serão usados para criar os usuários administradores. A configuração do município será efetuada pelo Coordenador Operacional.'
				)).then(function(res) {
					var data = {
						id: signupID,
						token: signupToken
					};

					data.political = Object.assign({}, $scope.admins.political);
					data.political = Utils.prepareDateFields(data.political, ['dob']);
					data.political = Utils.prepareCityFields(data.political, ['work_city']);

					data.operational = Object.assign({}, $scope.admins.operational);
					data.operational = Utils.prepareDateFields(data.operational, ['dob']);
					data.operational = Utils.prepareCityFields(data.operational, ['work_city']);

					SignUps.complete(data, function (res) {
						if(res.status === 'ok') {
							ngToast.success('Adesão finalizada!');
							$scope.step = 5;
							return;
						}

						if(res.reason === 'political_admin_email_in_use') {
							$scope.step = 3;
							return ngToast.danger('O e-mail indicado para o gestor político já está em uso. Por favor, escolha outro e-mail');
						}

						if(res.reason === 'operational_admin_email_in_use') {
							$scope.step = 4;
							return ngToast.danger('O e-mail indicado para o coordenador já está em uso. Por favor, escolha outro e-mail');
						}

						if(res.reason === 'invalid_political_admin_data') {
							$scope.step = 3;
							ngToast.danger(messages.invalid_gp);
							return Utils.displayValidationErrors(res);
						}

						if(res.reason === 'invalid_operational_admin_data') {
							$scope.step = 4;
							ngToast.danger(messages.invalid_co);
							return Utils.displayValidationErrors(res);
						}

						ngToast.danger("Ocorreu um erro ao finalizar a adesão: " + res.reason);

					});

				});
			};

			$scope.fetchSignupDetails();

		});

})();
(function() {

	angular.module('BuscaAtivaEscolar').controller('SignUpCtrl', function ($scope, $rootScope, $window, ngToast, Utils, SignUps, Cities, Modals, StaticData) {

		$scope.static = StaticData;

		$scope.step = 1;
		$scope.numSteps = 5;
		$scope.isCityAvailable = false;

		$scope.form = {
			uf: null,
			city: null,
			admin: {},
			mayor: {}
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
			personal_mobile: 'celular pessoal'
		};

		var messages = {
			invalid_gp: 'Dados do gestor político incompletos! Campos inválidos: ',
			invalid_mayor: 'Dados do prefeito incompletos! Campos inválidos: '
		};

		var requiredAdminFields = ['email','name','cpf','dob','phone'];
		var requiredMayorFields = ['email','name','cpf','dob','phone'];

		$scope.fetchCities = function(query) {
			var data = {name: query, $hide_loading_feedback: true};
			if($scope.form.uf) data.uf = $scope.form.uf;

			return Cities.search(data).$promise.then(function (res) {
				return res.results;
			});
		};

		$scope.renderSelectedCity = function(city) {
			if(!city) return '';
			return city.uf + ' / ' + city.name;
		};

		$scope.goToStep = function (step) {
			if($scope.step < 1) return;
			if($scope.step > $scope.numSteps) return;

			$scope.step = step;
			$window.scrollTo(0, 0);
		};

		$scope.nextStep = function() {
			if($scope.step >= $scope.numSteps) return;

			if($scope.step === 2 && !Utils.isValid($scope.form.admin, requiredAdminFields, fieldNames, messages.invalid_gp)) return;
			if($scope.step === 3 && !Utils.isValid($scope.form.mayor, requiredMayorFields, fieldNames, messages.invalid_mayor)) return;

			$scope.step++;
			$window.scrollTo(0, 0);
		};

		$scope.prevStep = function() {
			if($scope.step <= 1) return;

			$scope.step--;
			$window.scrollTo(0, 0);
		};

		$scope.onCitySelect = function(uf, city) {
			if(!uf || !city) return;
			$scope.checkCityAvailability(city);
		};

		$scope.checkCityAvailability = function(city) {

			if(!$scope.form.uf) $scope.form.uf = city.uf;

			$scope.hasCheckedAvailability = false;

			Cities.checkIfAvailable({id: city.id}, function (res) {
				$scope.hasCheckedAvailability = true;
				$scope.isCityAvailable = !!res.is_available;
			});
		};

		$scope.finish = function() {
			if(!$scope.agreeTOS) return;

				var data = {};
				data.admin = Object.assign({}, $scope.form.admin);
				data.mayor = Object.assign({}, $scope.form.mayor);
				data.city = Object.assign({}, $scope.form.city);

				if(!Utils.isValid(data.admin, requiredAdminFields, messages.invalid_gp)) return;
				if(!Utils.isValid(data.mayor, requiredMayorFields, messages.invalid_mayor)) return;

				data.city_id = (data.city) ? data.city.id : null;
				data.admin = Utils.prepareDateFields(data.admin, ['dob']);
				data.mayor = Utils.prepareDateFields(data.mayor, ['dob']);

				SignUps.register(data, function (res) {
					if(res.status === 'ok') {
						ngToast.success('Solicitação de adesão registrada!');
						$scope.step = 5;
						return;
					}

					if(res.reason === 'political_admin_email_in_use') {
						$scope.step = 2;
						return ngToast.danger('O e-mail indicado para o gestor político já está em uso. Por favor, escolha outro e-mail');
					}

					if(res.reason === 'invalid_political_admin_data') {
						$scope.step = 2;
						ngToast.danger(messages.invalid_gp);

						return Utils.displayValidationErrors(res);
					}

					ngToast.danger("Ocorreu um erro ao registrar a adesão: " + res.reason);

				});

		};

	});

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
		.controller('TenantSetupCtrl', function ($scope, $state, $stateParams, Platform, Identity, SignUps, Tenants, Modals) {

			if(!$stateParams.step) return $state.go('tenant_setup', {step: 1});

			$scope.step = parseInt($stateParams.step, 10);
			$scope.isReady = false;
			$scope.tenant = {};

			$scope.getAdminUserID = function() {
				return $scope.tenant.operational_admin_id;
			};

			$scope.goToStep = function(step) {
				if(step > 5) return;
				if(step < 1) return;
				$state.go('tenant_setup', {step: step});
			};

			$scope.nextStep = function() {

				var step = $scope.step + 1;
				if($scope.step > 5) {
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
					SignUps.completeSetup({}, function() {
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
(function() {

	angular.module('BuscaAtivaEscolar')
		.config(function ($stateProvider) {
			$stateProvider.state('user_browser', {
				url: '/users',
				templateUrl: '/views/users/browser.html',
				controller: 'UserBrowserCtrl'
			})
		})
		.controller('UserBrowserCtrl', function ($scope, $rootScope, ngToast, Platform, Identity, Users, Groups, Tenants, StaticData) {

		$scope.identity = Identity;
		$scope.query = {
			tenant_id: null,
			group_id: null,
			type: null,
			email: null,
			max: 128,
			with: 'tenant',
			sort: {},
			show_suspended: true
		};

		$scope.quickAdd = false;

		$scope.enableQuickAdd = function() {
			$scope.quickAdd = true;
		};

		$scope.setMaxResults = function(max) {
			$scope.query.max = max;
			$scope.refresh();
		};

		$scope.canEditUser = function(user) {
			var currentUser = Identity.getCurrentUser();
			return (StaticData.getPermissions().can_manage_types[currentUser.type]).indexOf(user.type) !== -1;
		};

		$scope.isCurrentUser = function(user) {
			return (Identity.getCurrentUser().id === user.id);
		};

		$scope.static = StaticData;
		$scope.tenants = Tenants.find();
		$scope.groups = Groups.find();
		$scope.canFilterByTenant = false;

		$scope.checkboxes = {};
		$scope.search = {};

		$scope.getGroups = function() {
			if(!$scope.groups || !$scope.groups.data) return [];
			return $scope.groups.data;
		};

		$scope.getTenants = function() {
			if(!$scope.tenants || !$scope.tenants.data) return [];
			return $scope.tenants.data;
		};

		$scope.refresh = function() {
			$scope.search = Users.search($scope.query);
		};

		$scope.suspendUser = function(user) {
			Users.suspend({id: user.id}, function (res) {
				ngToast.success('Usuário desativado!');
				$scope.refresh();
			});
		};

		$scope.restoreUser = function(user) {
			Users.restore({id: user.id}, function (res) {
				ngToast.success('Usuário reativado!');
				$scope.refresh();
			});
		};

		$scope.refresh();

		Platform.whenReady(function() {
			$scope.canFilterByTenant = (Identity.getType() === 'gestor_nacional' || Identity.getType() === 'superuser');
			console.log("[user_browser] Can filter by tenant? ", Identity.getType(), $scope.canFilterByTenant);
		})

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

			$scope.groups = Groups.find();
			$scope.tenants = Tenants.find();
			$scope.quickAdd = ($stateParams.quick_add === 'true');

			var permissions = {}
			var dateOnlyFields = ['dob'];

			Platform.whenReady(function() {
				permissions = StaticData.getPermissions();
			});

			if(!$scope.isCreating) {
				$scope.user = Users.find({id: $stateParams.user_id}, prepareUserModel);
			}

			$scope.canDefineUserTenant = function() {
				if(Identity.getType() !== 'superuser' && Identity.getType() !== 'gestor_nacional') {
					return false;
				}

				return ($scope.user.type !== 'superuser' && $scope.user.type !== 'gestor_nacional');
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
				return permissions.can_manage_types[ Identity.getCurrentUser().type ];
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
				return Utils.unpackDateFields(user, dateOnlyFields)
			}

			function onSaved(res) {
				if(res.status === "ok") {
					ngToast.success("Dados de usuário salvos com sucesso!");

					if($scope.quickAdd && $rootScope.previousState) return $state.go($rootScope.previousState, $rootScope.previousStateParams);
					if($scope.isCreating) return $state.go('user_editor', {user_id: res.id});

					return;
				}

				if(res.messages) return Utils.displayValidationErrors(res);

				ngToast.danger("Ocorreu um erro ao salvar o usuário: ", res.status);
			}

		});

})();
//# sourceMappingURL=app.js.map
