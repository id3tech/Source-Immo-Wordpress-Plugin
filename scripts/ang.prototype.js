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
        return lResult;
    }
}

if(typeof Number.formatPrice === 'undefined' ){

    Number.prototype.formatPrice = function($currency){
        let lValue = this;
        lValue = Math.round(lValue * 100) / 100;
        $currency = ($currency==undefined)?'':$currency;
        let lResult = lValue.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1 ');
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

if(typeof Date.addMonths === 'undefined'){
    
    Date.prototype.round = function(){
        let lResult = new Date(this.getFullYear(), this.getMonth(), this.getDate());
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