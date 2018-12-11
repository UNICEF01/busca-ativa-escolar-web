(function() {

	angular.module('BuscaAtivaEscolar').controller('StateSignupCtrl', function ($scope, $rootScope, $window, ngToast, Utils, StateSignups, Cities, Modals, StaticData) {

		$scope.static = StaticData;

		$scope.step = 1;
		$scope.numSteps = 5;
		$scope.isCityAvailable = false;

		$scope.form = {
			uf: null,
			admin: {},
			coordinator: {}
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
			invalid_coordinator: 'Dados do coordenador estadual incompletos! Campos inválidos: '
		};

		var requiredAdminFields = ['email','name','cpf','dob','phone'];
		var requiredCoordinatorFields = ['email','name','cpf','dob','phone'];

		$scope.goToStep = function (step) {
			if($scope.step < 1) return;
			if($scope.step >= $scope.numSteps) return;

			$scope.step = step;
			$window.scrollTo(0, 0);
		};

		$scope.nextStep = function() {
			if($scope.step >= $scope.numSteps) return;

			if($scope.step === 2 && !Utils.isValid($scope.form.admin, requiredAdminFields, fieldNames, messages.invalid_admin)) return;
			if($scope.step === 3 && !Utils.isValid($scope.form.coordinator, requiredCoordinatorFields, fieldNames, messages.invalid_coordinator)) return;

			$scope.step++;
			$window.scrollTo(0, 0);
		};

		$scope.prevStep = function() {
			if($scope.step <= 1) return;

			$scope.step--;
			$window.scrollTo(0, 0);
		};

		$scope.onUFSelect = function(uf) {
			console.log("UF selected: ", uf);
			if(!uf) return;
			$scope.checkStateAvailability(uf);
		};

		$scope.checkStateAvailability = function(uf) {

			$scope.hasCheckedAvailability = false;

			StateSignups.checkIfAvailable({uf: uf}, function (res) {
				$scope.hasCheckedAvailability = true;
				$scope.isStateAvailable = !!res.is_available;
			});
		};

        $scope.showPassword = function (elementId) {
            var field_password = document.getElementById(elementId);
            field_password.type === "password" ? field_password.type = "text" : field_password.type = "password";
        }

		$scope.finish = function() {
			if(!$scope.agreeTOS) return;

				var data = {};
				data.admin = Object.assign({}, $scope.form.admin);
				data.coordinator = Object.assign({}, $scope.form.coordinator);
				data.uf = $scope.form.uf;

				if(!Utils.isValid(data.admin, requiredAdminFields, messages.invalid_admin)) return;
				if(!Utils.isValid(data.coordinator, requiredCoordinatorFields, messages.invalid_coordinator)) return;

				data.admin = Utils.prepareDateFields(data.admin, ['dob']);
				data.coordinator = Utils.prepareDateFields(data.coordinator, ['dob']);

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

					if(res.reason === 'coordinator_email_in_use') {
						$scope.step = 2;
						return ngToast.danger('O e-mail indicado para o coordenador estadual já está em uso. Por favor, escolha outro e-mail');
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