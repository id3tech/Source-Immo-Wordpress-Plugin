<?php

?>
<div class="stream-list" ng-controller="streamListCtrl" ng-init="init()">

    <div class="stream-item" ng-repeat="stream in configs.streams">
        <div class="header" layout="row" layout-align="space-between start">
            <h3 class="md-headline" ng-click="edit(stream)">
                <span title="{{stream.alias.length > 20 ? stream.alias : ''}}">{{stream.alias}}</span>
                <sub>source: {{stream.source}}</sub>
            </h3>

            <md-menu>
                <md-button class="md-icon-button" ng-click="$mdOpenMenu()"><i class="fal  fa-lg fa-ellipsis-v"></i></md-button>
                <md-menu-content>
                    <md-menu-item>
                        <md-button ng-click="copy(getStreamShortcode(stream))"><md-icon class="fal fa-code"></md-icon> <?php _e('Copy shortcode',IMMODB) ?></md-button>
                    </md-menu-item>
                    <md-divider></md-divider>
                    <md-menu-item>
                        <md-button ng-disabled="configs.streams.length==1" ng-click="remove(stream)"><md-icon class="fal fa-times"></md-icon> <?php _e('Delete',IMMODB) ?></md-button>
                    </md-menu-item>
                </md-menu-content>
            </md-menu>
        </div>
        
        <div class="infos">
                <i>{{getStreamShortcode(stream)}}</i>
                <span><md-button class="md-icon-button" ng-click="copy(getStreamShortcode(stream))"><md-icon class="far fa-copy"></md-icon></md-button></span>

                <i class="far fa-lg fa-arrow-to-right"></i>
                <span>{{(stream.limit==0)? 'unlimited'.translate() : stream.limit}}</span>
            
                <i class="far fa-lg fa-sort-amount-down"></i>
                <span>{{stream.sort.translate()}}</span>
            
                <i class="far fa-lg fa-filter"></i>
                <span>{{(stream.filters==null)? 'none'.translate() : stream.filters.length}}</span>
            
        </div>
    </div>

    <div>
        <md-button class="md-icon-button md-primary md-raised" ng-click="add()"><i class="fal fa-plus"></i></md-button>
    </div>

</div>