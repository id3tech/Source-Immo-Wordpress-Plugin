<?php

#region Datas
  
  class SourceImmoBrokersResult extends SourceImmoAbstractResult {
    public $brokers = null;
    public $metadata = null;
  
    public function __construct($data=null){
      if($data!=null){
        $this->brokers = $data->items;
        $this->metadata = $data->metadata;
  
        foreach ($this->brokers as $item) {
          $this->preprocess_item($item);
  
          $item->permalink = self::buildPermalink($item, SourceImmo::current()->get_broker_permalink());
        }
  
        self::validatePagePermalinks($this->brokers, 'broker');
      }
    }
  
    public function preprocess_item(&$item){
      global $dictionary;
    
  
      $item->fullname = $item->first_name . ' ' . $item->last_name;
      if(isset($item->office)) {
        $item->office->location->city = (isset($item->office->location->city_code)) ? $dictionary->getCaption($item->office->location->city_code , 'city') : '';
        $item->office->location->full_address = $item->office->location->address->street_number . ' ' . $item->office->location->address->street_name . ', ' . $item->office->location->city;
      }
  
      $item->main_phone = (isset($item->phones->mobile)) ? $item->phones->mobile : $item->phones->office;
  
      if(isset($item->license_type_code)){
        $item->license_type = $dictionary->getCaption($item->license_type_code , 'broker_license_type');
      }
  
      // cities
      if(isset($item->listings)){
        $cityList = array();
        $cityListCode = array();
  
        foreach ($item->listings as $listing) {
          if(isset($listing->location->city_code)){
            if(!in_array($listing->location->city_code,  $cityListCode)){
              $cityListCode[] = $listing->location->city_code;
              $cityList[] = (object) array(
                'ref_number' => $listing->location->city_code,
                'code' => $listing->location->city_code,
                'name' => isset($listing->location->city) ? $listing->location->city : $dictionary->getCaption($listing->location->city_code , 'city'),
                'region_code' => isset($listing->location->region_code) ? $listing->location->region_code : '' ,
                'country_code' => $listing->location->country_code,
                'state_code' => $listing->location->state_code,
                'listing_count' => 1
              );
            }
            else{
              $index = array_search($listing->location->city_code, $cityListCode);
              $cityList[$index]->listing_count += 1;
            }
          }
        }
  
        $cityListData = (object) array();
        $cityListData->items = $cityList;
        $cityListData->metadata = $this->metadata;
  
        $citiesResult = new SourceImmoCitiesResult($cityListData);
        $item->cities = $citiesResult->cities;
        $item->photo = isset($item->photo) ? $item->photo : (object) array('url' => SI_PLUGIN_URL . 'styles/assets/shadow_broker.jpg');
      }
    }
  }
  
  class SourceImmoCitiesResult extends SourceImmoAbstractResult {
    public $cities = null;
    public $metadata = null;
  
    public function __construct($data=null){
      
      if($data!=null){
        $this->cities = $data->items;
        $this->metadata = $data->metadata;
        //Debug::write($this->cities);
  
        foreach ($this->cities as $item) {
          $this->preprocess_item($item);
        }
        
        self::validatePagePermalinks($this->cities, 'city');
      }
    }
  
    public function preprocess_item(&$item){
      global $dictionary;
  
      $item->location = (object) array();
      $item->location->region = $dictionary->getCaption($item->region_code , 'region');
      $item->location->country = $dictionary->getCaption($item->country_code , 'country');
      $item->location->state = $dictionary->getCaption($item->state_code , 'state');
  
      $item->permalink = self::buildPermalink($item, SourceImmo::current()->get_city_permalink());
    }
  }
  
  class SourceImmoListingsResult extends SourceImmoAbstractResult {
    public $listings = null;
    public $metadata = null;
  
    public function __construct($data=null){
      if($data!=null){
        $this->listings = $data->items;
        $this->metadata = $data->metadata;
  
        foreach ($this->listings as $item) {
          $this->preprocess_item($item);
  
          $item->permalink = self::buildPermalink($item, SourceImmo::current()->get_listing_permalink());
        }
  
        self::validatePagePermalinks($this->listings,'listing');
      }
    }
    
    
    public function preprocess_item(&$item){
      global $dictionary;
  
      if(isset($item->location->address->street_number) && $item->location->address->street_number != ''){
        $item->location->civic_address = $item->location->address->street_number . ' ' . $item->location->address->street_name;
        if(isset($item->location->address->door) && !str_null_or_empty($item->location->address->door)){
          $item->location->civic_address = $item->location->civic_address . ', ' .  StringPrototype::format(__('apt. {0}',SI),$item->location->address->door);
        }
      }
      else if(isset($item->location->address->street_name) && $item->location->address->street_name != ''){
        $item->location->civic_address = $item->location->address->street_name;
        if(isset($item->location->address->door) && !str_null_or_empty($item->location->address->door)){
          $item->location->civic_address = $item->location->civic_address . ', ' .  StringPrototype::format(__('apt. {0}',SI),$item->location->address->door);
        }
      }
      else{
        $item->location->civic_address = '';
      }
      
      
      $item->location->city = (isset($item->location->city_code)) ? $dictionary->getCaption($item->location->city_code , 'city') : '';
      $item->location->region = (isset($item->location->region_code)) ? $dictionary->getCaption($item->location->region_code , 'region') : '';
      if($item->location->civic_address != ''){
        $item->location->full_address = $item->location->civic_address . ', ' . $item->location->city;
      }
      else{
        $item->location->full_address = $item->location->city;
      }
  
  
      
  
      if(isset($item->category_code)){
        $item->category = $dictionary->getCaption($item->category_code , 'listing_category');
      }
      
      $item->transaction = $this->getTransaction($item);
      if(isset($item->subcategory_code)){
        $item->subcategory = $dictionary->getCaption($item->subcategory_code , 'listing_subcategory');
      }
      else{
        $item->subcategory='';
      }
  
      // Price
      if($item->status_code == 'SOLD'){
        if(isset($item->price->sell)) {
          $item->price_text = __('Sold', SI);
        }
        else{
          $item->price_text = __('Rented', SI);
        }
      }
      else{
        $item->price_text = self::formatPrice($item->price);
      }
  
      // Areas
      $item->available_area = (isset($item->available_area)) ? $item->available_area : null;
      $item->available_area_unit = (isset($item->available_area_unit_code)) ? $dictionary->getCaption($item->available_area_unit_code , 'dimension_unit') : null;
      
      if(isset($item->brokers)){
        $data = (object) array();
        $data->items = $item->brokers;
        $data->metadata = $this->metadata;
        $brokerDatas = new SourceImmoBrokersResult($data);
  
        $item->brokers = $brokerDatas->brokers;
      }
  
      if(isset($item->photos)){
        foreach($item->photos as $photo){
          $photo->category = $dictionary->getCaption(array($photo,'category_code') , 'photo_category');
        }
      }
  
      
      
      if(isset($item->main_unit)){
        $item->rooms = (object) array();
  
        $lIconRef = array(
          'bathroom_count' => 'bath',
          'bedroom_count' => 'bed',
          'waterroom_count' => 'hand-holding-water'
        );
        $lLabelRef = array(
            'bathroom_count' => 'Bathroom',
            'bedroom_count' => 'Bedroom',
            'waterroom_count' => 'Powder room'
        );
        $lPluralLabelRef =array(
            'bathroom_count' => 'Bathrooms',
            'bedroom_count' => 'Bedrooms',
            'waterroom_count' => 'Powder rooms'
        );
  
        $rooms = array();
        foreach ($item->main_unit as $key => $value) {
          if($item->main_unit->{$key} > 0){
            if(isset($lIconRef[$key])){
              $lLabel = ($item->main_unit->{$key} > 1) ? $lPluralLabelRef[$key] : $lLabelRef[$key];
              $rooms[$lIconRef[$key]] = array(
                'count' => $item->main_unit->{$key},
                'label' => __($lLabel,SI)
              );
            }
          }
        }
        if(count($rooms)>0){
          $item->rooms = json_decode(json_encode($rooms));
        }
      }
    }
  
    public function extendedPreprocess(&$item){
        global $dictionary;

        if(!isset($item->description)) $item->description = '';
        if(!isset($item->addendum)) $item->addendum = null;
        // if(!isset($item->assessment)) $item->assessment = null;
        // if(!isset($item->assessment->year)) $item->assessment->year = null;

        $item->important_flags = array();
        // from units
        foreach($item->units as $unit){
        $unit->category = $dictionary->getCaption(array($unit,'category_code') , 'unit_category');
        if($unit->category_code=='MAIN'){
            if(isset($unit->bedroom_count)&& $unit->bedroom_count > 0){ $item->important_flags[] = array('icon' => 'bed', 'value' => $unit->bedroom_count, 'caption' => __('Bedroom',SI));}
            if(isset($unit->bathroom_count)&& $unit->bathroom_count > 0){ $item->important_flags[] = array('icon' => 'bath', 'value' => $unit->bathroom_count, 'caption' => __('Bathroom',SI));}
            if(isset($unit->waterroom_count) && $unit->waterroom_count > 0){ $item->important_flags[] = array('icon' => 'hand-holding-water', 'value' => $unit->waterroom_count, 'caption' => __('Water room',SI));}
        }
        }

        // Attributes
        //__c($item->attributes);
        $this->preprocessAttributes($item);
        $this->buildBuildingAttributes($item);
        $this->buildLotAttributes($item);
        $this->buildOtherAttributes($item);
        $this->buildImportantFlags($item);
        $this->buildProximityFlags($item);
        //__c($item->attributes);
      

        $item->building->short_dimension = self::formatDimension($item->building->dimension);
        if(isset($item->building->assessment)){
            if(isset($item->building->assessment->amount)){
            $item->building->assessment->amount_text = self::formatPrice($item->building->assessment->amount);
            }
            else{
            $item->building->assessment->amount_text = 'NA';
            }
        }
        else{
          $item->building->assessment = null;
        }
        

        $item->land->short_dimension = self::formatDimension($item->land->dimension);
        if(isset($item->land->assessment)){
            if(isset($item->land->assessment->amount)){
            $item->land->assessment->amount_text = self::formatPrice($item->land->assessment->amount);
            }
            else{
            $item->land->assessment->amount_text = 'NA';
            }
        }
        else{
          $item->land->assessment = null;
        }
        

        if(isset($item->assessment)){
            if(isset($item->assessment->amount)){
              $item->assessment->amount_text = self::formatPrice($item->assessment->amount);
            }
            else{
              $item->assessment->amount_text = 'NA';
            }
            if(!isset($item->assessment->year)){
              $item->assessment->year = null;
            }
        }
        else{
          $item->assessment = null;
        }
        
  
        foreach($item->rooms as &$room){
          $room->category = $dictionary->getCaption(array($room,'category_code') , 'room_category');
          $room->flooring = $dictionary->getCaption(array($room,'flooring_code') , 'flooring');
          $room->level_category = (isset($room->level_category_code)) ? $dictionary->getCaption($room->level_category_code , 'level_category') : '';
          $room->short_dimension = self::formatDimension($room->dimension);
        }

        foreach($item->units as &$unit){
          $unit->flags = array();
          if(isset($unit->room_count)){
              $unit->flags[] = array('caption' => __('Rooms',SI), 'value' => $unit->room_count);
          }

          if(isset($unit->bedroom_count)){
              $unit->flags[] = array('caption' => __('Bedrooms',SI), 'value' => $unit->bedroom_count);
          }

          if(isset($unit->bathroom_count)){
              $unit->flags[] = array('caption' => __('Bathrooms',SI), 'value' => $unit->bathroom_count);
          }
        }

        foreach($item->expenses as &$expense){
          $expense->type = $dictionary->getCaption(array($expense,'type_code') , 'expense_type');
          $expense->amount_text = isset($expense->amount) ? self::formatPrice($expense->amount) : '';
        }

        foreach($item->incomes as &$income){
          $income->type = $dictionary->getCaption(array($income,'type_code') , 'income_type');
          $income->amount_text = self::formatPrice($income->amount);
        }
    }

    public function preprocessAttributes(&$item){
        global $dictionary;

        foreach($item->attributes as &$attr){
            $attr->caption = $dictionary->getCaption($attr->code , 'attribute');
            
            foreach($attr->values as &$val){
              $val->caption =  $dictionary->getCaption($val->code , 'attribute_value');
              if(isset($val->count)){
                $val->caption = $val->caption . StringPrototype::format('({0})', $val->count);
              }
              if(isset($val->details)){
                $val->caption = $val->details;
              }
            }
        }
    }
    public function buildBuildingAttributes(&$item){
        $item->building->attributes = array_filter($item->attributes, function($e){
            return in_array($e->code, ['CUPBOARD','WINDOWS',
                                        'WINDOW TYPE','ROOFING','FOUNDATION',
                                        'GARAGE','SIDING','BATHR./WASHR','BASEMENT']);
        });
    }
    public function buildLotAttributes(&$item){
        $item->land->attributes = array_filter($item->attributes, function($e){
            return in_array($e->code, ['LANDSCAPING','DRIVEWAY','PARKING','POOL',
                                        'TOPOGRAPHY','VIEW','ZONING']);
        });
    }
    public function buildOtherAttributes(&$item){
        if(!isset($item->other)) $item->other = (object) array();
        
        $item->other->attributes = array_filter($item->attributes, function($e){
            return in_array($e->code, ['HEATING SYSTEM','HEATING ENERGY','HEART STOVE','WATER SUPPLY','SEWAGE SYST.','EQUIP. AVAIL','KIND COMMERCE','DISTINCT. FEAT.']);
        });
    }
    public function buildImportantFlags(&$item){
        $specials = array_filter($item->attributes, function($e){
            return in_array($e->code, ['PARKING','POOL','HEART STOVE']);
        });

        foreach($specials as &$attr){
            if($attr->code=='PARKING'){
                $lParkingCount = 0;
                foreach($attr->values as $v){
                  $lParkingCount += $v->count;
                }
                if($lParkingCount > 0){
                  $item->important_flags[] = array('icon'=> 'car', 'value' => $lParkingCount, 'caption' => $attr->caption);
                }
            }
      
            if($attr->code=='POOL'){
              $item->important_flags[] = array('icon'=> 'swimmer', 'value'=> 0, 'caption' => $attr->caption);
            }
      
            if ($attr->code=='HEART STOVE'){
              $item->important_flags[] = array('icon'=> 'fire', 'value'=> 0, 'caption' => $attr->caption);
            }
        }

        if(isset($item->available_area) && $item->available_area > 0){
          $item->important_flags[] = array('icon'=> 'vector-square', 'value'=> $item->available_area . $item->available_area_unit, 'caption' => __('Available area',SI));
        }
    }
    public function buildProximityFlags(&$item){
        global $dictionary;
        $item->proximity_flags = [];
        $attrs = array_filter($item->attributes, function($e){return $e->code == 'PROXIMITY';});

        foreach($attrs as &$attr){
            foreach ($attr->values as $val) {
                $key = str_replace('PROXIMITY ','',$val->code);
                $keyMap = [
                    'AIRPORT'   => 'plane-departure',
                    'AGRICULT. ACT.'    => 'tractor',
                    'COMMERCIAL ACT.'   => 'store',
                    'INDUSTRIAL ACT.'   => 'industry-alt',
                    'HIGHWAY'   => 'route-highway',
                    'WOODED'    => 'tree-alt',
                    'GOLF'      => 'golf-ball',
                    'HOSPITAL'  => 'hospital',
                    'METRO'     => 'subway',
                    'PARK-GREEN AREA'   => 'trees',
                    'BICYCLE PATH'  => 'biking',
                    'ELEM. SCHOOL'  => 'school',
                    'HIGH SCHOOL'   => 'school',
                    'CEGEP'     => 'school',
                    'UNIVERSITY'    => 'university',
                    'SHOPP. CENTER' => 'shopping-bag',
                    'CHURCH'    => 'church',
                    //'RECREATIO. ACT.'   => '',
                    'ALPINE SKIING' => 'skiing',
                    'C-COUNTRY SKI' => 'skiing-nordic',
                    'TRAIN' => 'train',
                    'PUBLIC TRANSP.' => 'bus',
                    //'RAILROAD TRACK'    => ''
                ];

                if(isset($keyMap[$key])){
                    $item->proximity_flags[] = ['icon' => $keyMap[$key], 'caption' => $dictionary->getCaption($val->code , 'attribute_value'), 'value' => 0];
                }
            }
            
        }
    }

    
    public static function formatPrice($price){
      $lResult = array();
      $locale = substr(get_locale(),0,2);
      $thousand_separator = ($locale == 'fr') ? ' ' : ',';
  
      $priceFormat = __('${0}',SI);
      if(is_numeric($price)){
        return StringPrototype::format($priceFormat, number_format($price,0,".", $thousand_separator));
      }
  
      global $dictionary;
  
      foreach ($price as $key => $item) {
        if(in_array($key, array('sell','lease'))){
          $parts = array();
          if(is_numeric($item->amount)){
            $decimalCount = (num_has_decimal($item->amount)) ? 2 : 0;
            $parts[] =  StringPrototype::format($priceFormat, number_format($item->amount,$decimalCount,".", $thousand_separator));
  
            if(isset($item->taxable)){
                $parts[0] = $parts[0] . '+tx';
            }
  
            if(isset($item->unit_code)){
              $parts[] = $dictionary->getCaption($item->unit_code,'price_unit',true);
            }
  
            if(isset($item->period_code)){
              $parts[] = $dictionary->getCaption($item->period_code,'price_period');
            }
  
            $lResult[] = implode(' / ', $parts);
          }
        }
      }
  
      return implode(__(' or ',SI), $lResult);
    }
  
    public static function getCity($item){
      global $dictionary;
      $lResult = $dictionary->getCaption($item->location->city_code, 'city');
  
  
      return $lResult;
    }
  
    public static function getRegion($item){
      global $dictionary;
      $lResult = $dictionary->getCaption($item->location->region_code, 'region');
  
  
      return $lResult;
    }
  
    public static function getTransaction($item){
      $lResult = array();
      $keysToLabels = array(
        'sell' => 'For sale',
        'lease' => 'For rent'
      );
  
      foreach ($item->price as $key => $value) {
        if(in_array($key, array('sell','lease'))){
          $lResult[] = __($keysToLabels[$key], SI);
        }
      }
  
      $lResult = implode(__(' or ',SI),$lResult);
  
      return $lResult;
    }
  
    public static function formatDimension($dimension){
      $lResult = '';
      if(isset($dimension) && $dimension != null){
          global $dictionary;
          $lResultPart = array();
  
          if (isset($dimension->area)){
            $lUnit = $dictionary->getCaption($dimension->area_unit_code,'dimension_unit',true);
            //if(lUnit=='mc'){lUnit='m<sup>2</sup>';}
            $lResultPart[] = StringPrototype::format('{0} {1}',$dimension->area, $lUnit);
          }
          
          if(isset($dimension->width)){
            
              $lUnit = $dictionary->getCaption($dimension->unit_code,'dimension_unit',true);
              $lSize = array();
              $lSize[] = isset($dimension->width) ? StringPrototype::format('{0}{1}', $dimension->width, $lUnit) : __('NA',SI);
              $lSize[] = isset($dimension->length) ? StringPrototype::format('{0}{1}', $dimension->length, $lUnit) : __('NA',SI);
  
              $lResultPart[] = implode(' x ', $lSize);
          }
          if(count($lResultPart) > 1){
            $lResult = StringPrototype::format('{0} ({1})', $lResultPart[0], $lResultPart[1]);
          }
          else if(count($lResultPart)>0){
            $lResult = $lResultPart[0];
          }
      }
      return $lResult;
    }
  
    public static function hasDimension($dimension){
      $lResult = false;
      if(isset($dimension) && $dimension != null){
          if(isset($dimension->width)){
              if(isset($dimension->length)){
                  return true;
              }
          }
          if(isset($dimension->area)){
              return true;
          }
          
      }
      return $lResult;
    }
  
    public static function hasData($source, $subAttrs=null){
        if(!isset($source)) return false;
        if($source == null) return false;
        if(is_array($source) && count($source) == 0) return false;

        if($subAttrs != null) {
            foreach ($subAttrs as $key) {
                if(!self::hasData($source->{$key})) return false;
            }
        }

        return true;
    }

    public static function getLotSpecs($item){
        $specExceptions = apply_filters('si/listing/lotSpecExceptions', []);
        if(count($specExceptions) > 0){
            return array_filter($item->land->attributes, function($att) use($specExceptions){
                return !in_array($att->code, $specExceptions);
            });
        }
        return $item->land->attributes;
    }

    public static function getBuildingSpecs($item){
        $specExceptions = apply_filters('si/listing/buildingSpecExceptions', ['WINDOWS','CUPBOARD']);
        if(count($specExceptions) > 0){
            return array_filter($item->building->attributes, function($att) use($specExceptions){
                return !in_array($att->code, $specExceptions);
            });
        }
        return $item->building->attributes;
    }

    public static function getOtherSpecs($item){
        $specExceptions = apply_filters('si/listing/otherSpecExceptions', ['DISTINCT. FEAT.']);
        if(count($specExceptions) > 0){
            return array_filter($item->other->attributes, function($att) use($specExceptions){
                return !in_array($att->code, $specExceptions);
            });
        }
        return $item->other->attributes;
    }
  }
  
  class SourceImmoOfficesResult extends SourceImmoAbstractResult {
    public $offices = null;
    public $metadata = null;
  
    public function __construct($data=null){
      
      if($data!=null){
        $this->offices = $data->items;
        $this->metadata = $data->metadata;
        //Debug::write($this->cities);
  
        foreach ($this->offices as $item) {
          $this->preprocess_item($item);
        }
        
        self::validatePagePermalinks($this->offices, 'office');
      }
      
    }
  
    public function preprocess_item(&$item){
      global $dictionary;
  
      //$item->location = (object) array();
      $item->listings_count = 0;
      
      $item->location->city = isset($item->location->city_code) ? $dictionary->getCaption($item->location->city_code , 'city') : '';
      $item->location->region = isset($item->location->region_code) ? $dictionary->getCaption($item->location->region_code , 'region') : '';
      $item->location->country = isset($item->location->country_code) ? $dictionary->getCaption($item->location->country_code , 'country') : '';
      $item->location->state = isset($item->location->state_code) ? $dictionary->getCaption($item->location->state_code , 'state') : '';
      $item->location->street_address = isset($item->location->address->street_number) ? $item->location->address->street_number . ' ' . $item->location->address->street_name : '';
  
      if(str_null_or_empty($item->location->city) && isset($item->location->address->street_name)){
        $addressParts = explode(',',$item->location->address->street_name);
        $item->location->street_address = $addressParts[0];
        $item->location->city = $addressParts[1];
        $item->location->state = $addressParts[2];
        $item->location->address->postal_code = $addressParts[3];
      }
  
      $item->permalink = self::buildPermalink($item, SourceImmo::current()->get_office_permalink());
    }
  }
  
  class SourceImmoAbstractResult{
  
    public static function getAttributeValueList($item, $prefix=null){
      $lResult = array();
      if(!is_array($item)){
        $item = json_decode(json_encode($item),true);
      }
      foreach ($item as $key => $value) {
        $attrKey = $key;
        if($attrKey == 'dictionary'){
          continue;
        }
  
        if($prefix!=null){
          $attrKey = $prefix . '.' . $key;
        }
        if(is_array($item[$key])){
          //Debug::write($attrKey . ' is array');
          $lSubAttrs = self::getAttributeValueList($item[$key], $attrKey);
          foreach ($lSubAttrs as $attr) {
            array_push($lResult, $attr);
          }
        }
        else{
          $lResult[] = array('key' => $attrKey, 'value' => $item[$key]);
        }
      }
  
      return $lResult;
    }
  
    public static function buildPermalink($item, $format, $lang=null){
      $lResult = $format;
      global $sitepress;
      $lTwoLetterLocale = $lang!=null ? $lang : substr(get_locale(),0,2);
      $lHomeUrl= $sitepress == null ? '/' : $sitepress->language_url( $lTwoLetterLocale );
  
      $lAttrList = self::getAttributeValueList($item);
      $item->has_custom_page = false;
  
      foreach($lAttrList as $lAttr){
        $lValue = $lAttr['value'];
  
        $lResult = str_replace(
            array(
              '{{' . $lAttr['key'] . '}}',
              '{{item.' . $lAttr['key'] . '}}',
              '{{get' . $lAttr['key'] . '(item)}}'
            ), sanitize_title($lValue), $lResult);
        
      }
      $lFinalPermalink = '/'. str_replace(' ','-',$lResult);
      if(strpos($lHomeUrl,$lTwoLetterLocale)!==false) $lFinalPermalink = '/' . $lTwoLetterLocale . $lFinalPermalink; 
      return $lFinalPermalink;
    }
  
    public static function validatePagePermalinks($list, $type = 'city'){
      if(!SourceImmo::current()->configs->enable_custom_page){
        return;
      }
      $lTypePermalink = SourceImmo::current()->get_permalink($type);
      $lTypePermalink = substr($lTypePermalink,0, strpos($lTypePermalink,'{{')-1);
  
      $lTwoLetterLocale = substr(get_locale(),0,2);
      // query args
      $lQueryArgs = array(
        'post_type' => 'page',
        'posts_per_page' => -1,
        'post_status' => 'publish',
        'sort_order' => 'asc',
        'sort_column' => 'post_title',
        'hierarchical' => 1,
        'suppress_filters' => false
      );
  
      // query
      $posts = new WP_Query( $lQueryArgs );
      $pages = $posts->posts;
      
  
      foreach ($pages as $page) {
        $pagePermalink = rtrim(str_replace(array('http://','https://',$_SERVER['HTTP_HOST']), '' ,get_permalink($page)),'/');
        if($pagePermalink == '') continue;
        
        foreach ($list as $item) {
          if(isset($item->permalink)){
            // remove item permalink 'ID'
            $lId = (isset($item->ref_number))?$item->ref_number: $item->code;
            $customPageLink = '';
            switch ($type){
              case 'city':
                $customPageLink = str_replace($lId,'',$item->permalink);
                break;
              case 'broker':
                $customPageLink = str_replace('/' . $lId,'-' . $lId,$item->permalink);
                $item->custom_page_link = $customPageLink;
                break;
              case 'listing':
                break;
            }
            $customPageLink = rtrim($customPageLink,'/');
  
            if($pagePermalink == $customPageLink){
              $item->has_custom_page = true;
              $item->permalink = $customPageLink;
            }
            else{
              if($pagePermalink == '/' .$lTwoLetterLocale . $customPageLink){
                $item->has_custom_page = true;
                $item->permalink = '/'. $lTwoLetterLocale . $customPageLink;
              }
            }
          }
        }
      }
    }
  }
  
