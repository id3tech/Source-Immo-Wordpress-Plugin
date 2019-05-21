var siApp = angular.module('siApplication', ['ngSanitize','angularMoment']);

siApp.run(function(amMoment) {
	amMoment.changeLocale(siCtx.locale);
});