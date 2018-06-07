var ImmoDbApp = angular.module('ImmoDb', ['ngRoute','ngMaterial', 'ngMessages']);

ImmoDbApp
.config(function ($routeProvider, $mdThemingProvider, $httpProvider, $mdAriaProvider) {
  // disable aria warnings (aka aria-label warning of hell)
  $mdAriaProvider.disableWarnings();

  // Theming
  $mdThemingProvider.theme('default')
      .primaryPalette('blue')
      .accentPalette('deep-orange');

  $mdThemingProvider.theme('docs-dark', 'default')
    .primaryPalette('blue')
    .dark();
})
