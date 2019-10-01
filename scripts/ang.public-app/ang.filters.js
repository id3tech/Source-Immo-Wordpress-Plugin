
siApp
.filter('range', 
function rangeFilter(){
    return function($items, $lowerBound, $upperBound){
        if($items==null) return null;
        $items.forEach(function($e,$i){
            $e.index = $i;
        });
        let lRange = $upperBound - $lowerBound;
        
        if(lRange > $items.length){
            lRange = $items.length;
            $lowerBound = 0;
            $upperBound = $items.length - 1;
        }
        else if($lowerBound < 0){
            $lowerBound = 0;
            $upperBound = $lowerBound + lRange;
        }
        else if($upperBound > $items.length - 1){
            $upperBound = $items.length - 1;
            $lowerBound = $upperBound - lRange;
        }

        
        let lResult = $items.filter(function($e,$i){
            return ($lowerBound <= $i && $i < $upperBound);
        });
        
        return lResult;
    }
});

siApp
.filter('asArray', 
function asArrayFilter(){
    return function($object){
        let lResult = [];
        if($object){
            for(key in $object){
                if(typeof $object[key] !== 'function'){
                    $object[key].__$key = key;
                    lResult.push($object[key]);
                }
            }
        }
        
        return lResult;
    }
});

siApp
.filter('orderObjectBy', 
function orderObjectByFilter(){
    return function(input, attribute) {
        
        if (!angular.isObject(input)) return input;
        var array = [];
        for(var objectKey in input) {
            input[objectKey].__$key = objectKey;
            array.push(input[objectKey]);
        }
   
        array.sort(function(a, b){
            if(!isNaN(a[attribute])){
                a = parseInt(a[attribute]);
                b = parseInt(b[attribute]);
                return a - b;
            }
            else if (a[attribute] <= b[attribute]){
                return -1;
            }
            else{
                return 1;
            }
        });

        return array;
    }
});

siApp
.filter('textToHtml', [
function textToHtml(){
    return function($value){
        if($value == null || $value == undefined) return '';
        // check if the string is already html
        const tagRegex = /<[^>]+>/gm;
        $matches = tagRegex.exec($value);
        if($matches!=null && $matches.length > 0){
            return $value;
        }

        let lReplacements = [
            {match: /(\n+)/gm, by: '</p><p>', wrap_by: 'p'},
            {match: /(\n)/g, by: '<br />'},
        ];

        lReplacements.forEach(function($e){
            $value = $value.replace($e.match, $e.by);
            if($e.wrap_by != undefined){
                $value = '<' + $e.wrap_by + '>' + $value + '</' + $e.wrap_by + '>';
            }
        })

        return $value;
    }
}]);

siApp
.filter('siHasValue', ['$siUtils', function siHasValueFilter($siUtils){
    return function($values, $arrayOffset){
        return $siUtils.hasValue($values, $arrayOffset );
    }
}])

siApp
.filter('formatDimension', ['$siUtils', function dimensionFilter($siUtils){
    return function($value){
        return $siUtils.formatDimension($value);
    }
}]);

siApp
.filter('sanitize', ['$siUtils', function sanitize($siUtils){
    return function($value){
        return $siUtils.sanitize($value);
    }
}]);

siApp
.filter('iconFromType', ['$siUtils', 
function iconFromType($siUtils){
    return function($value){
        let lTypeIcons = {
            'listing' : 'home',
            'broker' : 'user',
            'city' : 'map-marker-alt'
        }
        return lTypeIcons[$value];
    }
}]);

siApp
.filter('wrapWith', ['$siUtils', 
function wrapWith(){
    return function($text, $tag, $search, $startingAt){
        $startingAt = (typeof $startingAg == 'undefined') ? 0 : $startingAt;
        if(typeof $search == 'undefined') return $text;
        
        if($text.search($search) < $startingAt) return $text;
        let lResult = $text;
        let lMatchText = $text.match($search)[0];
        let lTagWrap = '<' + $tag + '>' + lMatchText + '</' + $tag + '>';
        
        lResult = $text.replace($search, lTagWrap);
        
        return lResult;
    }
}]);


function $lateBind($callback){
    let $scope = {
        __callback : $callback
    };

    $scope.resolve = function(){
        $scope.__callback
    }

    $scope.then = function($listener){
        $scope.__callback($listener);
    }

    return $scope;
};

const findProperty = function($source, $path){
    let lPathParts = $path.split('.');
    let lCursor = $source;
    let lResult = null;
    lPathParts.forEach(function($e){
        //console.log(lCursor, $e);
        if(typeof lCursor[$e] != 'undefined'){
            lCursor = lCursor[$e];
            lResult = lCursor;
        }
        else{
            lResult = null;
        }
    });

    return lResult;
};