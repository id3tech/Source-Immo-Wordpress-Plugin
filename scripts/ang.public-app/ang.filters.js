
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
        const lResult = [];
        if($object){
            Object.keys($object).forEach(function($k){
                $object[$k].__$key = $k;
                lResult.push($object[$k]);
            });
            // for(key in $object){
            //     if(typeof $object[key] !== 'function'){
            //         $object[key].__$key = key;
            //         lResult.push($object[key]);
            //     }
            // }
        }
        
        return lResult;
    }
});

siApp
.filter('orderObjectBy', 
function orderObjectByFilter(){
    return function(input, attribute) {
        
        if (!angular.isObject(input)) return input;
        const lResult = [];
        Object.keys(input).forEach(function($k){
            input[$k].__$key = $k;
            lResult.push(input[$k]);
        });
           
        lResult.sort(function(a, b){
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

        return lResult;
    }
});

siApp
.filter('textToHtml', [
function textToHtml(){
    return function($value, $level){
        if($value == null || $value == undefined) return '';
        $level = $level == undefined ? 2 : $level;

        // check if the string is already html
        const tagRegex = /<[^>]+>/gm;
        $matches = tagRegex.exec($value);
        if($matches!=null && $matches.length > 0){
            return $value;
        }

        // split text by lines
        const lTextArr = $value.split("\n");
        console.log('textToHtml', lTextArr);

        const lFormat = [
            function(){
                return lTextArr.map(
                    function($line, $index){
                        return $line;
                    }
                )
            },

            // Level 1: Format by adding <br> at the end of each line
            function(){
                return lTextArr.map(
                    function($line, $index){
                        return $line + '<br />';
                    }
                )
            },

            // Level 2: Format by adding <br> on empty lines and <br> before line beginning by -, ** or *
            function(){
                return lTextArr.map(function($line, $index){
                        $line = $line.replace(/\r/gm,'').trim();
                        console.log('textToHtml@lineFormat', $line, $line == '');
                        if($line == '') return '<br />';
                        if($index > 0 && ['+','-','**','*'].some(function($c){ return $line.indexOf($c)==0})) return '<br />' + $line;

                        return $line;
                    }
                )
            },

            // Level 3: Format by closing/opening paragraph on empty lines and <br> before line beginning by +, -, ** or *
            function(){
                return lTextArr.map(
                    function($line, $index){
                        $line = $line.replace(/\r/gm,'').trim();
                        console.log('textToHtml@lineFormat', $line, $line == '');
                        const lPreviousLine = ($index==0) ? '': (lTextArr[$index-1]).replace(/\r/gm,'');

                        if($line == '') return '</p><p>';
                        if($index > 0 && lPreviousLine != '' && ['+','-','**','*'].some(function($c){ return $line.indexOf($c)==0})) return '<br />' + $line;

                        return $line;
                    }
                )
            },

            // Level 4: Format replacing -,* by <li> and # by title
            function(){
                return lTextArr.map(function($line, $index){
                    $line = $line.replace(/\r/gm,'');
                    console.log('textToHtml@lineFormat', $line, $line == '');
                    if($line == '') return '</p><p>';

                    const lPreviousLine = ($index==0) ? '': (lTextArr[$index-1]).replace(/\r/gm,'');
                    const lNextLine = ($index == lTextArr.length-1) ? '' : (lTextArr[$index+1]).replace(/\r/gm,'');

                    const lListChars = ['+','-','**','*'];
                    if(lListChars.some(function($c){ return $line.indexOf($c)==0})){
                        lListChars.forEach(function($c){ $line = $line.replace($c,'').trim()});
                        $line  = '<li>' + $line;
                    }
                    
                    const lTitleChars = ['####','###','##','#'];
                    lTitleChars.forEach(function($c){ 
                        if($line.indexOf($c)>=0){
                            const lLen = $c.length;
                            $line = $line.replace($c,'').trim()
                            $line = '<h' + lLen + '>' + $line + '</h'+ lLen + '>';
                        }
                    });

                    return $line;
                })
            }
        ];

        

        
        const lFormatTextArr = lFormat[$level]();
        
        $value = '<p>' + lFormatTextArr.join(" ") + '</p>';
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
.filter('filesize', ['$siUtils', function filesize($siUtils){
    return function($value){
        return $siUtils.filesize($value);
    }
}])


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
            'city' : 'map-marker-alt',
            'region' : 'directions'
        }
        return lTypeIcons[$value];
    }
}]);

siApp
.filter('labelOf', ['$siUtils', 
function labelOf($siUtils){
    return function($value, $list){
        return $siUtils.labelOf($value, $list);
    }
}]);

siApp
.filter('captionOf', ['$siUtils',
function captionOf($siUtils){
    return function($value,$domain){
        return $siUtils.getCaption($value, $domain);
    }
}])

siApp
.filter('timeLength', ['$siUtils',
function timeLength($siUtils){
    return function($value){
        return $siUtils.timeLength($value);
    }
}])

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

siApp
.filter('translate', function(){
    return function($text){
        if($text == null) return '';
        if($text == undefined) return '';

        const lCurrentLocale = $locales._current_lang_;
        if(typeof($text) == 'object'){
            //console.log('translate object of', $text);

            if($text[lCurrentLocale] != undefined) return $text[lCurrentLocale];
            return $text[Object.keys($text)[0]];
        }
        else{
            //console.log('translate string of', $text, );
        }

        return $text.toString().translate();
    }
})

siApp
.filter('siElementExists', function(){
    return function($element){
        return document.querySelectorAll($element).length > 0
    }
})

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