(function() {
	angular
		.module('BuscaAtivaEscolar')
		.service('Auth', function Auth($q, $rootScope, $localStorage, $http, $resource, $state, Modals, API, Identity, Config) {

			var self = this;

			$localStorage.$default({
				session: {
					user_id: null,
					token: null,
					token_expires_at: null,
					refresh_expires_at: null
				}
			});

			function requireLogin(reason) {
				return Modals.show(Modals.Login(reason, false));
			}

			function provideToken() {

				// TODO: refresh with endpoint if first time on page

				// Isn't even logged in
				if(!Identity.isLoggedIn()) return requireLogin('Você precisa fazer login para realizar essa ação!');

				// Check if session is valid
				if(!$localStorage.session.token || !$localStorage.session.user_id) return $q.go('login');

				// Has valid token
				if(!isTokenExpired()) return $q.resolve($localStorage.session.token);

				console.log("[auth::token.provide] Token expired! Refreshing...");

				// Is logged in, but both access and refresh token are expired
				if(isRefreshExpired()) {
					console.log("[auth::token.provide] Refresh token also expired! Logging out...");
					return requireLogin('Sua sessão expirou! Por favor, entre seus dados novamente para continuar.');
				}

				// Is logged in, access token expired but refresh token still valid
				return self.refresh().then(function (session) {
					console.log("[auth::token.provide] Refreshed, new tokens: ", session);
					return session.token;
				});

			}

			function isTokenExpired() {
				var now = (new Date()).getTime();
				return !Identity.isLoggedIn() || (now >= $localStorage.session.token_expires_at);
			}

			function isRefreshExpired() {
				var now = (new Date()).getTime();
				return !Identity.isLoggedIn() || (now >= $localStorage.session.refresh_expires_at);
			}

			function handleAuthResponse(response) {

				if(response.status !== 200) {
					console.log("[auth::login] Rejecting Auth response! Status= ", response.status);
					return $q.reject(response.data);
				}

				if(!response.data || !response.data.token) {
					throw new Error("invalid_token_response");
				}

				$localStorage.session.token = response.data.token;
				$localStorage.session.token_expires_at = (new Date()).getTime() + (Config.TOKEN_EXPIRES_IN * 1000);
				$localStorage.session.refresh_expires_at = (new Date()).getTime() + (Config.REFRESH_EXPIRES_IN * 1000);

				// Auth.refresh doesn't return user/user_id, so we can't always set it
				if(response.data.user) {
					Identity.setCurrentUser(response.data.user);
					$localStorage.session.user_id = response.data.user.id;
				}

				validateSessionIntegrity();

				$rootScope.$broadcast('auth.logged_in');

				return $localStorage.session;
			}

			function validateSessionIntegrity() {
				if(!$localStorage.session || !$localStorage.session.user_id || !$localStorage.session.token) {
					throw new Error("invalid_session_integrity");
				}
			}

			function handleAuthError(response) {

				console.error("[auth::login] API error: ", response);

				if(!response || !response.status || !API.isUseableError(response.status)) {
					console.warn("[auth::login] Error code ", response.status, " not in list of useable errors: ", useableErrors);
					$rootScope.$broadcast('auth.error', response);
				}

				throw (response.data) ? response.data : response;
			}

			this.provideToken = provideToken;
			this.requireLogin = requireLogin;
			this.isTokenExpired = isTokenExpired;
			this.isRefreshExpired = isRefreshExpired;

			this.isLoggedIn = function() {
				return Identity.isLoggedIn();
			};

			$rootScope.$on('identity.disconnect', this.logout);

			this.logout = function() {
				console.log('[auth] Logging out...');

				Object.assign($localStorage, {
					session: {
						user_id: null,
						token: null,
						token_expires_at: null,
						refresh_expires_at: null
					}
				});

				Identity.disconnect();

				$rootScope.$broadcast('auth.logged_out');
			};

			this.login = function(email, password) {

				var tokenRequest = {
					grant_type: 'login',
					email: email,
					password: password
				};

				var options = {
					accept: 'application/json',
				};

				return $http
					.post(API.getTokenURI(), tokenRequest, options)
					.then(handleAuthResponse, handleAuthError);
			};

			this.refresh = function() {

				var tokenRequest = {
					grant_type: 'refresh',
					token: $localStorage.session.token
				};

				var options = {
					accept: 'application/json',
				};

				return $http
					.post(API.getTokenURI(), tokenRequest, options)
					.then(handleAuthResponse, handleAuthError);
			};

		})
		.run(function (Identity, Users, Auth) {
			Identity.setTokenProvider(Auth.provideToken);
			Identity.setUserProvider(function(user_id, callback) {
				if(!user_id) return;

				var user = Users.myself({with: 'tenant'});
				user.$promise.then(callback);

				return user;
			});

			Identity.setup();
		})

})();