#endregion




#region Schemas
/** SCHEMAS */


class BaseDataSchema{
  public $_schema = array(
    "@context" => "http://schema.org/",
    "@type" => '',
    "name" => '',
    "image" => '',
    "description" => ''
  );

  public $_schema_basic_info = null;

  public function __construct($type,BaseSchemaInfos $infos ){
    $this->_schema['@type'] = $type;
    $this->_schema['name'] = $infos->name;
    
    $this->_schema['description'] = $infos->description;

    if(is_array($infos->image)){
      $this->_schema['image'] = $infos->image[0]->url;
    }
    else{
      $this->_schema['image'] = $infos->image;
    }

    $this->_schema_basic_info = $infos;
  }

  public function addOffer($type,$price,$currency, $location ){
    $mainImage = $this->_schema_basic_info->image;
    if(is_array($this->_schema_basic_info->image)){
      $mainImage = $this->_schema_basic_info->image[0]->url;
      $images = array();
      foreach ($this->_schema_basic_info->image as $image) {
        $images[] = array(
          "@type" => "ImageObject",
          "contentUrl" => $image->url,
          "name"  => $image->category . ' ' . $this->_schema_basic_info->name,
        );
      }
    }

    $this->_schema['offers'] = array(
      array(
        '@type' => 'Offer',
        'price' => $price,
        'priceCurrency' => $currency,
        'category' => array(
          '@type' => $type,
          'name' => $this->_schema_basic_info->name,
          'image' => $mainImage,
          'photo' => $images,
          'description' => $this->_schema_basic_info->description,
          'address' => array(
            '@type' => 'PostalAddress',
            'streetAddress' => $location->civic_address,
            'addressLocality' => $location->city
          ),

          'geo' => array(
            '@type' => 'GeoCoordinates',
            'latitude' => $location->latitude,
            'longitude' => $location->longitude
          )
        )
      )
    );
  }

