<div class="header {{model.status=='SOLD'? 'is-sold':''}}">
    
    <div class="price">
        <div>{{model.long_price}}</div>
        <div class="mortgage" ng-show="model.status!='SOLD' && model.price.sell!=undefined"><?php _e('Estimated mortgage payments',IMMODB) ?>: <a href="#" ng-click="scrollTo('#calculator')">{{calculator_result.mortgage.payment.formatPrice()}} {{calculator_result.mortgage.frequency_caption.translate().toLowerCase()}}</a></div>
    </div>
    <div class="subcategory">{{model.subcategory}}</div>
    <div class="city">{{model.location.city}}</div>

    <div class="tools">
        <button type="button"><i class="fal fa-share-alt"></i></button>
        <button type="button"><i class="fal fa-print"></i></button>
        <button type="button"><i class="fal fa-heart"></i></button>
    </div>

    <div class="information_request">
        <button type="button" data-toggle="modal" data-target="#information_request"><i class="fal fa-info"></i> <?php _e('Information request',IMMODB) ?></button>
    </div>
</div>

<div class="medias select-{{selected_media}}">
    <div class="tabs">
        <button type="button" class="tab pictures {{selected_media=='pictures'?'selected':''}}" ng-click="selected_media='pictures'"><?php _e('Pictures',IMMODB)?></button>
        <button type="button" class="tab videos {{selected_media=='videos'?'selected':''}}" ng-click="selected_media='videos'"><?php _e('Videos',IMMODB)?></button>
        <button type="button" class="tab streetview {{selected_media=='streetview'?'selected':''}}" ng-click="selected_media='streetview'"><?php _e('Street view',IMMODB)?></button>
        <button type="button" class="tab map {{selected_media=='map'?'selected':''}}" ng-click="selected_media='map'"><?php _e('Map',IMMODB)?></button>
    </div>
    <div class="viewport">
        <div class="trolley">
            <div class="tab-content picture-gallery">
                <immodb-image-slider immodb-pictures="model.photos" immodb-gap="0"></immodb-image-slider>
            </div>
            <div class="tab-content videos">
                <label class="placeholder"><?php _e('Videos',IMMODB)?></label>
            </div>
            <div class="tab-content streetview">
                <label class="placeholder"><?php _e('Street view',IMMODB)?></label>
            </div>
            <div class="tab-content map">
                <label class="placeholder"><?php _e('Map',IMMODB)?></label>
                <immodb-map class="detail-map" zoom="14" latlng="{lat: model.location.latitude, lng: model.location.longitude}"></immodb-map>
            </div>
        </div>
    </div>
</div>

<div class="summary">
    <div class="ref-number">{{model.ref_number}}</div>
    <div class="address" ng-show="model.location.full_address!=undefined">{{model.location.full_address}}</div>
    <div class="near" ng-show="model.location.details!=undefined">{{model.location.details}}</div>
    <div class="city" ng-show="model.location.address==undefined">{{model.location.city}}</div>
    <div class="region">{{model.location.region}}</div>
    <div class="state">{{model.location.state}}</div>
    

    <div class="description">{{model.description}}</div>

    <div class="flags">
        <div class="flag"
            ng-repeat="item in model.important_flags"
            data-toggle="tooltip" data-placement="bottom" title="{{item.caption}}">
            <i class="fal fa-{{item.icon}}"></i>
            <em ng-show="item.value>0">{{item.value}}</em>
        </div>
    </div>
    
</div>

