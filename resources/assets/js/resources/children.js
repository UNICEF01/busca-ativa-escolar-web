(function() {
	angular
		.module('BuscaAtivaEscolar')
		.factory('Children', function Children(API, Identity, $resource) {

			var headers = API.REQUIRE_AUTH;

			var Children = $resource(API.getURI('children/:id?XDEBUG_SESSION_START=PHPSTORM'), {id: '@id'}, {
				find: {method: 'GET', headers: headers, params: {with: 'reopens'}},
				update: {method: 'POST', headers: headers},
				search: {url: API.getURI('children/search?XDEBUG_SESSION_START=PHPSTORM'), method: 'POST', isArray: false, headers: headers},
				export: {url: API.getURI('children/export'), method: 'POST', isArray: false, headers: headers},
				getComments: {url: API.getURI('children/:id/comments'), isArray: false, method: 'GET', headers: headers},
				getMap: {url: API.getURI('children/map'), isArray: false, method: 'GET', headers: headers},
				getAttachments: {url: API.getURI('children/:id/attachments'), isArray: false, method: 'GET', headers: headers},
				getActivity: {url: API.getURI('children/:id/activity'), isArray: false, method: 'GET', headers: headers},
				postComment: {url: API.getURI('children/:id/comments'), method: 'POST', headers: headers},
				removeAttachment: {url: API.getURI('children/:id/attachments/:attachment_id'), method: 'DELETE', headers: headers, params: {id: '@id', attachment_id: '@attachment_id'}},
				spawnFromAlert: {method: 'POST', headers: headers},
				cancelCase: {url: API.getURI('cases/:id/cancel'), params: {id: '@case_id'}, method: 'POST', headers: headers},
				reopenCase: {url: API.getURI('cases/:id/reopen'), params: {id: '@case_id'}, method: 'POST', headers: headers},
				requestReopenCase: {url: API.getURI('cases/:id/request-reopen'), params: {id: '@case_id'}, method: 'POST', headers: headers},
				requestTranferCase: {url: API.getURI('cases/:id/request-reopen'), params: {id: '@case_id'}, method: 'POST', headers: headers}
			});
			return Children;
		});
})();