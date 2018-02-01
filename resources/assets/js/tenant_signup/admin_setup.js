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
		.controller('AdminSetupCtrl', function ($scope, $stateParams, $window, moment, ngToast, Platform, Utils, TenantSignups, Cities, Modals, StaticData) {

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
				TenantSignups.getViaToken({id: signupID, token: signupToken}, function (data) {
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

					TenantSignups.complete(data, function (res) {
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

						if(res.reason === 'admin_emails_are_the_same') {
							$scope.step = 4;
							return ngToast.danger('Você precisa informar e-mails diferentes para o gestor político e o coordenador operacional');
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