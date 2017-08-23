(function() {

	angular.module('BuscaAtivaEscolar').controller('StateSignupCtrl', function ($scope, $rootScope, $window, ngToast, Utils, StateSignups, Cities, Modals, StaticData) {

		$scope.static = StaticData;

		$scope.step = 1;
		$scope.numSteps = 5;
		$scope.isCityAvailable = false;

		$scope.form = {
			uf: null,
			admin: {},
			supervisor: {}
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
			invalid_admin: 'Dados do gestor estadual incompletos! Campos inválidos: ',
			invalid_supervisor: 'Dados do supervisor estadual incompletos! Campos inválidos: '
		};

		var requiredAdminFields = ['email','name','cpf','dob','phone'];
		var requiredSupervisorFields = ['email','name','cpf','dob','phone'];

		$scope.goToStep = function (step) {
			if($scope.step < 1) return;
			if($scope.step > $scope.numSteps) return;

			$scope.step = step;
			$window.scrollTo(0, 0);
		};

		$scope.nextStep = function() {
			if($scope.step >= $scope.numSteps) return;

			if($scope.step === 2 && !Utils.isValid($scope.form.admin, requiredAdminFields, fieldNames, messages.invalid_admin)) return;
			if($scope.step === 3 && !Utils.isValid($scope.form.supervisor, requiredSupervisorFields, fieldNames, messages.invalid_supervisor)) return;

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

		$scope.checkStateAvailability = function(uf) {

			$scope.hasCheckedAvailability = false;

			StateSignups.checkIfAvailable({uf: uf}, function (res) {
				$scope.hasCheckedAvailability = true;
				$scope.isStateAvailable = !!res.is_available;
			});
		};

		$scope.finish = function() {
			if(!$scope.agreeTOS) return;

				var data = {};
				data.admin = Object.assign({}, $scope.form.admin);
				data.supervisor = Object.assign({}, $scope.form.supervisor);
				data.uf = $scope.form.uf;

				if(!Utils.isValid(data.admin, requiredAdminFields, messages.invalid_admin)) return;
				if(!Utils.isValid(data.supervisor, requiredSupervisorFields, messages.invalid_supervisor)) return;

				data.admin = Utils.prepareDateFields(data.admin, ['dob']);
				data.supervisor = Utils.prepareDateFields(data.supervisor, ['dob']);

				StateSignups.register(data, function (res) {
					if(res.status === 'ok') {
						ngToast.success('Solicitação de adesão registrada!');
						$scope.step = 5;
						return;
					}

					if(res.reason === 'admin_email_in_use') {
						$scope.step = 2;
						return ngToast.danger('O e-mail indicado para o gestor estadual já está em uso. Por favor, escolha outro e-mail');
					}

					if(res.reason === 'invalid_admin_data') {
						$scope.step = 2;
						ngToast.danger(messages.invalid_admin);

						return Utils.displayValidationErrors(res);
					}

					ngToast.danger("Ocorreu um erro ao registrar a adesão: " + res.reason);

				});

		};

	});

})();