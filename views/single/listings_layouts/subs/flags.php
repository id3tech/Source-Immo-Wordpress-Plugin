<div class="flags">
    <div class="flag"
        data-ng-repeat="item in model.unit_flags"
        data-toggle="tooltip" data-placement="bottom" title="{{item.caption}}">
        <i class="fal fa-{{item.icon}}"></i>
        <em>{{item.value}}</em>
    </div>

    <div class="flag"
        data-ng-repeat="item in model.important_flags"
        data-toggle="tooltip" data-placement="bottom" title="{{item.caption}}">
        <i class="fal fa-{{item.icon}}"></i>
        <em data-ng-show="item.value>0">{{item.value}}</em>
    </div>
</div>