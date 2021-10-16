(function () {
  identify('config', 'on_init.js');

  angular
    .module('BuscaAtivaEscolar')
    .run(function (
      $cookies,
      $rootScope,
      $state,
      Identity,
      Auth,
      Config,
      StaticData
    ) {
      $.material.init();

      $rootScope.$on('unauthorized', function () {
        Auth.logout();
        $state.go('login');
      });
    });
})();
