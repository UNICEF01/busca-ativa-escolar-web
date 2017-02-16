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
			function getAllowedMimeTypes() { return (data.Config) ? data.Config.uploads.allowed_mime_types: []; }

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
				isReady: isReady,
				getNumChains: getNumChains,
				getDataFile: getDataFile,
			};

		})
		.run(function (StaticData) {
			StaticData.refresh();
		});
})();