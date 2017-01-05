(function() {

	angular.module('BuscaAtivaEscolar').controller('CaseViewCtrl', function ($scope, $rootScope, ngToast, Modals, MockData, Identity) {

		$rootScope.section = 'cases';

		$scope.identity = Identity;
		$scope.reasons = MockData.searchReasons;
		$scope.alertReasons = MockData.alertReasons;

		$scope.input = {
			hasBeenAtSchool: 1,
			doesWork: 1,
			obsStillAtSchool: 1,
		};

		$scope.isCaseClosed = false;
		$scope.isPanelOpen = {};
		$scope.currentStep = null;
		$scope.currentForm = null;
		$scope.message = "";
		$scope.messages = [];

		$scope.steps = {
			'alerta': {id: 'alerta', name: 'Alerta', opens: [], next: 'pesquisa'},
			'pesquisa': {id: 'pesquisa', name: 'Pesquisa', opens: ['info', 'parents', 'location', 'education', 'work', 'causes'], next: 'analise_tecnica'},
			'analise_tecnica': {id: 'analise_tecnica', name: 'Análise Técnica', opens: ['analise_tecnica'], next: 'gestao_do_caso'},
			'gestao_do_caso': {id: 'gestao_do_caso', name: 'Gestão do Caso', next: 'rematricula'},
			'rematricula': {id: 'rematricula', name: '(Re)matrícula', next: '1obs'},
			'1obs': {id: '1obs', name: '1a observação', next: '2obs'},
			'2obs': {id: '2obs', name: '2a observação', next: '3obs'},
			'3obs': {id: '3obs', name: '3a observação', next: '4obs'},
			'4obs': {id: '4obs', name: '4a observação'}
		};

		$scope.lastStep2014 = '1obs';
		$scope.steps2014Collapsed = true;
		$scope.steps2016Collapsed = false;

		$scope.steps2014 = {
			'alerta': {id: 'alerta', name: 'Alerta', opens: ['info', 'parents'], next: 'pesquisa'},
			'pesquisa': {
				id: 'pesquisa',
				name: 'Pesquisa',
				opens: ['info', 'parents', 'location'],
				next: 'analise_tecnica'
			},
			'analise_tecnica': {
				id: 'analise_tecnica',
				name: 'Análise Técnica',
				opens: ['analise_tecnica'],
				next: 'gestao_do_caso'
			},
			'gestao_do_caso': {id: 'gestao_do_caso', name: 'Consolidação', next: 'rematricula'},
			'rematricula': {id: 'rematricula', name: 'Reinserção', next: '1obs'},
			'1obs': {id: '1obs', name: '1a observação', next: '2obs'},
		};

		function init() {
			$scope.setCaseStep('pesquisa', true);
			$scope.openForm('pesquisa');
		}

		$scope.closeCase = function() {
			Modals.show(Modals.CaseRestart()).then(function() {
				$scope.steps2016Collapsed = true;
				$scope.isCaseClosed = true;

				ngToast.create({
					className: 'success',
					content: 'Caso encerrado!'
				});

				location.hash = '/cases';
			});
		};

		$scope.resolveCase = function() {
			Modals.show(Modals.Confirm(
				'Tem certeza que deseja finalizar esse caso?',
				'Ao finalizar o caso, essa criança será registrada como "Dentro da Escola", e deixará de aparecer nas listas de pendências. Essa operação não pode ser desfeita.'))
			.then(function() {
				ngToast.create({
					className: 'success',
					content: 'Caso finalizado!'
				});

				location.hash = '/cases';
			});
		};

		$scope.assignUserToStep = function(stepName, canDismiss) {
			stepName = stepName || $scope.currentStep;
			canDismiss = !!canDismiss;

			var userType = (stepName == 'pesquisa' || stepName == 'analise_tecnica') ? 'Técnico Verificador' : 'usuário';

			Modals.show(Modals.UserPicker('Selecione o ' + userType + ' responsável:', 'O ' + userType + ' selecionado ficará responsável pela execução da etapa ' + $scope.steps[stepName].name + '.', canDismiss)).then(function() {
				ngToast.create({
					className: 'success',
					content: 'Responsável atribuído!'
				});
			});
		};

		$scope.openActivityLogEntry = function() {
			Modals.show(Modals.CaseActivityLogEntry());
		};

		$scope.hasNextStep = function() {
			if(!$scope.steps[$scope.currentStep]) return false;
			return !!$scope.steps[$scope.currentStep].next;
		};

		$scope.getNextStepName = function() {
			if(!$scope.steps[$scope.currentStep]) return '';
			return $scope.steps[$scope.steps[$scope.currentStep].next].name || '';
		};

		$scope.getCurrentStepName = function() {
			if(!$scope.steps[$scope.currentStep]) return '';
			return $scope.steps[$scope.currentStep].name || '';
		};

		$scope.setCaseStep = function(step, skipNotification) {
			$scope.currentStep = step;
			$scope.isPanelOpen = {};

			for(var i in $scope.steps[step].opens) {
				$scope.isPanelOpen[$scope.steps[step].opens[i]] = true;
			}

			if(skipNotification) return;

			ngToast.create({
				className: 'success',
				content: 'Caso progredido para a etapa ' + $scope.steps[step].name
			});
		};

		$scope.sendMessage = function () {
			$scope.messages.push({
				user: Identity.getCurrentUser(),
				body: $scope.message
			});

			$scope.message = "";
		};

		$scope.sendToApp = function() {
			Modals.show(Modals.Alert(
				'Ficha enviada para seu dispositivo!',
				'Ela estará disponível na área de Notificações do aplicativo Busca Ativa Escolar'
			));
		};

		$scope.save = function() {
			ngToast.create({
				className: 'success',
				content: 'Dados salvos na ficha de ' + $scope.steps[$scope.currentStep].name
			});
		};

		$scope.saveAndProceed = function() {
			if(!$scope.hasNextStep()) return;

			var question = 'Tem certeza que deseja prosseguir para a etapa ' + $scope.getNextStepName() + '?';
			var explanation = 'Ao progredir de etapa, a etapa ' + $scope.getCurrentStepName() + ' será marcada como concluída.';

			if($scope.currentStep == "analise_tecnica") {
				question = 'Tem certeza que deseja concluir a Análise Técnica?';
				explanation = 'Ao dizer SIM, a Análise Técnica será marcada como concluída e nenhuma informação poderá ser editada.';
			}

			Modals.show(Modals.Confirm(question, explanation)).then(function () {
				var next = $scope.steps[$scope.currentStep].next;

				ngToast.create({
					className: 'success',
					content: 'Dados salvos na ficha de ' + $scope.steps[$scope.currentStep].name
				});

				$scope.setCaseStep(next);
				$scope.openForm(next);

				// previous step was pesquisa; this step assigned user defaults to the previous one
				if($scope.currentStep == "analise_tecnica" || !Identity.can('case.assign')) return;

				$scope.assignUserToStep($scope.currentStep, false);
			})

		};

		$scope.openForm = function(form) {

			if(form != 'consolidada' && !$scope.isPastStep(form)) {
				Modals.show(Modals.Alert('Etapa ainda não liberada!', 'Você deve completar a etapa anterior para que a ficha da nova etapa seja liberada.'));
				return;
			}

			$scope.currentForm = form;
			$scope.isPanelOpen = {};

			if(form == 'consolidada') {
				$scope.isPanelOpen = {info: true, location: true, parecer: true};
				return;
			}

			for(var i in $scope.steps[form].opens) {
				$scope.isPanelOpen[$scope.steps[form].opens[i]] = true;
			}
		};

		$scope.togglePanel = function(panel) {
			$scope.isPanelOpen[panel] = !$scope.isPanelOpen[panel];
		};

		$scope.isOpen = function(panel) {
			return $scope.isPanelOpen[panel] || false;
		};

		$scope.getFormName = function() {
			if($scope.currentForm == "consolidada") return "Dados consolidados";
			return $scope.steps[$scope.currentForm].name;
		};

		$scope.isPastStep = function(step, skipCurrentStep) {
			if($scope.currentStep == step) return !skipCurrentStep;

			for(var i in $scope.steps) {
				if($scope.steps[i].id == step) return true;
				if($scope.steps[i].id == $scope.currentStep) return false;
			}
		};

		$scope.getCaseTimelineClass = function(step, current) {
			if(!current) current = $scope.currentStep;
			if(current == step) return 'step-current';

			for(var i in $scope.steps) {
				if($scope.steps[i].id == step) return 'step-completed';
				if($scope.steps[i].id == current) return 'step-pending';
			}
		};

		init();

	});

})();