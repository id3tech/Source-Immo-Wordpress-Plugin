if(typeof String.prototype.format === 'undefined'){
    
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

if(typeof String.prototype.capitalize === 'undefined'){

    String.prototype.capitalize = function($allWords){
        $allWords = $allWords==undefined ? false : $allWords;

        const lSegments = $allWords ? this.split(' ') : [this];
        const lResult = lSegments
                            .map(function($s){
                                return $s.substr(0,1).toUpperCase() + $s.substr(1);
                            })
                            .join(' ');
        return lResult;
    }

}

if(typeof [].firstOrDefault === 'undefined'){
    Array.prototype.firstOrDefault = function($default){
        if(this.length > 0) return this[0];
        return $default;
    }
}

if(typeof [].last === 'undefined' ){
    Array.prototype.last = function(){
        if(this.length == 0) return null;
        return this[this.length - 1];
    }
}

if(typeof [].any === 'undefined'){
    Array.prototype.any = function(){
        if(this.length < 1) return null;
        if(this.length == 1) return this[0];

        const lIndex = Math.round(Math.random() * this.length-1);
        const lResult = this[lIndex];
        
        return isNullOrEmpty(lResult) ? this[0] : lResult;
    }
}

if(typeof Number.formatPrice === 'undefined' ){

    Number.prototype.formatPrice = function($currency){
        let lValue = this;
        lValue = Math.round(lValue * 100) / 100;
        if(Math.floor(lValue) < lValue){
            lValue = lValue.toFixed(2);
        }

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
        if(Array.isArray($value)){
            if($value.length == 0) return true;
            if($value.every(function($e){return $e==null})) return true;
        }
        if($value.toString() === '[object Object]' && Object.keys($value).length == 0) return true;
        
        return false;
    }
}

if(typeof isNullOrUndefined === 'undefined'){
    
    isNullOrUndefined = function($value){
        if($value == undefined) return true;
        if(typeof $value == 'undefined') return true;
        
        return false;
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


// object.watch
if (!Object.prototype.watch) {
	Object.defineProperty(Object.prototype, "watch", {
		  enumerable: false
		, configurable: true
		, writable: false
		, value: function (prop, handler) {
			var
			  oldval = this[prop]
			, newval = oldval
			, getter = function () {
				return newval;
			}
			, setter = function (val) {
				oldval = newval;
				return newval = handler.call(this, prop, oldval, val);
			}
			;
			
			if (delete this[prop]) { // can't watch constants
				Object.defineProperty(this, prop, {
					  get: getter
					, set: setter
					, enumerable: true
					, configurable: true
				});
			}
		}
	});
}

// object.unwatch
if (!Object.prototype.unwatch) {
	Object.defineProperty(Object.prototype, "unwatch", {
		  enumerable: false
		, configurable: true
		, writable: false
		, value: function (prop) {
			var val = this[prop];
			delete this[prop]; // remove accessors
			this[prop] = val;
		}
	});
}

// POLYFILL
if (!Element.prototype.closest) {
	if (!Element.prototype.matches) {
		Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
	}
	Element.prototype.closest = function (s) {
		var el = this;
		var ancestor = this;
		if (!document.documentElement.contains(el)) return null;
		do {
			if (ancestor.matches(s)) return ancestor;
			ancestor = ancestor.parentElement;
		} while (ancestor !== null);
		return null;
	};
}

if (!Object.assign) {
    Object.defineProperty(Object, 'assign', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: function(target) {
        'use strict';
        if (target === undefined || target === null) {
          throw new TypeError('Cannot convert first argument to object');
        }
  
        var to = Object(target);
        for (var i = 1; i < arguments.length; i++) {
          var nextSource = arguments[i];
          if (nextSource === undefined || nextSource === null) {
            continue;
          }
          nextSource = Object(nextSource);
  
          var keysArray = Object.keys(Object(nextSource));
          for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
            var nextKey = keysArray[nextIndex];
            var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
            if (desc !== undefined && desc.enumerable) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
        return to;
      }
    });
  }

  /**
 * ChildNode.append() polyfill
 * https://gomakethings.com/adding-an-element-to-the-end-of-a-set-of-elements-with-vanilla-javascript/
 * @author Chris Ferdinandi
 * @license MIT
 */
(function (elem) {

	// Check if element is a node
	// https://github.com/Financial-Times/polyfill-service
	var isNode = function (object) {

		// DOM, Level2
		if (typeof Node === 'function') {
			return object instanceof Node;
		}

		// Older browsers, check if it looks like a Node instance)
		return object &&
			typeof object === "object" &&
			object.nodeName &&
			object.nodeType >= 1 &&
			object.nodeType <= 12;

	};

	// Add append() method to prototype
	for (var i = 0; i < elem.length; i++) {
		if (!window[elem[i]] || 'append' in window[elem[i]].prototype) continue;
		window[elem[i]].prototype.append = function () {
			var argArr = Array.prototype.slice.call(arguments);
			var docFrag = document.createDocumentFragment();

			for (var n = 0; n < argArr.length; n++) {
				docFrag.appendChild(isNode(argArr[n]) ? argArr[n] : document.createTextNode(String(argArr[n])));
			}

			this.appendChild(docFrag);
		};
	}

})(['Element', 'CharacterData', 'DocumentType']);

/**
 * ChildNode.prepend() polyfill
 * Adapted from https://github.com/jserz/js_piece/blob/master/DOM/ParentNode/prepend()/prepend().md
 * @author Chris Ferdinandi
 * @license MIT
 */
(function (elem) {

	// Check if element is a node
	// https://github.com/Financial-Times/polyfill-service
	var isNode = function (object) {

		// DOM, Level2
		if (typeof Node === 'function') {
			return object instanceof Node;
		}

		// Older browsers, check if it looks like a Node instance)
		return object &&
			typeof object === "object" &&
			object.nodeName &&
			object.nodeType >= 1 &&
			object.nodeType <= 12;

	};

	// Add append() method to prototype
	for (var i = 0; i < elem.length; i++) {
		if (!window[elem[i]] || 'prepend' in window[elem[i]].prototype) continue;
		window[elem[i]].prototype.prepend = function () {
			var argArr = Array.prototype.slice.call(arguments);
			var docFrag = document.createDocumentFragment();

			for (var n = 0; n < argArr.length; n++) {
				docFrag.appendChild(isNode(argArr[n]) ? argArr[n] : document.createTextNode(String(argArr[n])));
			}

			this.appendChild(docFrag);
		};
	}

})(['Element', 'CharacterData', 'DocumentType']);