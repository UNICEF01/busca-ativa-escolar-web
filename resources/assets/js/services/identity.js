(function() {

	angular.module('BuscaAtivaEscolar').service('Identity', function ($q, $rootScope, $location, $localStorage) {

		var tokenProvider = null;
		var userProvider = null;

		$localStorage.$default({
			identity: {
				is_logged_in: false,
				current_user: {},
			}
		});

		function setup() {
			//console.info("[core.identity] Setting up identity service...");
			refreshIdentity();
		}

		function setTokenProvider(callback) {
			tokenProvider = callback;
		}

		function setUserProvider(callback) {
			userProvider = callback;
		}

		function isUserType(type) {
			if(!getCurrentUser()) return false;
			if(!getCurrentUser().type) return false;
			return getCurrentUser().type === type;
		}

		function hasTenant() {
			if(!getCurrentUser()) return false;
			return !!getCurrentUser().tenant;
		}

		function provideToken() {

			if(!tokenProvider) {
				console.error("[core.identity] No token provider registered! Rejecting...");
				return $q.reject('no_token_provider');
			}

			return tokenProvider();
		}

		function refreshIdentity() {
			if(!isLoggedIn() || !$localStorage.session.user_id) {
				//console.log("[core.identity] No identity found in session, user is logged out");
				$rootScope.$broadcast('Identity.ready');
				return;
			}

			//console.log("[core.identity] Refreshing current identity details...");

			$localStorage.identity.current_user = userProvider($localStorage.session.user_id, function(details) {
				//console.log("[core.identity] Identity details ready: ", details);
				$rootScope.$broadcast('Identity.ready');
			})
		}

		function getCurrentUser() {
			return ($localStorage.identity.current_user && $localStorage.identity.current_user.id)
				? $localStorage.identity.current_user
				: {};
		}

		function getCurrentTenant() {
			var user = getCurrentUser();
			if(!user) return null;
			return user.tenant;
		}

		function getCurrentUserID() {
			return ($localStorage.identity.current_user && $localStorage.identity.current_user.id)
				? $localStorage.identity.current_user.id
				: null;
		};

		function setCurrentUser(user) {
			if(!user) clearSession();

			$rootScope.$broadcast('identity.connected', {user: user});

			//console.log("[identity] Connected user: ", user);

			$localStorage.identity.is_logged_in = true;
			$localStorage.identity.current_user = user;

			if(window.ga) {
				window.ga('set', 'userId', user.id);
			}

			refreshIdentity();
		}

		function can(operation) {
			var user = getCurrentUser();

			if(!isLoggedIn()) return false;
			if(!user) return false;
			if(!user.permissions) return false;

			return user.permissions.indexOf(operation) !== -1;
		}

		function getType() {
			if(isLoggedIn()) return getCurrentUser().type;
			return 'guest';
		}

		function isLoggedIn() {
			return ($localStorage.identity) ? !!$localStorage.identity.is_logged_in : false;
		}

		function lgpdSigned () {
			console.log('ola')
			return ($localStorage.identity) ? !!$localStorage.identity.current_user.lgpd : false;
		}

		function disconnect() {
			//console.log('[identity] Disconnecting identity...');

			clearSession();

			$rootScope.$broadcast('identity.disconnect');
			$location.path('/login');
		}

		function clearSession() {
			//console.log("[identity] Clearing current session");

			Object.assign($localStorage, {
				identity: {
					is_logged_in: false,
					current_user: {},
				}
			});
		}

		function manageImports(){
			if ( isLoggedIn() ){

				if( getType() == "coordenador_operacional" ){
					return true;
				}

				if ( getType() == "supervisor_institucional" && "group" in getCurrentUser() && getCurrentUser().group.is_primary){
					return true;
 				}

				return false;

			}else{
				return false;
			}

		}

		return {
			getCurrentUser: getCurrentUser,
			getCurrentTenant: getCurrentTenant,
			getCurrentUserID: getCurrentUserID,
			setCurrentUser: setCurrentUser,
			getType: getType,
			can: can,
			isLoggedIn: isLoggedIn,
			lgpdSigned: lgpdSigned,
			refresh: refreshIdentity,
			clearSession: clearSession,
			setup: setup,
			isUserType: isUserType,
			hasTenant: hasTenant,
			setTokenProvider: setTokenProvider,
			setUserProvider: setUserProvider,
			provideToken: provideToken,
			disconnect: disconnect,
			manageImports: manageImports
		}

	});

})();