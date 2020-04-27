var siApp = angular.module('siApplication', ['ngRoute','ngMaterial', 'ngMessages','mdColorPicker','ngSanitize']);

siApp
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

});