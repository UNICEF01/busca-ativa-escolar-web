(function () {
    angular
        .module('BuscaAtivaEscolar')
        .factory('StaticData', function StaticData(API, Identity, $rootScope, $http) {

            var data = {};

            var dataFile = API.getURI('static/static_data?version=latest');
            var $promise = {};

            // TODO: cache this?

            function fetchLatestVersion() {
                $promise = $http.get(dataFile).then(onFetch);
            }

            function refresh() {
                // TODO: validate timestamp?
                fetchLatestVersion();
            }

            function onFetch(res) {
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

            function getAlertCauses() { return (data.AlertCause) ? orderMotives(data.AlertCause) : []; }

            function getVisibleAlertCauses() { return (data.VisibleAlertCause) ? orderMotives(data.VisibleAlertCause) : []; }

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

                angular.forEach(data.UFsByCode, function (uf) {
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

            function getAllowedMimeTypes() { return (data.Config) ? data.Config.uploads.allowed_mime_types : ['image/jpeg', 'image/png']; }

            function getPermissions() { return (data.Permissions) ? data.Permissions : {}; }

            function getUserTypeVisitantes() { return (data.UserTypeVisitantes) ? data.UserTypeVisitantes : []; }

            function getPermissionsFormForVisitante() { return (data.PermissionsFormForVisitante) ? data.PermissionsFormForVisitante : []; }

            function getCurrentUF() {
                var user = Identity.getCurrentUser();
                if (!user) return null;
                if (!user.uf) return null;

                return getUFByCode(user.uf);
            }

            function getNationalities() { return (data.Nationality) ? data.Nationality : []; }

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
                getPermissionsFormForVisitante: getPermissionsFormForVisitante,
                getNationalities: getNationalities
            };

        })
        .run(function (StaticData) {
            StaticData.refresh();
        });
})();