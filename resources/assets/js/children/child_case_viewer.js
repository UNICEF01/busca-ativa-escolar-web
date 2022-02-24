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
            $scope.openedCase = child.cases.find(function (item) {
                if ($stateParams.case_id) return item.id === $stateParams.case_id;
                return item.case_status === 'in_progress';
            });

            // Don't try to open a step; UI-Router will already open the one in the URL
            if ($stateParams.step_id) return;
            if (!$scope.openedCase) return;

            var stepToOpen = $scope.openedCase.steps.find(function (step) {
                return ($scope.openedCase.current_step_id === step.id);
            });
            
            $scope.openStep(stepToOpen);
        }

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

    }

    function ChildCaseStepCtrl($scope, $state, $stateParams, $timeout, ngToast, Identity, Utils, Modals, Alerts, Schools, Cities, Children, Decorators, CaseSteps, StaticData, Tenants, Groups, Platform) {

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

        $scope.groupedGroups = [];
        $scope.groupsToMove = [];
        $scope.groupsOfUser = [];

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

            CaseSteps.assignableUsers({type: $scope.step.step_type, id: $scope.step.id}).$promise
                .then(function (res) {
                    if (!res.users) return ngToast.danger("Nenhum usuário pode ser atribuído para essa etapa!");
                    return Modals.show(Modals.UserPicker('Atribuindo responsabilidade', 'Indique qual usuário deve ficar responsável por essa etapa:', res.users, $scope.groupsOfUser, true))
                })
                .then(function (user_id) {
                    return CaseSteps.assignUser({
                        type: $scope.step.step_type,
                        id: $scope.step.id,
                        user_id: user_id
                    }).$promise;
                }).then(function (res) {
                ngToast.success("Usuário atribuído!");
                $state.go('child_browser');
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

        $scope.getGroupsToMove = function() {
            var groupsToMove = [];
            $scope.groupedGroups.data.forEach(function(v, k){
                groupsToMove.push({id: v.id, name: v.name});
                v.children.forEach(function(v2, k2){
                    groupsToMove.push({id: v2.id, name: v2.name, margin: 10});
                    v2.children.forEach(function(v3, k3){
                        groupsToMove.push({id: v3.id, name: v3.name, margin: 20});
                        v3.children.forEach(function(v4, k4){
                            groupsToMove.push({id: v4.id, name: v4.name, margin: 30});
                        });
                    });
                });
            });
            return groupsToMove;
        };

        $scope.getGroupsOfUser = function (){
            if(Identity.getCurrentUser().hasOwnProperty('group')) {
                var groupsToMove = [];
                groupsToMove.push({id: $scope.getGroupOfCurrentUser().id, name: $scope.getGroupOfCurrentUser().name});
                $scope.getGroupOfCurrentUser().children.forEach(function (v, k) {
                    groupsToMove.push({id: v.id, name: v.name, margin: 20});
                    v.children.forEach(function (v2, k2) {
                        groupsToMove.push({id: v2.id, name: v2.name, margin: 40});
                        v2.children.forEach(function (v3, k3) {
                            groupsToMove.push({id: v3.id, name: v3.name, margin: 60});
                            v3.children.forEach(function (v4, k4) {
                                groupsToMove.push({id: v4.id, name: v4.name, margin: 80});
                            });
                        });
                    });
                });
                return groupsToMove;
            };
            return [];
        };

        $scope.getGroupOfCurrentUser = function (){
            if(Identity.getCurrentUser().hasOwnProperty('group')){
                var groupedGroupsOfUser = [];
                var userGroupId = Identity.getCurrentUser().group.id;
                $scope.groupedGroups.data.forEach(function(v, k){
                    if (v.id == userGroupId) { groupedGroupsOfUser = v; }
                    v.children.forEach(function(v2, k2){
                        if (v2.id == userGroupId) { groupedGroupsOfUser = v2; }
                        v2.children.forEach(function(v3, k3){
                            if (v3.id == userGroupId) { groupedGroupsOfUser = v3; }
                            v3.children.forEach(function(v4, k4){
                                if (v4.id == userGroupId) { groupedGroupsOfUser = v4; }
                            });
                        });
                    });
                });
                return groupedGroupsOfUser;
            }
            return [];
        };

        Platform.whenReady(function() {
            Groups.findGroupedByTenant({tenant_id: Identity.getCurrentUser().tenant_id}, function (res){
                $scope.groupedGroups = res;
                $scope.groupsToMove = $scope.getGroupsToMove();
                $scope.groupsOfUser = $scope.getGroupsOfUser();
            });
        });

    }

})();