  public function addLocation($type, $location){
    $this->_schema['location'] = array(
      '@type' => $type,
      'name' => $this->_schema_basic_info->name,
      'address' => array(
        '@type' => 'PostalAddress',
        'streetAddress' => $location->civic_address,
        'addressLocality' => $location->city
      ),
    );
  }

  public function addPerformer($broker){
    if(!isset($this->_schema['performers'])){
      $this->_schema['performers'] = array();
    }

    $this->_schema['performers'][] = array(
      '@type' => 'person',
      'name' => $broker->first_name . ' ' . $broker->last_name
    );

  }

  public function currentPageUrl(){
    $protocol = ((!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] != 'off') || 
    $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
    $domainName = $_SERVER['HTTP_HOST'];
    $page_path = $_SERVER['REQUEST_URI'];

    return $protocol.$domainName.$page_path;
  }

  public function toJson($includeTag=true){
    $lResult = json_encode($this->_schema);
    if($includeTag){
      $lResult = '<script type="application/ld+json">' . $lResult . '</script>';
    }
    return $lResult;
  }
}

class BaseSchemaInfos{
  public $name;
  public $image;
  public $description;

  public function __construct($name, $image, $description){
    $this->name = $name;
    $this->image = $image;
    $this->description = $description;
  }
}

