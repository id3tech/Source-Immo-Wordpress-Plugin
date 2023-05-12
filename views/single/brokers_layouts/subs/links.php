<div class="si-detail-section si-link-container si-apply-typography">
    <div class="si-website-link " ng-if="false && model.links.website">
        <a href="{{model.links.website}}" class="id3-button id3-type-normal" target="_blank"><span>{{'Website'.translate()}}</span> <i class="fal fa-external-link"></i></a>
    </div>

    <div class="si-link-list" ng-if="model.links.website || model.links.socials.length > 0">
        <div class="si-link-item" ng-if="model.links.website">
            <a href="{{model.links.website}}" target="_blank"><i class="fal fa-globe"></i></a>
        </div>

        <div class="si-link-item" data-ng-repeat="linkItem in model.links.socials">
            <a href="{{linkItem.url}}" target="_blank"><i class="fab fa-fw fa-{{linkItem.type}}"></i></a>
        </div>
    </div>
    
</div>