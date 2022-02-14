var siApp = angular
	.module('siApplication', ['ngSanitize','angularMoment'])
	.config(function($locationProvider) {
		siContextInit();
		//$locationProvider.html5Mode(true);
    });
siApp.run(function(amMoment) {
	amMoment.changeLocale(siCtx.locale);
});

siApp.addCustomExtension = function($key, $instance){
	if(siApp.$customExtensions == undefined) siApp.$customExtensions = [];
	if($instance.prototype instanceof SiCustomExtension){
		console.log($key, 'is not a valid custom extension');
		return;
	}
	
	siApp.$customExtensions.push({
		key: $key,
		instance: $instance
	});
}

class SiCustomExtension{

	init($rootScope,$siDictionary, $siUtils,$siHooks,$siConfig){}

	get_locale($lang){return {}}
}