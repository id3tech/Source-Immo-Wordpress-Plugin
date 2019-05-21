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