class BrokerSchema extends BaseDataSchema{
  public function __construct($broker){
    $basicInfos = new BaseSchemaInfos(
        $broker->first_name . ' ' . $broker->last_name, 
        isset($broker->photo_url) ? $broker->photo_url : SI_PLUGIN_URL . '/styles/assets/shadow_broker.jpg', 
        $broker->license_type);
    parent::__construct('RealEstateAgent',$basicInfos);

    if(isset($broker->company_name)){
      $this->_schema['legalName'] = $broker->company_name;
    }
    if(isset($broker->office)){
      $this->_schema['address'] = array(
        '@type' => 'PostalAddress',
        'streetAddress' => $broker->office->location->address->street_number . ' ' . $broker->office->location->address->street_name,
        'addressLocality' => (isset($broker->office->location->city)) ? $broker->office->location->city : ''
      );
    }
    
    $this->_schema['email'] = $broker->email;
    $this->_schema['telephone'] = isset($broker->phones->cell) ? $broker->phones->cell 
                                : (isset($broker->phones->office) ? $broker->phones->office : '');

    $this->_schema['url'] = $this->currentPageUrl();
  }
}

class ListingSchema extends BaseDataSchema{
  public function __construct($listing){
    if(!isset($listing->description)) $listing->description = '';

    $basicInfos = new BaseSchemaInfos($listing->subcategory . ' ' . $listing->transaction, $listing->photos, $listing->description);
    parent::__construct('Product',$basicInfos);

    if(isset($listing->price->sell)){
      $currency = (isset($listing->price->sell->currency)) ? $listing->price->sell->currency : '';

      $this->addOffer('Residence',$listing->price->sell->amount, $currency, $listing->location);
    }
    else{
      $currency = (isset($listing->price->lease->currency)) ? $listing->price->lease->currency : '';
      $this->addOffer('Residence',$listing->price->lease->amount,$currency, $listing->location);
    }
  }
}

