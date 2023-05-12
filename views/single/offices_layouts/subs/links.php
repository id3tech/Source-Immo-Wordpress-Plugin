<div class="si-detail-section link">
    <div class="si-link-list si-apply-typography" ng-if="model.links.socials.length > 0">
        <div class="si-item" data-ng-repeat="linkItem in model.links.socials">
            <a href="{{linkItem.url}}" target="_blank"><i class="fab fa-fw fa-{{linkItem.type}}"></i></a>
        </div>
    </div>
    <div class="si-website" ng-if="model.links.website">
        <a href="{{model.links.website}}" target="_blank">{{'Website'.translate()}} <i class="fal fa-external-link"></i></a>
    </div>
</div>