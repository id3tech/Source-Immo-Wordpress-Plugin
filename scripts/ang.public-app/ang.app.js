var siApp = angular
	.module('siApplication', ['ngSanitize','angularMoment'])
	.config(function($locationProvider) {
    });

siApp.run(function(amMoment) {
	amMoment.changeLocale(siCtx.locale);
});