class ListingOpenHouseSchema extends BaseDataSchema{
  public function __construct($listing, $open_house){
    $basicInfos = new BaseSchemaInfos($listing->subcategory . ' ' . $listing->transaction, $listing->photos[0]->url, $listing->description);
    parent::__construct('Event',$basicInfos);

    $this->addLocation('Place',$listing->location);
    $interval = date_diff(date_create($open_house->start_date), date_create($open_house->end_date));
    $startDate = is_date($open_house->start_date) ? $open_house->start_date : strtotime($open_house->start_date);
    $endDate = is_date($open_house->end_date) ? $open_house->end_date : strtotime($open_house->end_date);
    $this->_schema['startDate'] = Date('d-m-Y', $startDate);
    $this->_schema['endDate'] = Date('d-m-Y', $endDate);
    $this->_schema['doorTime'] = Date('H:i', $startDate);
    $this->_schema['duration'] = $interval->format('%h:%i');
    $this->_schema['url'] = $this->currentPageUrl();
    $this->_schema['offers'] = array(
      'availability' => 'LimitedAvailability',
      'price' => $listing->price->sell->amount,
      'priceCurrency' => $listing->price->sell->currency,
      'url' => $this->currentPageUrl(),
      'validFrom' => Date('d-m-Y', $startDate)
    );

    foreach($listing->brokers as $broker){
      $this->addPerformer($broker);
    }
  }
}
#endregion


