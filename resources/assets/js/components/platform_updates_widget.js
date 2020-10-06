(function() {

	angular.module('BuscaAtivaEscolar').directive('widgetPlatformUpdates', function ($q, $http) {

		var repositories = [
			{label: 'api', name: 'lqdi/busca-ativa-escolar-api'},
			{label: 'panel', name: 'lqdi/busca-ativa-escolar-web'},
		];
		var baseURL = "https://api.github.com/repos/";

		var repositoryData = {};
		var commits = [];

		function init(scope, element, attrs) {
			repositoryData = {};
			commits = [];

			scope.commits = commits;
			refresh();
		}

		function refresh() {
			var queries = [];
			for(var i in repositories) {
				if(!repositories.hasOwnProperty(i)) continue;
				queries.push( fetchRepository(repositories[i]) );
			}

			$q.all(queries).then(parseRepositoryData)
		}

		function getCommitsURI(repo) {
			return baseURL + repo.name + '/commits';
		}

		function fetchRepository(repo) {
			//console.log("[widget.platform_updates] Getting latest commits for repository: ", repo);
			return $http.get(getCommitsURI(repo)).then(function (res) {
				if(!res.data) {
					console.error("[widget.platform_updates] Failed! ", res, repo);
					return;
				}

				console.info("[widget.platform_updates] Done! ", repo);
				repositoryData[repo.label] = res.data;
				return res.data;
			});
		}

		function parseRepositoryData() {
			//console.log("[widget.platform_updates] Parsing repository data...");

			for(var rl in repositoryData) {
				if(!repositoryData.hasOwnProperty(rl)) continue;

				for(var i in repositoryData[rl]) {
					if(!repositoryData[rl].hasOwnProperty(i)) continue;

					var c = repositoryData[rl][i];

					commits.push({
						id: c.sha,
						repo: rl,
						author: {
							name: c.commit.author.name,
							email: c.commit.author.email,
							username: c.author.login,
							avatar_url: c.author.avatar_url
						},
						date: c.commit.author.date,
						message: c.commit.message,
						url: c.html_url
					})
				}
			}
		}

		return {
			link: init,
			replace: true,
			templateUrl: '/views/components/platform_updates.html'
		};
	});

})();