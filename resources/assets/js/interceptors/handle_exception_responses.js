(function() {
	angular
		.module('BuscaAtivaEscolar')
		.service('HandleExceptionResponsesInterceptor', function (Utils) {

			function handleResponse(response) {

				if(!response) return response;
				if(!response.data) return response;
				if(!response.data.reason) return response;
				if(response.data.reason !== 'exception') return response;

				var knownRootPaths = [
					'/home/vagrant/projects/busca-ativa-escolar-api/',
					'/home/forge/api.busca-ativa-escolar.dev.lqdi.net/'
				];

				if(response.data.exception.stack) {
					console.error('[interceptors.api_exception] [debug=on] API error: ', response.data.exception.message);
					console.warn('[interceptors.api_exception] [debug=on] Original HTTP call: ', response.config.method, response.config.url, response.config.data);

					var messages = Utils.renderCallStack(response.data.exception.stack, knownRootPaths);

					if(messages) {

						console.group('[interceptors.api_exception] [debug=on] Error stack below: ');

						for(var i in messages) {
							if(!messages.hasOwnProperty(i)) continue;
							//console.log(messages[i]);
						}

						console.endGroup();
					}

					return response;
				}

				//console.log('[interceptors.api_exception] [debug=off] API error: ', response.data.exception);

				return response;

			}

			this.response = handleResponse;
			this.responseError = handleResponse;

		});

})();