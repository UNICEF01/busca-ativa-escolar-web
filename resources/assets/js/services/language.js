(function() {

	var app = angular.module('BuscaAtivaEscolar');

	app.service('Language', function Language($q, $http, $rootScope, API) {

		var database = {};
		var langFile = API.getURI('language.json');
		var $promise = {};

		function setup() {
			//console.log("[platform.language] Setting up language service...");
			loadFromAPI();
		}

		function loadFromAPI() {
			//console.log("[platform.language] Loading language file...");
			$promise = $http.get(langFile).then(onDataLoaded);
		}

		function onDataLoaded(res) {
			if(!res.data || !res.data.database) {
				console.error("[platform.language] Failed to load language file: ", res);
				return;
			}

			database = res.data.database;

			//console.log("[platform.language] Language file loaded! ", Object.keys(database).length, " strings available: ", database);

			$rootScope.$broadcast('Language.ready');
		}

		function translate(word, key) {
			var stringID = key + "." + word;
			return string(stringID);
		}

		function string(stringID) {
			if(!database) return "DB_EMPTY:" + stringID;
			if(!database[stringID]) return "STR_MISSING:" + stringID;

			return database[stringID];
		}

		function getNumStrings() {
			return database.length ? database.length : 0;
		}

		function getLangFile() {
			return langFile;
		}

		function isReady() {
			return getNumStrings() > 0;
		}

		return {
			setup: setup,
			translate: translate,
			string: string,
			getNumStrings: getNumStrings,
			getLangFile: getLangFile,
			isReady: isReady,
		};

	});

	app.run(function (Language) {
		Language.setup();
	});

	app.filter('lang', function LanguageTranslateFilter(Language) {
		var $fn = function(word, key) {
			return Language.translate(word, key);
		};

		$fn.$stateful = true; // TODO: optimize so this is not needed

		return $fn;
	});

	app.filter('string', function LanguageStringFilter(Language) {
		var $fn =  function(stringID) {
			return Language.string(stringID);
		};

		$fn.$stateful = true; // TODO: optimize so this is not needed

		return $fn;
	});

})();