<div class="details">
    <div class="left">
        <div class="addendum section {{sectionOpened('addendum')?'opened':''}}" ng-show="model.addendum!=undefined">
            <div class="title" ng-click="toggleSection('addendum')"><div><?php _e('Addendum',IMMODB) ?></div> <div class="icon"><i class="fal fa-plus"></i><i class="fal fa-minus"></i></div></div>
            <div class="content">{{model.addendum}}</div>
        </div>

        <div class="building-specs section {{sectionOpened('building')?'opened':''}}">
            <div class="title" ng-click="toggleSection('building')">
                <div><?php _e('Building and interior',IMMODB) ?></div> 
                <div class="icon"><i class="fal fa-plus"></i><i class="fal fa-minus"></i></div></div>
            <div class="content spec-grid">
                <div class="spec" ng-repeat="spec in model.building.attributes">
                    <label>{{spec.caption}}</label>
                    <div><span ng-repeat="value in spec.values">{{value.caption}}</span></div>
                </div>
            </div>
        </div>

        <div class="lot-specs section {{sectionOpened('lot')?'opened':''}}">
            <div class="title" ng-click="toggleSection('lot')">
                <div><?php _e('Lot and exterior',IMMODB) ?></div>
                <div class="icon"><i class="fal fa-plus"></i><i class="fal fa-minus"></i></div>
            </div>
            <div class="content spec-grid">
                <div class="spec" ng-repeat="spec in model.lot.attributes">
                    <label>{{spec.caption}}</label>
                    <div><span ng-repeat="value in spec.values">{{value.caption}}</span></div>
                </div>
            </div>
        </div>

        <div class="other-specs section {{sectionOpened('other')?'opened':''}}">
            <div class="title" ng-click="toggleSection('other')">
                <div><?php _e('Other characteristics',IMMODB) ?></div>
                <div class="icon"><i class="fal fa-plus"></i><i class="fal fa-minus"></i></div>
            </div>
            <div class="content spec-grid">
                <div class="spec" ng-repeat="spec in model.other.attributes">
                    <label>{{spec.caption}}</label>
                    <div><span ng-repeat="value in spec.values">{{value.caption}}</span></div>
                </div>
            </div>
        </div>

        <div class="in-exclusions section {{sectionOpened('in_exclusions')?'opened':''}}">
            <div class="title" ng-click="toggleSection('in_exclusions')">
                <div><?php _e('Included & excluded',IMMODB) ?></div> 
                <div class="icon"><i class="fal fa-plus"></i><i class="fal fa-minus"></i></div>
            </div>
            <div class="content">
                <div class="spec">
                    <label><?php _e('Included',IMMODB) ?></label>
                    <div>{{model.inclusions}}</div>
                </div>
                <div class="spec">
                    <label><?php _e('Excluded',IMMODB) ?></label>
                    <div>{{model.exclusions}}</div>
                </div>
            </div>
        </div>

        

    </div>
    <div class="right">
        
        <div class="brokers">
            <div class="broker" ng-repeat="broker in model.brokers">
                <div class="photo"><img src="{{broker.photo_url}}" /></div>
                <div class="name">{{broker.first_name}} {{broker.last_name}}</div>
                <div class="contact">
                    <div class="phone" ng-repeat="(key,phone) in broker.phones">{{key.translate()}} : {{phone}}</div>
                </div>
                <div class="actions">
                    <a class="button" href="/{{broker.detail_link}}">{{'See {0}\'s {1} other properties'.translate().format(broker.first_name, broker.listings_count-1)}}</a>
                </div>
            </div>
        </div>
        
        <div id="calculator" class="mortgage-calculator" ng-show="model.status!='SOLD' && model.price.sell!=undefined">
            <div class="title"><i class="fal fa-calculator"></i> <?php _e('Estimate your mortgage',IMMODB) ?></div>
            <immodb-calculator immodb-amount="model.price.sell.amount" on-change="onMortgageChange($result)" immodb-region="{{model.location.region_code}}"></immodb-calculator>

            <div class="result">
                <div class="mortgage">
                    <label><?php _e('Estimated mortgage payments',IMMODB) ?></label>
                    <div class="value"><em>{{calculator_result.mortgage.payment.formatPrice()}}</em>{{calculator_result.mortgage.frequency_caption.translate().toLowerCase()}}</div>
                </div>
                <div class="transfer-taxes">
                    <label><?php _e('Transfer taxes:',IMMODB) ?></label>
                    <div class="value"><em>{{calculator_result.transfer_tax.formatPrice()}}</em></div>
                </div>
            </div>
        </div>
    </div>
</div>

<immodb-modal 
        modal-id="information_request" 
        modal-title="Information request"
        ok-label="Send"
        on-ok="sendMessage()">
    <div class="firstname input-container">
        <label><?php _e('First name', IMMODB) ?></label>
        <div class="input">
            <input type="text" ng-model="message_model.firstname" />
        </div>
    </div>

    <div class="lastname input-container">
        <label><?php _e('Last name', IMMODB) ?></label>
        <div class="input" ng-model="message_model.lastname">
            <input type="text" />
        </div>
    </div>

    <div class="phone input-container">
        <label><?php _e('Phone', IMMODB) ?></label>
        <div class="input">
            <input type="text" ng-model="message_model.phone" />
        </div>
    </div>

    <div class="email input-container">
        <label><?php _e('Email', IMMODB) ?></label>
        <div class="input">
            <input type="text" ng-model="message_model.email" />
        </div>
    </div>

    <div class="subject input-container">
        <label><?php _e('Subject', IMMODB) ?></label>
        <div class="input">
            <input type="text" ng-model="message_model.subject" />
        </div>
    </div>

    <div class="message input-container">
        <label><?php _e('Message', IMMODB) ?></label>
        <div class="input">
            <textarea rows="5" ng-model="message_model.message"></textarea>
        </div>
    </div>
</immodb-modal>










