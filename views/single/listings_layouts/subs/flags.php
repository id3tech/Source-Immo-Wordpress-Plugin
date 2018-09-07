<div class="flags">
    <div class="flag"
        ng-repeat="item in model.important_flags"
        data-toggle="tooltip" data-placement="bottom" title="{{item.caption}}">
        <i class="fal fa-{{item.icon}}"></i>
        <em ng-show="item.value>0">{{item.value}}</em>
    </div>
</div>