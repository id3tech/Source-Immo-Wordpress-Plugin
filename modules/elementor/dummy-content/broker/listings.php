<si-small-list class="listing-list si-list-of-listings ng-isolate-scope loaded">
    <div class="list-header">
        <h3>5 propriétés</h3>
        <div class="search-input">
            <input placeholder="Filtrez la liste par mots-clés" ng-model="filter_keywords" class="ng-pristine ng-untouched ng-valid ng-empty">
            <i class="far fa-search"></i>
        </div>
    </div>
    
    <div class="list-container">
        <article class="si-item si-listing-item  si-single-layer-item-layout style-standard  ref-24631554">
            <a href="#">
                <div class="item-content">
                    <div class="image si-lazy-loading"><img src="<?php echo SI_PLUGIN_URL ?>/modules/elementor/assets/images/home-1.jpeg"></div>
                    <div class="si-data-label si-background-high-contrast civic-address ng-binding">1223 Rue Charbonneau&nbsp;</div>
                    <div class="si-data-label si-background-high-contrast city ng-binding">Smallville</div>
                    <div class="si-data-label si-background-medium-contrast price ng-binding">549 000 $</div>
                    <div class="si-data-label category ng-binding">Résidentiel</div>
                    <div class="si-data-label subcategory ng-binding">Condo</div>
                    <div class="flags">
                        <i class="video far fa-video"></i>
                        <i class="virtual-tour far fa-street-view"></i>
                    </div>
                    <div class="si-data-label rooms">
                        <!-- ngRepeat: (icon,room) in item.rooms -->
                        <div class="room bed" ng-repeat="(icon,room) in item.rooms"><i class="icon fal fa-fw fa-bed"></i> <span class="count ng-binding">3</span> <span class="label ng-binding">Bedrooms</span></div><!-- end ngRepeat: (icon,room) in item.rooms -->
                        <div class="room bath" ng-repeat="(icon,room) in item.rooms"><i class="icon fal fa-fw fa-bath"></i> <span class="count ng-binding">2</span> <span class="label ng-binding">Bathrooms</span></div><!-- end ngRepeat: (icon,room) in item.rooms -->
                        <div class="room hand-holding-water" ng-repeat="(icon,room) in item.rooms"><i class="icon fal fa-fw fa-hand-holding-water"></i> <span class="count ng-binding">1</span> <span class="label ng-binding">Powder room</span></div><!-- end ngRepeat: (icon,room) in item.rooms -->
                    </div>
                    <div class="si-data-label open-houses">
                        <div class="open-house-item">
                            <i class="fal fa-calendar-alt"></i> <span class="ng-binding">Visite libre</span> <span data-am-time-ago="item.open_houses[0].start_date"></span>
                        </div>
                    </div>
                </div>
            </a>
        </article><!-- end ngRepeat: item in list | filter : filter_keywords -->
        <!-- ngInclude: getItemTemplateInclude() -->
        <article class="si-item si-listing-item  si-single-layer-item-layout style-standard  ref-23246991">
            <a href="#">
                <div class="item-content">
                    <div class="image si-lazy-loading"><img src="<?php echo SI_PLUGIN_URL ?>/modules/elementor/assets/images/home-2.jpg"></div>
                    <div class="si-data-label si-background-high-contrast civic-address ng-binding">1045 rang Deschamps</div>
                    <div class="si-data-label si-background-high-contrast city ng-binding">Smallville</div>
                    <div class="si-data-label si-background-medium-contrast price ng-binding">334 500 $</div>
                    <div class="si-data-label category ng-binding">Résidentiel</div>
                    <div class="si-data-label subcategory ng-binding">Maison à étages</div>
                    <div class="flags">
                        <i class="video far fa-video"></i>
                        <i class="virtual-tour far fa-street-view"></i>
                    </div>
                    <div class="si-data-label rooms">
                        <!-- ngRepeat: (icon,room) in item.rooms -->
                        <div class="room bed" ng-repeat="(icon,room) in item.rooms"><i class="icon fal fa-fw fa-bed"></i> <span class="count ng-binding">3</span> <span class="label ng-binding">Bedrooms</span></div><!-- end ngRepeat: (icon,room) in item.rooms -->
                        <div class="room bath" ng-repeat="(icon,room) in item.rooms"><i class="icon fal fa-fw fa-bath"></i> <span class="count ng-binding">2</span> <span class="label ng-binding">Bathrooms</span></div><!-- end ngRepeat: (icon,room) in item.rooms -->
                        <div class="room hand-holding-water" ng-repeat="(icon,room) in item.rooms"><i class="icon fal fa-fw fa-hand-holding-water"></i> <span class="count ng-binding">1</span> <span class="label ng-binding">Powder room</span></div><!-- end ngRepeat: (icon,room) in item.rooms -->
                    </div>
                    <div class="si-data-label open-houses">
                        <div class="open-house-item">
                            <i class="fal fa-calendar-alt"></i> <span class="ng-binding">Visite libre</span> <span data-am-time-ago="item.open_houses[0].start_date"></span>
                        </div>
                    </div>
                </div>
            </a>
        </article><!-- end ngRepeat: item in list | filter : filter_keywords -->
        <!-- ngInclude: getItemTemplateInclude() -->
        <article class="si-item si-listing-item  si-single-layer-item-layout style-standard  ref-12228752">
            <a href="#">
                <div class="item-content">
                    <div class="image si-lazy-loading"><img src="<?php echo SI_PLUGIN_URL ?>/modules/elementor/assets/images/home-3.jpg"></div>
                    <div class="si-data-label si-background-high-contrast civic-address ng-binding">951 de la Montagne</div>
                    <div class="si-data-label si-background-high-contrast city ng-binding">Smallville</div>
                    <div class="si-data-label si-background-medium-contrast price ng-binding">315 000$</div>
                    <div class="si-data-label category ng-binding">Résidentiel</div>
                    <div class="si-data-label subcategory ng-binding">Maison à étages</div>
                    <div class="flags">
                        <i class="video far fa-video"></i>
                        <i class="virtual-tour far fa-street-view"></i>
                    </div>
                    <div class="si-data-label rooms">
                        <!-- ngRepeat: (icon,room) in item.rooms -->
                    </div>
                    <div class="si-data-label open-houses">
                        <div class="open-house-item">
                            <i class="fal fa-calendar-alt"></i> <span class="ng-binding">Visite libre</span> <span data-am-time-ago="item.open_houses[0].start_date"></span>
                        </div>
                    </div>
                </div>
            </a>
        </article><!-- end ngRepeat: item in list | filter : filter_keywords -->
        <!-- ngInclude: getItemTemplateInclude() -->
        <article class="si-item si-listing-item  si-single-layer-item-layout style-standard  ref-25338081">
            <a href="#">
                <div class="item-content">
                    <div class="image si-lazy-loading"><img src="<?php echo SI_PLUGIN_URL ?>/modules/elementor/assets/images/home-4.jpg"></div>
                    <div class="si-data-label si-background-high-contrast civic-address ng-binding">951-201 Ch. du Lac, app. 201&nbsp;</div>
                    <div class="si-data-label si-background-high-contrast city ng-binding">Smallville</div>
                    <div class="si-data-label si-background-medium-contrast price ng-binding">325 000 $+tx</div>
                    <div class="si-data-label category ng-binding">Résidentiel</div>
                    <div class="si-data-label subcategory ng-binding">Condo</div>
                    <div class="flags">
                        <i class="video far fa-video"></i>
                        <i class="virtual-tour far fa-street-view"></i>
                    </div>
                    <div class="si-data-label rooms">
                        <!-- ngRepeat: (icon,room) in item.rooms -->
                    </div>
                    <div class="si-data-label open-houses">
                        <div class="open-house-item">
                            <i class="fal fa-calendar-alt"></i> <span class="ng-binding">Visite libre</span> <span data-am-time-ago="item.open_houses[0].start_date"></span>
                        </div>
                    </div>
                </div>
            </a>
        </article><!-- end ngRepeat: item in list | filter : filter_keywords -->
        <!-- ngInclude: getItemTemplateInclude() -->
        <article class="si-item si-listing-item  si-single-layer-item-layout style-standard  ref-10190422">
            <a href="#">
                <div class="item-content">
                    <div class="image si-lazy-loading"><img src="<?php echo SI_PLUGIN_URL ?>/modules/elementor/assets/images/home-5.jpg"></div>
                    <div class="si-data-label si-background-high-contrast civic-address ng-binding">11111 Boul. Wayne</div>
                    <div class="si-data-label si-background-high-contrast city ng-binding">Gotham City</div>
                    <div class="si-data-label si-background-medium-contrast price ng-binding">1 650 000 $</div>
                    <div class="si-data-label category ng-binding">Résidentiel</div>
                    <div class="si-data-label subcategory ng-binding">Maison à étages</div>
                    <div class="flags">
                        <i class="video far fa-video"></i>
                        <i class="virtual-tour far fa-street-view"></i>
                    </div>
                    <div class="si-data-label rooms">
                        <!-- ngRepeat: (icon,room) in item.rooms -->
                    </div>
                    <div class="si-data-label open-houses">
                        <div class="open-house-item">
                            <i class="fal fa-calendar-alt"></i> <span class="ng-binding">Visite libre</span> <span data-am-time-ago="item.open_houses[0].start_date"></span>
                        </div>
                    </div>
                </div>
            </a>
        </article><!-- end ngRepeat: item in list | filter : filter_keywords -->
    </div>
</si-small-list>