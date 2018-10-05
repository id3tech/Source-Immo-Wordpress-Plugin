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

});

ImmoDbApp
.filter('isIn', function(){
    return function($needle, $stack){
        if($needle==null || $needle==undefined){
            return false;
        }
        return $stack.indexOf($needle)>=0;
    }
});

ImmoDbApp
.filter('truncate', function(){
    return function($source, $limit){
        let lResult = $source;
        if(lResult){
            if(lResult.length > $limit){
                lResult = lResult.substr(0,$limit/2) + '...' + lResult.substr(lResult.length - ($limit/2));
                
            }
        }

        return lResult;
    }
})
