siApp
.filter('isIn', function(){
    return function($needle, $stack){
        if($needle==null || $needle==undefined){
            return false;
        }
        return $stack.indexOf($needle)>=0;
    }
});

siApp
.filter('translate', function(){
    return function($value){
        if($value == undefined) return '';
        if($value[$locales._current_lang_] != undefined){
            return $value[$locales._current_lang_];
        }
        return $value.toString().translate();
    }
});

siApp
.filter('math_floor', function(){
    return function($value){
        return Math.floor($value);
    }
});

siApp
.filter('toDashCase', function(){
    return function($value){
        if($value == undefined) return '';
        return $value.replace(/[A-Z]/,($c) => $c.toLowerCase()).replace(/(\s|_)/g,'-').replace(/[A-Z]/g, ($c) => '-' + $c.toLowerCase());
    }
})

siApp
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
});

siApp
.filter('siRelativePath', function(){
    return function($path){
        return $path.replace('~', wpSiApiSettings.base_path)
    }
})

siApp
.filter('siElementExists', function(){
    return function($element){
        return document.querySelectorAll($element).length > 0
    }
})

siApp
.filter('siRoutePreview', ['$sce', function($sce){
    return function($route){
        const sanitizedRoute = $route.replace(/(\{\{([^\}]+)\}\})/gi, (m,g,g2) => {
            //console.log('route part',g, m, g2);
            return '<em>' + g2.split('.').last() + '</em>';
        })
        return $sce.trustAsHtml("/" + sanitizedRoute);
    }
}])

siApp
.filter('pluginRootRelative', function(){
    return function($path){
        return wpSiApiSettings.base_path + $path;
    }
})