#region Configs


class SourceImmoRoute{

    public $lang = '';
    public $route = '';
  
    public function __construct($lang='', $route='', $shortcut=''){
      $this->lang = $lang;
      $this->route = $route;
      $this->shortcut = $shortcut;
    }
  
  }
  
  class SourceImmoLayoutPage{
    public $page = null;
    public $communication_mode = 'basic';
    public $lang = null;
  }
  
  class SourceImmoLayout{
    public $lang = '';
    public $type = 'standard';
    public $preset = 'standard';
    public $layout = 'standard';
    public $scope_class = '';
    public $page = null;
    public $image_hover_effect = 'none';
    public $secondary_layer_effect = 'fade';
    public $displayed_vars = null;
    public $styles = null;
    public $use_styles = true;
    public $primary_layer_position = 'fix';
    public $secondary_layer_bg_opacity = 75;
    public $item_row_space = array();
    public $custom_css = '';
  
    /**
     * Communication method for forms
     */
    public $communication_mode = 'basic';
    /**
     * Form id
     */
    public $form_id = '';
  
    public function __construct($lang='', $type='', $displayedVars=null){
      $this->lang = $lang;
      $this->type = $type;
      $this->communication_mode = 'basic';
      $this->displayed_vars = new SourceImmoDisplayVars($displayedVars);
      
  
      if($type == 'listings'){
        $this->item_row_space = (object) array('desktop'=>33,'laptop'=>33,'tablet'=>50,'mobile'=>100);
      }
      else{
        $this->item_row_space = (object) array('desktop'=>25,'laptop'=>33,'tablet'=>50,'mobile'=>100);
      }
    }
  
    public function hasDisplayVar($item, $layer='main'){
      if($this->displayed_vars == null) return true;
      if(!isset($this->displayed_vars->{$layer})) return false;
  
      $layerVars = $this->displayed_vars->{$layer};
      return in_array($item, $layerVars);
    }
  
    public function stylesToAttr(){
      if($this->styles == null) return '';
      
      return str_replace(array('{','}'),'',$this->styles);
    }
  
    public function normalizeValues($displayVars=null){
      if(isset($displayVars) && $this->displayed_vars == null || !isset($this->displayed_vars->main)){
        $this->displayed_vars->main = $displayVars;
      }
    }
  
    public static function parse($source){
      if(is_array($source)) $source = json_decode(json_encode($source));
      $result = new SourceImmoLayout();
  
      foreach ($source as $key => $value) {
        $result->{$key} = $value;
      }
  
      return $result;
    }
  }
  
  class SourceImmoList {
    public $source = 'default';
    public $alias = 'default';
    public $limit = 0;
    public $type = 'listings';
    public $filter_group = null;
    public $sort = 'auto';
    public $sort_reverse = false;
    public $searchable = true;
    public $sortable = true;
    public $mappable = true;
    public $show_list_meta = true;
    public $list_layout = null;
    public $list_item_layout = null;
    public $browse_mode = null;
    public $shuffle = false;  
    public $default_zoom_level = "auto";
    public $smart_focus_tolerance = 5;
    public $search_engine_options = null;
    public $search_token = null;
  
    public function __construct($source='',$alias='listings',$type='listings',$sort='',$displayedVars=null){
      $this->source = $source;
      $this->alias = $alias;
      $this->type = $type;
      $this->sort = $sort;
  
  
      $this->list_layout = new SourceImmoLayout($type);
      $this->list_item_layout = new SourceImmoLayout();
      $this->setDefaultDisplayVars($displayedVars);
  
      $this->filter_group = new SourceImmoFilterGroup();
  
      $this->search_engine_options = new SourceImmoSearchEngineOptions($type);
    }
  
    static function parse($source){
      if(is_array($source)) $source = json_decode(json_encode($source));
      $result = new SourceImmoList($source->source, $source->alias, $source->type);
     
      foreach ($source as $key => $value) {
        if(property_exists($result, $key)){
          if($key == 'list_item_layout'){
            $result->list_item_layout = SourceImmoLayout::parse($value);
          }
          if($key == 'list_layout'){
            $result->list_layout = SourceImmoLayout::parse($value);
          }
          else if($key == 'search_engine_options'){
            $result->search_engine_options = SourceImmoSearchEngineOptions::parse($value, $result->type);
          }
          else{
            if(is_object($result->{$key}) && method_exists($result->{$key},'parse')){
              $result->{$key}->parse($value);
              
            }
            else{
              $result->{$key} = $value;
            }
          }
        }
      }
  
      return $result;
    }
  
    public function normalizeValues(){
      $lTypedPaths = array(
        'listings' => array('address','city','region','price','ref_number','category','rooms','subcategory','available_area','description'),
        'brokers' => array('first_name','last_name','license','phone'),
        'cities' => array('name','region','listing_count'),
        'offices' => array('name','region','address','listing_count'),
      );
  
      $this->list_item_layout->normalizeValues($lTypedPaths[$this->type]);
    }
  
    public function setDefaultDisplayVars($vars){
      $this->list_item_layout->displayed_vars = new SourceImmoDisplayVars($vars);
    }
  
    public function getViewEndpoint(){
      $lTypedPaths = array(
        'listings' => 'listing',
        'cities' => 'location/city',
        'brokers' => 'broker',
        'offices' => 'office'
      );
      return "{$lTypedPaths[$this->type]}/view";
    }
  }
  
  class SourceImmoDisplayVars {
    public $main = null;
    public $secondary = null;
  
    public function __construct($main=null, $secondary=null){
      $this->main = $main;
      $this->secondary = $secondary;
    }
  }
  
  class SourceImmoSearchEngineOptions {
    public $type = 'full';
    public $orientation = 'h';
    public $focus_category = null;
    public $sticky = false;
    public $tabs = null;
    public $tabbed = false;
    public $filter_tags = 'none';
    public $search_box_placeholder = array('en'=> 'Type here to begin your search...', 'fr' => 'Tapez ici pour commencer votre recherche ...');
    
    public function __construct($type=null){
  
      $this->normalizeValues($type);
  
    }
  
    public static function parse($source, $type){
      $result = new SourceImmoSearchEngineOptions($type);
      //__c('SourceImmoSearchEngineOptions::parse', $source);
  
      if($source != null){
        foreach ($source as $key => $value) {
          if(property_exists($result, $key)){
            if(is_object($result->{$key}) && method_exists($result->{$key},'parse')){
              $result->{$key}->parse($value);
            }
            else{
              $result->{$key} = $value;
            }
          }
        }
      }
      else{
        
      }
  
      return $result;
    }
  
    public function normalizeValues($type){
      switch($type){
        case 'listings':
          $this->focus_category = array();
          break;
        case 'brokers':
          $this->fields = array('searchbox','letters','licenses','offices');
          break;
      }
    }
  }
  
  
  class SourceImmoFilterGroup {
    public $operator = 'and';
    public $filters = null;
    public $filter_groups = null;
  
    public function __construct(){
      $this->filters = array();
      $this->filter_groups = array();
    }
  }
  
  class SourceImmoFilter {
    public $field = '';
    public $operator = 'equal';
    public $value = '';
  }
  

