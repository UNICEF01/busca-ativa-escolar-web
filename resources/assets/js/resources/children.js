(function() {
	angular
		.module('BuscaAtivaEscolar')
		.factory('Children', function Children(API, Identity, $resource) {

			var headers = API.REQUIRE_AUTH;

			var Children = $resource(API.getURI('children/:id'), {id: '@id'}, {
				find: {method: 'GET', headers: headers, params: {with: 'currentStep'}},
				update: {method: 'POST', headers: headers},
				search: {url: API.getURI('children/search'), method: 'POST', isArray: false, headers: headers},
				export: {url: API.getURI('children/export'), method: 'POST', isArray: false, headers: headers},
                getComment: {url: API.getURI('children/:child_id/comments/:comment_id'), method: 'GET', headers: headers, params: {child_id: '@child_id', comment_id: '@comment_id'}},
				getComments: {url: API.getURI('children/:id/comments'), isArray: false, method: 'GET', headers: headers},
				removeComment: {url: API.getURI('children/:child_id/comments/:comment_id'), method: 'DELETE', headers: headers, params: {child_id: '@child_id', comment_id: '@comment_id'}},
				getMap: {url: API.getURI('children/map'), isArray: false, method: 'GET', headers: headers},
				getAttachments: {url: API.getURI('children/:id/attachments'), isArray: false, method: 'GET', headers: headers},
				getActivity: {url: API.getURI('children/:id/activity'), isArray: false, method: 'GET', headers: headers},
				postComment: {url: API.getURI('children/:id/comments'), method: 'POST', headers: headers},
                updateComment: {url: API.getURI('children/:id/comments'), method: 'PUT', headers: headers},
				removeAttachment: {url: API.getURI('children/:id/attachments/:attachment_id'), method: 'DELETE', headers: headers, params: {id: '@id', attachment_id: '@attachment_id'}},
				spawnFromAlert: {method: 'POST', headers: headers},
				cancelCase: {url: API.getURI('cases/:id/cancel'), params: {id: '@case_id'}, method: 'POST', headers: headers}
			});

			return Children;
		});
})();