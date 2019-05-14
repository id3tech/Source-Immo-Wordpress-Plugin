<div class="infos">
    <h2><?php   _e('Integration', IMMODB) ?></h2>
    <p><?php    _e('Choose a page in which you want to display your listings and another for your brokers',IMMODB) ?></p>
</div>

<div class="page-list">
    <md-input-container>
        <label><?php _e('Page for listings',IMMODB) ?></label>
        <md-select ng-model="default_listing_page">
        <md-option value="NEW"><?php _e('Create a new page',IMMODB) ?></md-option>
        <md-option ng-repeat="item in wp_pages.fr" value="{{item.ID}}" >{{item.post_title}}</md-option>
        </md-select>
    </md-input-container>

    <md-input-container>
        <label><?php _e('Page for brokers',IMMODB) ?></label>
        <md-select ng-model="default_broker_page">
        <md-option value="NEW"><?php _e('Create a new page',IMMODB) ?></md-option>
        <md-option ng-repeat="item in wp_pages.fr" value="{{item.ID}}" >{{item.post_title}}</md-option>
        </md-select>
    </md-input-container>

    <md-button class="apply-button" ng-click="applyShortCodeHandler()">{{'Apply'.translate()}}</md-button>
</div>