#endregion


class SourceImmoDictionary{
    public $entries = null;
  
    public function __construct($entries){
      $this->entries = $entries;
    }
  
    public function getCaption($key, $domain, $asAbbr=false){
      $lResult = $key;
      
      // check in rebound property if the 
      if(is_array($key)){
        return $this->getCaptionFrom($key[0], $key[1], $domain, $asAbbr);
      }
      
      if(isset($this->entries) && isset( $this->entries->{$domain}) && $this->entries->{$domain}){
          if(isset($this->entries->{$domain}->{$key})){
              if($asAbbr){
                  $lResult = $this->entries->{$domain}->{$key}->abbr;
              }
              else{
                
                  $lResult = $this->entries->{$domain}->{$key}->caption;
              }
          }
      }
      return $lResult;
    }
  
    public function getCaptionFrom($source, $key, $domain, $asAbbr=false){
        $dictionaryKey = isset($source->{$key}) ? $source->{$key} : '';
        
        if(!str_null_or_empty($dictionaryKey) && strpos($dictionaryKey,'_') === 0){
          $srcKey = str_replace('_code', $dictionaryKey,$key);
          
          if(isset($source->{$srcKey}) && !str_null_or_empty($source->{$srcKey})) {
            return $source->{$srcKey};
          }
        }
        
        return $this->getCaption($dictionaryKey, $domain, $asAbbr);
    }
  }