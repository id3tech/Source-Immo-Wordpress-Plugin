<?php

?>
<div class="list-list" ng-controller="listCollectionCtrl" ng-init="init()">

    <div class="list-item" ng-repeat="list in configs.lists">
        <div class="header" layout="row" layout-align="space-between start"  ng-click="edit(list)">
            <h3 class="md-headline">
                <span title="{{list.alias.length > 20 ? list.alias : ''}}">{{list.alias}}</span>
                <sub>source: {{list.source.name}}</sub>
            </h3>

            <md-menu>
                <md-button class="md-icon-button" ng-click="$mdOpenMenu();$event.stopPropagation()"><i class="fal  fa-lg fa-ellipsis-v"></i></md-button>
                <md-menu-content>
                    <md-menu-item>
                        <md-button ng-click="copy(getListShortcode(list))"><md-icon class="fal fa-code"></md-icon> <?php _e('Copy shortcode',SI) ?></md-button>
                    </md-menu-item>
                    <md-divider></md-divider>
                    <md-menu-item>
                        <md-button ng-disabled="configs.lists.length==1" ng-click="remove(list)"><md-icon class="fal fa-times"></md-icon> <?php _e('Delete',SI) ?></md-button>
                    </md-menu-item>
                </md-menu-content>
            </md-menu>
        </div>
        
        <div class="infos">
                <i>{{getListShortcode(list)}}</i>
                <span><md-button class="md-icon-button" ng-click="copy(getListShortcode(list))"><md-icon class="far fa-copy"></md-icon></md-button></span>

                <i class="far fa-lg fa-arrow-to-right"></i>
                <span>{{(list.limit==0)? 'unlimited'.translate() : list.limit}}</span>
            
                <i class="far fa-lg fa-sort-amount-{{list.sort_reverse?'down':'up'}}"></i>
                <span>{{list.sort.translate()}}</span>
            
                <i class="far fa-lg fa-filter"></i>
                <span>{{(countFilters(list)==0)? 'none'.translate() : countFilters(list)}}</span>

                <i class="far fa-lg fa-th-list"></i>
                <span>{{list.list_layout.preset}}/{{list.list_item_layout.preset}}</span>
            
        </div>
    </div>

    <div>
        <md-button class="md-icon-button md-primary md-raised" ng-click="add()"><i class="fal fa-plus"></i></md-button>
    </div>

</div>