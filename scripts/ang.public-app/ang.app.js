var siApp = angular
	.module('siApplication', ['ngSanitize','angularMoment'])
	.config(function($locationProvider) {
		//$locationProvider.html5Mode(true);
    });

siApp.run(function(amMoment) {
	amMoment.changeLocale(siCtx.locale);
});