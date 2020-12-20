(function () {

    angular.module('BuscaAtivaEscolar').controller('TenantSignupCtrl', function ($scope, $rootScope, $window, ngToast, Utils, TenantSignups, Cities, Modals, StaticData, API, Config) {

        $scope.static = StaticData;

        $scope.step = 1;
        $scope.numSteps = 5;
        $scope.isCityAvailable = false;

        $scope.stepChecks = [false, false, false, false];
        $scope.stepsNames = ['Cadastre o município', 'Cadastre o(a) prefeito(a)', 'Gestor(a) Político', 'Termo de Adesão'];

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
            personal_mobile: 'celular pessoal',
            //link_titulo: 'Documento com foto'
        };

        var messages = {
            invalid_gp: 'Dados do(a) gestor(a) político incompletos! Campos inválidos: ',
            invalid_mayor: 'Dados do(a) prefeito(a) incompletos! Campos inválidos: '
        };
        //Campos obrigatórios do formulario
        var requiredAdminFields = ['email', 'name', 'cpf', 'dob', 'phone'];
        //var requiredMayorFields = ['name', 'cpf', 'dob', 'phone', 'link_titulo'];
        var requiredMayorFields = ['name', 'cpf', 'dob', 'phone'];

        $scope.fetchCities = function (query) {
            var data = {name: query, $hide_loading_feedback: true};
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

            if ($scope.step === 3 && !Utils.isValid($scope.form.admin, requiredAdminFields, fieldNames, messages.invalid_gp)) return;
            if ($scope.step === 2 && !Utils.isValid($scope.form.mayor, requiredMayorFields, fieldNames, messages.invalid_mayor)) return;
            if ($scope.step === 3 && !Utils.haveEqualsValue('Os CPFs', [$scope.form.admin.cpf, $scope.form.mayor.cpf])) return;
            if ($scope.step === 3 && !Utils.haveEqualsValue('Os nomes', [$scope.form.admin.name, $scope.form.mayor.name])) return;

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

            Cities.checkIfAvailable({id: city.id}, function (res) {
                $scope.hasCheckedAvailability = true;
                $scope.isCityAvailable = !!res.is_available;
            });
        };

        $scope.finish = function (step) {
            if (!$scope.agreeTOS) return;

            var data = {};
            data.admin = Object.assign({}, $scope.form.admin);
            data.mayor = Object.assign({}, $scope.form.mayor);
            data.city = Object.assign({}, $scope.form.city);

            if (!Utils.isValid(data.admin, requiredAdminFields, messages.invalid_gp)) return;
            if (!Utils.isValid(data.mayor, requiredMayorFields, messages.invalid_mayor)) return;

            data.city_id = (data.city) ? data.city.id : null;
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
                    return ngToast.danger('O e-mail indicado para o(a) gestor(a) político já está em uso. Por favor, escolha outro e-mail');
                }

                if (res.reason === 'invalid_political_admin_data') {
                    $scope.step = 2;
                    ngToast.danger(messages.invalid_gp);

                    return Utils.displayValidationErrors(res);
                }

                ngToast.danger("Ocorreu um erro ao registrar a adesão: " + res.reason);

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

    });

})();