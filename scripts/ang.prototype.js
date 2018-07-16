if(typeof String.format === 'undefined'){
    
    String.prototype.format = function(){
        let lResult = this.toString();
        for (var i = 0; i < arguments.length; i++) {
            let lArgValue = '';
            if(arguments[i] != null){
                lArgValue = arguments[i].toString();
            }
            
            lResult = lResult.replace('{' + i.toString() + '}', lArgValue)
        }
        return lResult;
    }
}

if(typeof Number.formatPrice === 'undefined' ){

    Number.prototype.formatPrice = function($currency){
        $currency = ($currency==undefined)?'':$currency;
        let lResult = this.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1 ');
        lResult = '${0}'.translate().format(lResult);
        return lResult;
    }

}



if(typeof String.translate === 'undefined'){
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
                        return $locales[$lang][$domain][$key];
                    }
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