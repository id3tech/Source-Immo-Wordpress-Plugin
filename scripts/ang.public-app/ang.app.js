var ImmoDbApp = angular.module('ImmoDb', ['ngSanitize','angularMoment']);

ImmoDbApp.run(function(amMoment) {
	amMoment.changeLocale(immodbCtx.locale);
});