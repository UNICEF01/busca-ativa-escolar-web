(function() {

	angular.module('BuscaAtivaEscolar')
		.config(function ($stateProvider) {
			$stateProvider.state('school_browser', {
				url: '/schools',
				templateUrl: '/views/schools/school_browser.html',
				controller: 'SchoolBrowserCtrl'
			})
		})
		.controller('SchoolBrowserCtrl', function ($scope, $rootScope, ngToast, API, Config, Platform, Identity, Users, Groups, Tenants, StaticData) {
            
            $scope.schools = [
                {
                    "id": "41356047",
                    "name": "ZUMBI DOS PALMARES E M EI EF",
                    "uf_id": "41",
                    "uf": "PR",
                    "region": "SU",
                    "city_id": "a6995283-46f9-50b0-afba-f7d4e4147835",
                    "city_name": "LONDRINA",
                    "city_ibge_id": "4113700",
                    "metadata": null,
                    "created_at": null,
                    "updated_at": null,
                    "deleted_at": null
                },
                {
                    "id": "41372859",
                    "name": "ZUMBI DOS PALMARES C E EF M PROFIS",
                    "uf_id": "41",
                    "uf": "PR",
                    "region": "SU",
                    "city_id": "cce99cd4-7485-58f6-892a-51c6a10fbded",
                    "city_name": "COLOMBO",
                    "city_ibge_id": "4105805",
                    "metadata": null,
                    "created_at": null,
                    "updated_at": null,
                    "deleted_at": null
                },
                {
                    "id": "41597940",
                    "name": "ZUMBI DOS PALMARES C E C EF M",
                    "uf_id": "41",
                    "uf": "PR",
                    "region": "SU",
                    "city_id": "19e43720-2a76-5be8-8525-0863082da418",
                    "city_name": "PALMITAL",
                    "city_ibge_id": "4117800",
                    "metadata": null,
                    "created_at": null,
                    "updated_at": null,
                    "deleted_at": null
                },
                {
                    "id": "41154100",
                    "name": "ZUMBI DOS PALMARES - E M DO CAMPO - EI EF",
                    "uf_id": "41",
                    "uf": "PR",
                    "region": "SU",
                    "city_id": "e61d114e-f8f9-5766-8d3b-6b9b493c3447",
                    "city_name": "CASCAVEL",
                    "city_ibge_id": "4104808",
                    "metadata": null,
                    "created_at": null,
                    "updated_at": null,
                    "deleted_at": null
                },
                {
                    "id": "41065824",
                    "name": "ZULMIRO TRENTO E E DO C EF",
                    "uf_id": "41",
                    "uf": "PR",
                    "region": "SU",
                    "city_id": "a54e9ebf-816c-5b9c-b7f6-46eebcb2ecaf",
                    "city_name": "MARECHAL CÂNDIDO RONDON",
                    "city_ibge_id": "4114609",
                    "metadata": null,
                    "created_at": null,
                    "updated_at": null,
                    "deleted_at": null
                },
                {
                    "id": "35901222",
                    "name": "ZULMIRO ALVES DE SIQUEIRA",
                    "uf_id": "35",
                    "uf": "SP",
                    "region": "SE",
                    "city_id": "abe531b0-faa1-5b6f-8990-907d5d7134dc",
                    "city_name": "JARINU",
                    "city_ibge_id": "3525201",
                    "metadata": null,
                    "created_at": null,
                    "updated_at": null,
                    "deleted_at": null
                },
                {
                    "id": "35271861",
                    "name": "ZULMIRA VIVAN PINTO CRECHE MUNICIPAL",
                    "uf_id": "35",
                    "uf": "SP",
                    "region": "SE",
                    "city_id": "af6f5384-a238-59dd-ad53-1b8ca6cf6d92",
                    "city_name": "PARDINHO",
                    "city_ibge_id": "3536109",
                    "metadata": null,
                    "created_at": null,
                    "updated_at": null,
                    "deleted_at": null
                },
                {
                    "id": "23148799",
                    "name": "ZULMIRA SIEBRA LEITE EEIEF",
                    "uf_id": "23",
                    "uf": "CE",
                    "region": "NE",
                    "city_id": "12a49e53-2665-56dc-b9bf-ddf6aa8b7f67",
                    "city_name": "VÁRZEA ALEGRE",
                    "city_ibge_id": "2314003",
                    "metadata": null,
                    "created_at": null,
                    "updated_at": null,
                    "deleted_at": null
                },
                {
                    "id": "35223554",
                    "name": "ZULMIRA PRANDI GRIGOLLI PROFA EMEI",
                    "uf_id": "35",
                    "uf": "SP",
                    "region": "SE",
                    "city_id": "058c9eb1-c6e8-5272-b4fe-39ecd39a20ec",
                    "city_name": "MATÃO",
                    "city_ibge_id": "3529302",
                    "metadata": null,
                    "created_at": null,
                    "updated_at": null,
                    "deleted_at": null
                },
                {
                    "id": "35242469",
                    "name": "ZULMIRA MORAES LEGASPE MAMEDE EMEF",
                    "uf_id": "35",
                    "uf": "SP",
                    "region": "SE",
                    "city_id": "c314212d-e28f-5713-924b-4b2c11f28250",
                    "city_name": "AGUAÍ",
                    "city_ibge_id": "3500303",
                    "metadata": null,
                    "created_at": null,
                    "updated_at": null,
                    "deleted_at": null
                },
                {
                    "id": "41044681",
                    "name": "ZULMIRA MARCHESI SILVA C E EF M",
                    "uf_id": "41",
                    "uf": "PR",
                    "region": "SU",
                    "city_id": "b1ee6d9f-2720-539e-982d-2bc2ac9eb6ee",
                    "city_name": "CORNÉLIO PROCÓPIO",
                    "city_ibge_id": "4106407",
                    "metadata": null,
                    "created_at": null,
                    "updated_at": null,
                    "deleted_at": null
                },
                {
                    "id": "35231435",
                    "name": "ZULMIRA GIRARDI NAZAR CRECHE MUNICIPAL",
                    "uf_id": "35",
                    "uf": "SP",
                    "region": "SE",
                    "city_id": "9511aa0e-783d-5a23-af61-b27df5661526",
                    "city_name": "BATATAIS",
                    "city_ibge_id": "3505906",
                    "metadata": null,
                    "created_at": null,
                    "updated_at": null,
                    "deleted_at": null
                }
            ];

		});

})();