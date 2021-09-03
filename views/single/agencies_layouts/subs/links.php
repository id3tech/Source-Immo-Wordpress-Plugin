<div class="si-detail-section link">
    <div class="link-list si-apply-typography" ng-if="model.main_office.links.socials.length > 0">
        <span>{{'Follow on'.translate()}}</span>
        <div class="item" data-ng-repeat="linkItem in model.main_office.links.socials">
            <a href="{{linkItem.url}}" target="_blank"><i class="fab fa-fw fa-{{linkItem.type}}"></i></a>
        </div>
    </div>
    <div class="website" ng-if="model.main_office.links.website">
        <a href="{{model.links.website}}" target="_blank">{{'Website'.translate()}} <i class="fal fa-external-link"></i></a>
    </div>
</div>