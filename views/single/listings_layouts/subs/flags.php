<div class="si-flags" ng-if="[model.unit_flags,model.important_flags] | siHasValue">
    <div class="si-flag"
        data-ng-repeat="item in model.unit_flags"
        data-toggle="tooltip" data-placement="bottom" title="{{item.caption}}">
        <i class="fal fa-fw fa-{{item.icon}}"></i>
        <em>{{item.value}}</em>
    </div>

    <div class="si-flag"
        data-ng-repeat="item in model.important_flags"
        data-toggle="tooltip" data-placement="bottom" title="{{item.caption}}">
        <i class="fal fa-fw fa-{{item.icon}}"></i>
        <em data-ng-show="item.value | siHasValue">{{item.value}}</em>
    </div>
</div>