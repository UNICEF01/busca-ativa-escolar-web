(function () {
  angular
    .module('BuscaAtivaEscolar')
    .controller('ChildCasesCtrl', ChildCasesCtrl)
    .controller('ChildCaseStepCtrl', ChildCaseStepCtrl)
    .config(function ($stateProvider) {
      $stateProvider
        .state('child_viewer.cases', {
          url: '/cases',
          templateUrl: '/views/children/view/steps.html',
          controller: 'ChildCasesCtrl',
        })
        .state('child_viewer.cases.view_step', {
          url: '/{step_type}/{step_id}',
          templateUrl: '/views/children/view/case_info.html',
          controller: 'ChildCaseStepCtrl',
        });
    });

  function ChildCasesCtrl(
    $q,
    $timeout,
    $scope,
    $state,
    $stateParams,
    ngToast,
    Identity,
    Utils,
    Modals,
    Children,
    CaseSteps,
    Decorators
  ) {
    $scope.Decorators = Decorators;
    $scope.Children = Children;
    $scope.CaseSteps = CaseSteps;

    $scope.identity = Identity;

    $scope.check = false;

    $scope.caseIsLoaded = false;

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
        return $scope.openedCase.current_step_id === step.id;
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
      var toggleClass = step.id === $scope.openStepID ? ' step-open' : '';

      if (step.is_completed) return 'step-completed' + toggleClass;
      if (childCase.current_step_id === step.id)
        return 'step-current' + toggleClass;
      return 'step-pending' + toggleClass;
    };

    $scope.canOpenStep = function (step) {
      if (step.is_completed || step.id === $scope.openedCase.current_step_id) {
        return Identity.can('cases.step.' + step.slug);
      }
      return false;
    };

    $scope.canEditStep = function (step) {
      return !step.is_completed && step.slug !== 'alerta';
    };

    $scope.openStep = function (selectedStep) {
      if (!$scope.canOpenStep(selectedStep)) return false;

      $scope.openStepID = selectedStep.id;

      $state
        .go('child_viewer.cases.view_step', {
          step_type: selectedStep.step_type,
          step_id: selectedStep.id,
        })
        .then(function () {
          $timeout(refreshGoogleMap, 1000);
        });
    };

    $scope.canCompleteStep = function (childCase, step) {
      if (step.step_type === 'BuscaAtivaEscolar\\CaseSteps\\Alerta')
        return false;
      if (!Identity.can('cases.step.' + step.slug)) return false;
      return (
        step.id === childCase.current_step_id &&
        !step.is_completed &&
        !step.is_pending_assignment
      );
    };

    $scope.isPendingAssignment = function (step) {
      return !step.is_completed && step.is_pending_assignment;
    };

    $scope.hasNextStep = function (step) {
      if (!step) return false;
      if (
        step.step_type === 'BuscaAtivaEscolar\\CaseSteps\\Observacao' &&
        step.report_index === 4
      )
        return false;
      return true;
    };

    $scope.cancelCase = function () {
      Modals.show(Modals.CaseCancel())
        .then(function (reason) {
          if (!reason) return $q.reject();
          return Children.cancelCase({
            case_id: $scope.openedCase.id,
            reason: reason,
          });
        })
        .then(function () {
          ngToast.success(
            'A última etapa de observação foi concluída, e o caso foi encerrado!'
          );
          $state.go(
            'child_viewer.cases',
            { child_id: $scope.child.id },
            { reload: true }
          );
        });
    };

    $scope.reopenCase = function () {
      Modals.show(Modals.CaseReopen($scope.identity.getType()))

        .then(function (reason) {
          if (!reason) return $q.reject();

          if ($scope.identity.getType() === 'coordenador_operacional') {
            Children.reopenCase({
              case_id: $scope.openedCase.id,
              reason: reason,
            }).$promise.then(function (res) {
              if (res.status === 'success') {
                ngToast.success(
                  res.result + '! Redirecionando para o novo caso...'
                );
                setTimeout(function () {
                  window.location =
                    'children/view/' + res.child_id + '/consolidated';
                }, 4000);
              } else {
                ngToast.danger(res.result);
              }
            });
          }

          if ($scope.identity.getType() === 'supervisor_institucional') {
            Children.requestReopenCase({
              case_id: $scope.openedCase.id,
              reason: reason,
            }).$promise.then(function (res) {
              if (res.status === 'success') {
                ngToast.success(res.result);
                setTimeout(function () {
                  window.location =
                    'children/view/' + $scope.child_id + '/consolidated';
                }, 3000);
              }

              if (res.status === 'error') {
                ngToast.danger(res.result);
              }
            });
          }
        })

        .then(function () {});
    };

    $scope.transferCase = function () {
      Modals.show(Modals.CaseTransfer($scope.identity.getType()))
        .then(function (response) {
          if (!response) return $q.reject();

          if ($scope.identity.getType() === 'coordenador_operacional') {
            Children.requestTransferCase({
              tenant_id: response.tenant_id,
              case_id: $scope.openedCase.id,
              reason: response.reason,
              city_id: response.city_id,
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
        })
        .then(function () {});
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
      var question = 'Tem certeza que deseja prosseguir para a próxima etapa?';
      var explanation =
        'Ao progredir de etapa, a etapa atual será marcada como concluída. Os dados preenchidos serão salvos.';

      if (step.step_type === 'BuscaAtivaEscolar\\CaseSteps\\AnaliseTecnica') {
        question = 'Tem certeza que deseja concluir a Análise Técnica?';
        explanation =
          'Ao dizer SIM, a Análise Técnica será marcada como concluída e nenhuma informação poderá ser editada. Os dados preenchidos serão salvos.';
      }

      if (
        step.step_type === 'BuscaAtivaEscolar\\CaseSteps\\Observacao' &&
        step.report_index === 4
      ) {
        question =
          'Tem certeza que deseja concluir a última etapa de observação?';
        explanation =
          'O caso será considerado concluído e os dados preenchidos serão salvos.';
      }

      Modals.show(Modals.Confirm(question, explanation))
        .then(function () {
          return CaseSteps.complete({
            type: step.step_type,
            id: step.id,
          }).$promise;
        })
        .then(function (response) {
          if (response.messages) {
            ngToast.danger(
              'É necessário preencher todos os campos obrigatórios para concluir essa etapa.'
            );
            Utils.displayValidationErrors(response);
            $state.go('child_viewer.cases.view_step', {
              step_type: step.step_type,
              step_id: step.id,
            });
            return;
          }

          if (response.status !== 'ok') {
            ngToast.danger(
              'Ocorreu um erro ao concluir a etapa! (reason=' +
                response.reason +
                ')'
            );
            return;
          }

          if (!response.hasNext) {
            ngToast.success(
              'A última etapa de observação foi concluída, e o caso foi encerrado!'
            );
            $state.go(
              'child_viewer.cases',
              { child_id: $scope.child.id },
              { reload: true }
            );
            return;
          }

          ngToast.success(
            'Etapa concluída! A próxima etapa já está disponível para início'
          );
          $state.go(
            'child_viewer.cases.view_step',
            {
              step_type: response.nextStep.step_type,
              step_id: response.nextStep.id,
            },
            { reload: true }
          );
        });
    };

    $scope.scopeOfCase = function () {
      if ($scope.step.assigned_user) {
        if (
          $scope.step.assigned_user.type === 'coordenador_estadual' ||
          $scope.step.assigned_user.type === 'supervisor_estadual'
        ) {
          return 'state';
        } else {
          return 'municipality';
        }
      }
    };

    $scope.canTransferCase = function () {
      if (!$scope.identity.getCurrentUser().tenant_id) {
        return false;
      }
      if (
        $scope.identity.getCurrentUser().tenant_id !== $scope.child.tenant_id
      ) {
        return false;
      }
      if ($scope.openedCase) {
        if ($scope.openedCase.case_status !== 'in_progress') {
          return false;
        }
        if ($scope.openedCase.currentStep.assigned_user) {
          if (
            $scope.openedCase.currentStep.assigned_user.type ==
              'coordenador_estadual' ||
            $scope.openedCase.currentStep.assigned_user.type ==
              'supervisor_estadual'
          ) {
            return false;
          }
        }
        if (
          $scope.identity.can('cases.transfer') &&
          $scope.openedCase.currentStep.slug !== 'alerta'
        ) {
          return true;
        }
      }
      return false;
    };

    $scope.canCancelCase = function () {
      if ($scope.identity.getCurrentUser().tenant_id) {
        if (
          $scope.identity.getCurrentUser().tenant_id !== $scope.child.tenant_id
        ) {
          return false;
        }
      }
      if ($scope.openedCase) {
        if ($scope.openedCase.case_status !== 'in_progress') {
          return false;
        }

        if (!$scope.openedCase.currentStep.assigned_user) {
          return true;
        } else {
          if (
            ($scope.openedCase.currentStep.assigned_user.type ==
              'coordenador_estadual' ||
              $scope.openedCase.currentStep.assigned_user.type ==
                'supervisor_estadual') &&
            !$scope.identity.getCurrentUser().tenant_id
          ) {
            return true;
          }

          if (
            $scope.openedCase.currentStep.assigned_user.type !=
              'coordenador_estadual' &&
            $scope.openedCase.currentStep.assigned_user.type !=
              'supervisor_estadual' &&
            $scope.identity.getCurrentUser().tenant_id
          ) {
            return true;
          }
        }
      }
    };

    $scope.showMessageNeedTransfer = function () {
      if (
        $scope.identity.getCurrentUser().tenant_id &&
        $scope.child.hasOwnProperty('id')
      ) {
        if (
          $scope.identity.getCurrentUser().tenant_id != $scope.child.tenant_id
        ) {
          return true;
        } else {
          return false;
        }
      }
      return false;
    };
  }

  function ChildCaseStepCtrl(
    $scope,
    $state,
    $stateParams,
    ngToast,
    Utils,
    Modals,
    Alerts,
    Schools,
    Cities,
    Children,
    Decorators,
    CaseSteps,
    StaticData,
    Tenants,
    Groups,
    Platform
  ) {
    $scope.Decorators = Decorators;
    $scope.Children = Children;
    $scope.CaseSteps = CaseSteps;
    $scope.static = StaticData;

    $scope.editable = true;
    $scope.showAll = false;
    $scope.showTitle = true;
    $scope.new_user = '';

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
    $scope.groupsOfCase = [];

    $scope.nodesGroup = [];

    $scope.addContact = function (id, parent) {
      if (id || id === undefined) {
        $scope.fields.aux.contatos[parent].push({
          name: '',
          phone: '',
          isResponsible: '',
          model: { name: 'name', phone: 'phone' },
        });
      } else if (id === false) {
        $scope.fields.aux.contatos[parent] = [];
      }
    };

    $scope.removeContact = function (index, parent) {
      if (index === 0) return;
      $scope.fields.aux.contatos[parent].splice(index, 1);
    };

    $scope.insertResponsible = function (parent) {
      if (parent) {
        if ($scope.fields.aux.contatos[parent].length > 1) {
          $scope.responsible[parent] = $scope.fields.aux.contatos[parent];
        } else {
          $scope.fields.guardian_name =
            $scope.fields.aux.contatos[parent][0].name;
        }
      } else {
        $scope.fields.guardian_name =
          $scope.fields.aux.contatos[parent][0].name;
      }
    };

    $scope.avisoDivergencia = false;

    $scope.getAdressByCEP = function (cep) {
      if (!cep) {
        return;
      }
      viaCep
        .get(cep)
        .then(function (response) {
          $scope.fields.school_address = response.logradouro;
          $scope.fields.school_neighborhood = response.bairro;
          $scope.fields.school_uf = response.uf;
          $scope.fetchCities(response.localidade).then(function (value) {
            $scope.fields.school_city = value[0];
            validateSchoolWithPlace();
          });
        })
        .catch(function () {
          $scope.noCEF = true;
          setTimeout(function () {
            $scope.noCEF = false;
          }, 1000);
        });
    };

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
    };

    $scope.checkInputParents = function (value, name) {
      if ('mother' === name) {
        $scope.fields.aux.contatos.mother.name = $scope.fields.mother_name;
      }
      if (!value) {
        $scope.fields.aux.contatos[name].name = '';
        $scope.fields.aux.contatos[name].phone = '';
      }
    };

    function fetchStepData() {
      $scope.current_date = new Date();

      $scope.step = CaseSteps.find({
        type: $stateParams.step_type,
        id: $stateParams.step_id,
        with: 'fields,case',
      });

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
              others: $scope.fields.aux.contatos.others || [],
            },
          };
        }
        if (step.fields && step.fields.place_coords) {
          step.fields.place_map_center = Object.assign(
            {},
            step.fields.place_coords
          );
        }

        var settingsOfTenantOfCase = Tenants.getSettingsOftenantOfcase({
          id: $scope.step.case.tenant_id,
        });

        settingsOfTenantOfCase.$promise.then(function (res_settings) {
          $scope.tenantSettingsOfCase = res_settings;
        });

        // Chamando a função de inicialização após o carregamento dos dados da API
        $scope.initializeSelectedPlaceType();
      });
    }

    // Função para inicializar o valor de selectedPlaceType com base na resposta da API
    $scope.initializeSelectedPlaceType = function () {
      //   console.log('initializeSelectedPlaceType', {
      //     place_is_indigena: $scope.fields.place_is_indigena,
      //     place_is_do_campo: $scope.fields.place_is_do_campo,
      //     place_is_ribeirinha: $scope.fields.place_is_ribeirinha,
      //     place_is_quilombola: $scope.fields.place_is_quilombola,
      //   });

      if ($scope.fields.place_is_indigena == 1) {
        $scope.fields.selectedPlaceType = 'indigena';
      } else if ($scope.fields.place_is_do_campo == 1) {
        $scope.fields.selectedPlaceType = 'do_campo';
      } else if ($scope.fields.place_is_ribeirinha == 1) {
        $scope.fields.selectedPlaceType = 'ribeirinha';
      } else if ($scope.fields.place_is_quilombola == 1) {
        $scope.fields.selectedPlaceType = 'quilombola';
      }
    };

    fetchStepData();

    var dateOnlyFields = [
      'enrolled_at',
      'report_date',
      'dob',
      'guardian_dob',
      'reinsertion_date',
    ];

    $scope.saveAndProceed = function () {
      $scope
        .save()
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
      return (
        $scope.step.step_type ===
        'BuscaAtivaEscolar\\CaseSteps\\' + stepClassName
      );
    };

    $scope.hasNextStep = function () {
      if (!$scope.step) return false;
      if (
        $scope.step.step_type === 'BuscaAtivaEscolar\\CaseSteps\\Observacao' &&
        $scope.step.report_index === 4
      )
        return false;
      return true;
    };

    $scope.canEditCurrentStep = function (isEditableOnAlerts) {
      if (!$scope.step) return false;
      if (!$scope.$parent.openedCase) return false;
      if (!isEditableOnAlerts && $scope.step.slug === 'alerta') return false;
      if ($scope.scopeOfCase() !== $scope.scopeOfUser()) return false;
      if ($scope.showMessageNeedTransfer()) return false;
      return !$scope.step.is_completed;
    };

    $scope.showMessageNeedTransfer = function () {
      if ($scope.identity.getCurrentUser().tenant_id) {
        if (
          $scope.identity.getCurrentUser().tenant_id != $scope.child.tenant_id
        ) {
          return true;
        }
      }
      return false;
    };

    $scope.canAcceptAlert = function (step, fields) {
      if (!step) return false;
      if (!step.requires_address_update) return true;
      return (
        fields && fields.place_address && fields.place_address.trim().length > 0
      );
    };

    $scope.acceptAlert = function (childID) {
      var data = { id: childID };

      if (
        $scope.step &&
        $scope.step.slug === 'alerta' &&
        $scope.step.requires_address_update
      ) {
        data.place_address = $scope.fields.place_address;
      }

      Alerts.accept(data, function () {
        $state.reload();
      });
    };

    $scope.rejectAlert = function (childID) {
      Alerts.reject({ id: childID }, function () {
        $state.reload();
      });
    };

    $scope.canCompleteStep = function () {
      if (!$scope.step) return false;
      if (!$scope.$parent.openedCase) return false;
      return (
        $scope.step.id === $scope.$parent.openedCase.current_step_id &&
        !$scope.step.is_completed &&
        !$scope.step.is_pending_assignment
      );
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
        if (('' + data[i]).trim().length <= 0) continue;
        filtered[i] = data[i];
      }

      return filtered;
    }

    $scope.assignUser = function () {
      var groupOfCase = null;

      if ($scope.step.case.hasOwnProperty('group')) {
        if ($scope.step.case.group != null) {
          groupOfCase = $scope.step.case.group.id;

          //retorna grupo do caso com os grupos pais
          Groups.findByIdWithParents({ id: groupOfCase }).$promise.then(
            function (res) {
              var groupOfCaseWithParents = res.data[0];
              var groupsToMove = [];

              groupsToMove.push({
                id: groupOfCaseWithParents.id,
                name: groupOfCaseWithParents.name,
                margin: 80,
              });
              if (groupOfCaseWithParents.parent != null) {
                groupsToMove.push({
                  id: groupOfCaseWithParents.parent.id,
                  name: groupOfCaseWithParents.parent.name,
                  margin: 60,
                });
                if (groupOfCaseWithParents.parent.parent != null) {
                  groupsToMove.push({
                    id: groupOfCaseWithParents.parent.parent.id,
                    name: groupOfCaseWithParents.parent.parent.name,
                    margin: 40,
                  });
                  if (groupOfCaseWithParents.parent.parent.parent != null) {
                    groupsToMove.push({
                      id: groupOfCaseWithParents.parent.parent.parent.id,
                      name: groupOfCaseWithParents.parent.parent.parent.name,
                      margin: 20,
                    });
                  }
                }
              }

              var finalGroupsOfuserToAssign = [];
              for (let group of groupsToMove) {
                finalGroupsOfuserToAssign.push(group);
                if (group.id == $scope.identity.getCurrentUser().group.id)
                  break;
              }
              $scope.groupsOfCase = finalGroupsOfuserToAssign.reverse();
              $scope.loadModalAssignUser();
            }
          );
        }
      }
    };

    $scope.loadModalAssignUser = function () {
      var nodes = [];
      $scope.groupsOfCase.forEach(function (group) {
        nodes.push(group.id);
      });

      CaseSteps.assignableUsers({
        type: $scope.step.step_type,
        id: $scope.step.id,
        nodes_groups: nodes,
      })
        .$promise.then(function (res) {
          if (!res.users)
            return ngToast.danger(
              'Nenhum usuário pode ser atribuído para essa etapa!'
            );
          return Modals.show(
            Modals.UserPicker(
              'Atribuindo responsabilidade',
              'Indique qual usuário deve ficar responsável por essa etapa:',
              res.users,
              $scope.groupsOfCase,
              true
            )
          );
        })
        .then(function (user_id) {
          $scope.new_user = user_id;
          CaseSteps.assignUser({
            type: $scope.step.step_type,
            id: $scope.step.id,
            user_id: user_id,
          }).$promise.then(function () {
            ngToast.success('Usuário atribuído!');
            if ($scope.identity.getCurrentUser().id != $scope.new_user)
              $state.go('child_browser');
            else $state.reload();
          });
        });
    };

    $scope.canAssignUser = function () {
      if ($scope.child.currentCase) {
        if ($scope.child.currentCase.case_status != 'in_progress') return false;
      }
      if ($scope.showMessageNeedTransfer()) return false;
      if ($scope.scopeOfCase() == 'state') return false;
      if ($scope.identity.can('cases.assign')) return true;
      return false;
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
      var data = { name: query, $hide_loading_feedback: true };

      if ($scope.fields.place_uf) data.uf = $scope.fields.place_uf;
      if ($scope.fields.school_uf) data.uf = $scope.fields.school_uf;

      return Cities.search(data).$promise.then(function (res) {
        return res.results;
      });
    };

    $scope.fetchSchools = function (query, filter_by_uf, filter_by_city) {
      var data = { name: query, $hide_loading_feedback: true };

      if (filter_by_uf) data.uf = filter_by_uf;
      if (filter_by_city && filter_by_city.id) data.city_id = filter_by_city.id;

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

      data = Utils.prepareDateFields(data, dateOnlyFields);

      data = unpackTypeaheadField(data, 'place_city', data.place_city);
      data = unpackTypeaheadField(data, 'school_city', data.school_city);
      data = unpackTypeaheadField(data, 'school', data.school);
      data = unpackTypeaheadField(data, 'school_last', data.school_last);

      data = clearAuxiliaryFields(data);
      data = filterOutEmptyFields(data);

      data.type = $scope.step.step_type;
      data.id = $scope.step.id;

      return CaseSteps.save(data).$promise.then(function (response) {
        if (response.messages) {
          return Utils.displayValidationErrors(response);
        }

        if (response.status !== 'ok') {
          ngToast.danger(
            'Ocorreu um erro ao salvar os dados da etapa! (status=' +
              response.status +
              ', reason=' +
              response.reason +
              ')'
          );
          return;
        }

        if (response.updated) {
          fetchStepData(); // Updates data
        }

        ngToast.success('Os campos da etapa foram salvos com sucesso!');
      });
    };

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
        if ($scope.step.slug == '1a_observacao') {
          time_for_next_step =
            $scope.tenantSettingsOfCase.stepDeadlines['1a_observacao'];
          var permission =
            $scope.diffDaysBetweenSteps(
              new Date(child.cases[0].steps[4].updated_at),
              $scope.current_date
            ) >= time_for_next_step
              ? true
              : false;
          return permission;
        }
        if ($scope.step.slug == '2a_observacao') {
          time_for_next_step =
            $scope.tenantSettingsOfCase.stepDeadlines['2a_observacao'];
          var permission =
            $scope.diffDaysBetweenSteps(
              new Date(child.cases[0].steps[5].updated_at),
              $scope.current_date
            ) >= time_for_next_step
              ? true
              : false;
          return permission;
        }
        if ($scope.step.slug == '3a_observacao') {
          time_for_next_step =
            $scope.tenantSettingsOfCase.stepDeadlines['3a_observacao'];
          var permission =
            $scope.diffDaysBetweenSteps(
              new Date(child.cases[0].steps[6].updated_at),
              $scope.current_date
            ) >= time_for_next_step
              ? true
              : false;
          return permission;
        }
        if ($scope.step.slug == '4a_observacao') {
          time_for_next_step =
            $scope.tenantSettingsOfCase.stepDeadlines['4a_observacao'];
          var permission =
            $scope.diffDaysBetweenSteps(
              new Date(child.cases[0].steps[7].updated_at),
              $scope.current_date
            ) >= time_for_next_step
              ? true
              : false;
          return permission;
        }
      }
    };

    $scope.scopeOfCase = function () {
      if ($scope.step.assigned_user) {
        if (
          $scope.step.assigned_user.type === 'coordenador_estadual' ||
          $scope.step.assigned_user.type === 'supervisor_estadual'
        ) {
          return 'state';
        } else {
          return 'municipality';
        }
      }
    };

    $scope.scopeOfUser = function () {
      if (
        $scope.identity.getCurrentUser().type === 'coordenador_estadual' ||
        $scope.identity.getCurrentUser().type === 'supervisor_estadual'
      ) {
        return 'state';
      } else {
        return 'municipality';
      }
    };

    $scope.updatePlaceType = function () {
      $scope.fields.place_is_quilombola = 0;
      $scope.fields.place_is_indigena = 0;
      $scope.fields.place_is_do_campo = 0;
      $scope.fields.place_is_ribeirinha = 0;

      switch ($scope?.fields?.selectedPlaceType) {
        case 'quilombola':
          $scope.fields.place_is_quilombola = 1;
          break;
        case 'indigena':
          $scope.fields.place_is_indigena = 1;
          break;
        case 'do_campo':
          $scope.fields.place_is_do_campo = 1;
          break;
        case 'ribeirinha':
          $scope.fields.place_is_ribeirinha = 1;
          break;
      }
    };

    Platform.whenReady(function () {});
  }
})();
