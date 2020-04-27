<div class="infos">
    <h2><?php   _e('Integration', SI) ?></h2>
    <p><?php    _e('Choose pages in which you want to display your datas',SI) ?></p>
</div>

<div class="step-content">
    <div class="language-table" style="--col-count: {{wp_languages.length}}">
        <div class="row header">
            <div>
                <h3><i class="fas fa-home"></i> <?php _e('Listings',SI) ?></h3>
            </div>
            <div ng-repeat="lang in page_languages">
                <span>{{languages[lang]}}</span>
                <md-button class="md-icon-button"
                    ng-click="removePageLanguage(lang)"
                    ng-show="page_languages.length > 1">
                    <i class="fal fa-trash"></i>
                </md-button>
            </div>
            <div ng-repeat="lang in wp_languages | filter : languageIsAvailable">
                <md-button ng-click="addPageLanguage(lang)"><i class="fal fa-plus"></i>{{lang.name}}</md-button>
            </div>
        </div>

        <div class="row">
            <div>
                <label><?php _e('List page',SI) ?></label>
            </div>   
            <div class="pages" ng-repeat="lang in page_languages">
                <md-select ng-model="default_page[lang].listing">
                    <md-option value="NEW"><?php _e('(Create a new page)',SI) ?></md-option>
                    <md-option value="NONE"><?php _e('(Do not create page automatically)',SI) ?></md-option>
                    <md-option ng-repeat="item in wp_pages[lang]" value="{{item.ID}}" >{{item.post_title}}</md-option>
                </md-select>
            </div>
            <div ng-repeat="lang in wp_languages | filter : languageIsAvailable"></div>
        </div>
        <div class="row">
            <div>
                <label><?php _e('Page for details',SI) ?></label>
            </div>
            <div class="pages" ng-repeat="lang in page_languages">
                <md-select ng-model="default_page[lang].listing_details" ng-show="default_page[lang].listing != 'NONE'">
                    <md-option value="NEW"><?php _e('(Create a new page)',SI) ?></md-option>
                    <md-option value="NONE"><?php _e('(Do not create page automatically)',SI) ?></md-option>
                    <md-option ng-repeat="item in wp_pages[lang]" value="{{item.ID}}" >{{item.post_title}}</md-option>
                </md-select>
            </div>
            <div ng-repeat="lang in wp_languages | filter : languageIsAvailable"></div>
        </div>
        

        <div class="row group">
            <div>
                <h3><i class="fas fa-user"></i> <?php _e('Brokers',SI) ?></h3>
            </div>
            <div ng-repeat="lang in wp_languages">&nbsp;</div>
        </div>
        <div class="row">
            <div>
                <label><?php _e('List page',SI) ?></label>
            </div>
            <div class="pages"  ng-repeat="lang in page_languages">
                <md-select ng-model="default_page[lang].broker">
                    <md-option value="NEW"><?php _e('(Create a new page)',SI) ?></md-option>
                    <md-option value="NONE"><?php _e('(Do not create page automatically)',SI) ?></md-option>
                    <md-option ng-repeat="item in wp_pages[lang]" value="{{item.ID}}" >{{item.post_title}}</md-option>
                </md-select>
            </div>
            <div ng-repeat="lang in wp_languages | filter : languageIsAvailable"></div>
        </div>
        <div class="row">
            <div>
                <label><?php _e('Page for details',SI) ?></label>
            </div>
            <div class="pages"  ng-repeat="lang in page_languages">
                <md-select ng-model="default_page[lang].broker_details" ng-show="default_page[lang].broker != 'NONE'">
                    <md-option value="NEW"><?php _e('(Create a new page)',SI) ?></md-option>
                    <md-option value="NONE"><?php _e('(Do not create page automatically)',SI) ?></md-option>
                    <md-option ng-repeat="item in wp_pages[lang]" value="{{item.ID}}" >{{item.post_title}}</md-option>
                </md-select>
            </div>
            <div ng-repeat="lang in wp_languages | filter : languageIsAvailable"></div>
        </div>
        

        <div class="row group">
            <div><h3><i class="fas fa-building"></i> <?php _e('Offices',SI) ?></h3></div>
            <div ng-repeat="lang in wp_languages">&nbsp;</div>
        </div>
        <div class="row">
            <div>
                <label><?php _e('List page',SI) ?></label>
            </div>
            <div class="pages"  ng-repeat="lang in page_languages">
                <md-select ng-model="default_page[lang].office">
                    <md-option value="NEW"><?php _e('(Create a new page)',SI) ?></md-option>
                    <md-option value="NONE"><?php _e('(Do not create page automatically)',SI) ?></md-option>
                    <md-option ng-repeat="item in wp_pages[lang]" value="{{item.ID}}" >{{item.post_title}}</md-option>
                </md-select>
            </div>
            <div ng-repeat="lang in wp_languages | filter : languageIsAvailable"></div>
        </div>
        <div class="row">
            <div>
                <label><?php _e('Page for details',SI) ?></label>
            </div>
            <div class="pages"  ng-repeat="lang in page_languages">
                <md-select ng-model="default_page[lang].office_details" ng-show="default_page[lang].office != 'NONE'">
                    <md-option value="NEW"><?php _e('(Create a new page)',SI) ?></md-option>
                    <md-option value="NONE"><?php _e('(Do not create page automatically)',SI) ?></md-option>
                    <md-option ng-repeat="item in wp_pages[lang]" value="{{item.ID}}" >{{item.post_title}}</md-option>
                </md-select>
            </div>
            <div ng-repeat="lang in wp_languages | filter : languageIsAvailable"></div>
        </div>
        

        <div class="row group">
            <div>
                <h3><i class="fas fa-city"></i> <?php _e('Cities',SI) ?></h3>
            </div>
            <div ng-repeat="lang in wp_languages">&nbsp;</div>
        </div>
        <div class="row">
            <div>
                <label><?php _e('List page',SI) ?></label>
            </div>
            <div class="pages" ng-repeat="lang in page_languages">
                <md-select ng-model="default_page[lang].city">
                    <md-option value="NEW"><?php _e('(Create a new page)',SI) ?></md-option>
                    <md-option value="NONE"><?php _e('(Do not create page automatically)',SI) ?></md-option>
                    <md-option ng-repeat="item in wp_pages[lang]" value="{{item.ID}}" >{{item.post_title}}</md-option>
                </md-select>
            </div>
            <div ng-repeat="lang in wp_languages | filter : languageIsAvailable"></div>
        </div>
        <div class="row">
            <div>
                <label><?php _e('Page for details',SI) ?></label>
            </div>
            <div class="pages" ng-repeat="lang in page_languages">
                <md-select ng-model="default_page[lang].city_details" ng-show="default_page[lang].city != 'NONE'">
                    <md-option value="NEW"><?php _e('(Create a new page)',SI) ?></md-option>
                    <md-option value="NONE"><?php _e('(Do not create page automatically)',SI) ?></md-option>
                    <md-option ng-repeat="item in wp_pages[lang]" value="{{item.ID}}" >{{item.post_title}}</md-option>
                </md-select>
            </div>
            <div ng-repeat="lang in wp_languages | filter : languageIsAvailable"></div>
        </div>
        
    </div>

    <div class="apply-button">
        <md-button ng-click="skipPageBuilding()">{{'Skip'.translate()}}</md-button>
        <md-button class="md-primary md-raised" ng-click="applyShortCodeHandler()">{{'Apply pages'.translate()}}</md-button>
    </div>
</div>