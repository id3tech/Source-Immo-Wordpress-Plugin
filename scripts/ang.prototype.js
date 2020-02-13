if(typeof String.format === 'undefined'){
    
    String.prototype.format = function(){
        let lResult = this.toString();
        for (var i = 0; i < arguments.length; i++) {
            let lArgValue = '';
            if(arguments[i] != null){
                lArgValue = arguments[i].toString();
            }
            let lRegExp = new RegExp('\\{' + i.toString() + '\\}', 'g');
            lResult = lResult.replace(lRegExp, lArgValue)
        }

        // clear any format tag left
        let lRegExp = /\{\d+\}/g;
        lResult = lResult.replace(lRegExp,'');

        return lResult;
    }
}

if(typeof [].last === 'undefined' ){
    Array.prototype.last = function(){
        if(this.length == 0) return null;
        return this[this.length - 1];
    }
}

if(typeof Number.formatPrice === 'undefined' ){

    Number.prototype.formatPrice = function($currency){
        let lValue = this;
        lValue = Math.round(lValue * 100) / 100;
        $currency = ($currency==undefined)?'':$currency;
        $separator = {
            fr : ' ',
            en : ','
        };


        let lResult = lValue.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + $separator[$locales._current_lang_]);
        lResult = '${0}'.translate().format(lResult);
        return lResult;
    }

}

if(typeof Number.formatRank === 'undefined' ){

    Number.prototype.formatRank = function(){
        let lValue = this;
        let lFormat = '{0}th';
        switch(lValue % 10){
            case 1:
                lFormat = '{0}st';
                break;
            case 2:
                lFormat = '{0}nd';
                break;
            case 3:
                lFormat = '{0}rd';
                break;
        }
        
        lResult = lFormat.translate().format(lValue);
        return lResult;
    }

}

if(typeof isNullOrEmpty === 'undefined'){
    
    isNullOrEmpty = function($value){
        if($value == undefined) return true;
        if(typeof $value == 'undefined') return true;
        if($value == null) return true;
        if($value == '') return true;
        if(Array.isArray($value) && $value.length == 0) return true;
    }
}


if(typeof String.translate === 'undefined'){
    var $locales = {};
    (function locales($scope){
        $scope.supported_languages = ['fr','en'];
        $scope._current_lang_ = '';
        $scope.file_path = '';

        $scope.init = function($used_language){
            console.log('translate support', $used_language);
            // create language containers
            $scope.supported_languages.forEach(function($l){
                $scope[$l] = {};
            });

            $scope._current_lang_ = $used_language;
        }

        $scope.load = function($files,$domain){
            if(typeof $files.push == 'undefined'){
                $files = [$files];
            }

            if(typeof $domain == 'undefined'){
                $domain = 'global';
            }


            $files.forEach(function($f){
                $scope.loadJSON($f, function($response){
                    $scope[$scope._current_lang_][$domain] = $scope.merge_data($scope[$scope._current_lang_][$domain], $response);
                });
            });
        }


        $scope.merge_data = function(obj1,obj2){
            var obj3 = {};
            for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
            for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
            return obj3;
        }

        $scope.loadJSON = function(filePath, success, error){
            let xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function()
            {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status === 200) {
                        if (success)
                            // var lData = '';
                            // eval('lData = ' + xhr.responseText);
                            // success(lData);
                            success(JSON.parse(xhr.responseText));
                } else {
                    if (error)
                        error(xhr);
                    }
                }
            };
            xhr.open("GET", filePath, true);
            xhr.send();
        }
    })($locales);

    /**
     * Translate string using $locales datasheet
     * @param {string} $domain Optional. Domain in which to search for localized string
     * @param {string} $lang Optional. Forced lang to localize
     */
    String.prototype.translate = function ($domain, $lang) {
        if ($locales != undefined) {
            $domain = (typeof ($domain) == 'undefined') ? 'global' : $domain;
            $lang = (typeof ($lang) == 'undefined') ? $locales._current_lang_ : $lang;
            $key = this.toString();
            if ($lang in $locales) {
                if ($domain in $locales[$lang]) {
                    if ($key in $locales[$lang][$domain]) {
                        //console.log($key, 'found in ',$locales[$lang][$domain])
                        return $locales[$lang][$domain][$key];
                    }
                }
                else if ($key in $locales[$lang]){
                    //console.log($key, 'found in ',$locales[$lang])
                    return $locales[$lang][$key];
                }
                else{
                    //console.log('"',$key,'" not found in', $locales[$lang]);
                }
            }
        }
        else{
            console.log('$locales is undefined');
        }
    
        return $key;
    }

}

if(typeof Number.between === 'undefined'){

    /**
     * Check if a number is between two others
     * @param {number} $lower 
     * @param {number} $upper 
     */
    Number.prototype.between = function($lower, $upper){
        return ( (this >= $lower) && (this <= $upper) );
    }

}

if(typeof Date.addMonths === 'undefined'){
    
    Date.prototype.round = function(){
        let lResult = new Date(this.getFullYear(), this.getMonth(), this.getDate());
        return lResult;
    }

    Date.prototype.addHours = function($value){
        let lResult = new Date(this.getTime());
        lResult.setTime(lResult.getTime() + ($value *60*60*1000));
        return lResult;
    }

    Date.prototype.addMonths = function($value){
        let lResult = new Date(this.getTime());
        lResult.setMonth(lResult.getMonth() + $value);
        return lResult;
    }

    Date.prototype.addDays = function($value){
        let lResult = new Date(this.getTime());
        lResult.setDate(lResult.getDate() + $value);
        return lResult;
    }

    Date.prototype.addYears = function($value){
        let lResult = new Date(this.getTime());
        lResult.setFullYear(lResult.getFullYear() + $value);
        return lResult;
    }
}

if(typeof $siGlobalHooks == 'undefined'){
    var $siGlobalHooks = {};
    (function($scope){
        $scope._filters = [];
        $scope._actions = [];

        $scope.addAction = function($key, $func, $priority,$unique){
            $unique = ($unique == undefined) ? false : $unique;

            let lNewAction = {key: $key, fn: $func};
            if($unique) $scope._actions = $scope._actions.filter(function($e) { return $e.key != $key});

            if($priority == undefined || $priority > $scope._actions.length - 1){
                $scope._actions.push(lNewAction);
            }
            else{
                $scope._actions.splice($priority, 0, lNewAction);
            }
        }
    
        $scope.addFilter = function($key, $func, $priority, $unique){
            $unique = ($unique == undefined) ? false : $unique;
            let lNewFilter = {key: $key, fn: $func};
            
            if($unique) $scope._filters = $scope._filters.filter(function($e) { return $e.key != $key});
            
            if($priority == undefined || $priority > $scope._filters.length - 1){
                $scope._filters.push(lNewFilter);
            }
            else{
                $scope._filters.splice($priority, 0, lNewFilter);
            }
        }
    
    })($siGlobalHooks);
}