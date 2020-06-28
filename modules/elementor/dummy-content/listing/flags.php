<div class="flags">
    <div class="flag ng-scope" data-ng-repeat="item in model.important_flags" data-toggle="tooltip" data-placement="bottom" title="Chambre">
        <i class="fal fa-bed"></i>
        <em data-ng-show="item.value>0" class="ng-binding">5</em>
    </div>
    <div class="flag ng-scope" data-ng-repeat="item in model.important_flags" data-toggle="tooltip" data-placement="bottom" title="Salle de bains">
        <i class="fal fa-bath"></i>
        <em data-ng-show="item.value>0" class="ng-binding">2</em>
    </div>
    <div class="flag ng-scope" data-ng-repeat="item in model.important_flags" data-toggle="tooltip" data-placement="bottom" title="Salle d'eau">
        <i class="fal fa-hand-holding-water"></i>
        <em data-ng-show="item.value>0" class="ng-binding">1</em>
    </div>
    <div class="flag ng-scope" data-ng-repeat="item in model.important_flags" data-toggle="tooltip" data-placement="bottom" title="Foyers-poêles">
        <i class="fal fa-fire"></i>
        <em data-ng-show="item.value>0" class="ng-binding ng-hide">0</em>
    </div>
    <div class="flag ng-scope" data-ng-repeat="item in model.important_flags" data-toggle="tooltip" data-placement="bottom" title="Piscine">
        <i class="fal fa-swimmer"></i>
        <em data-ng-show="item.value>0" class="ng-binding ng-hide">0</em>
    </div>
    <div class="flag ng-scope" data-ng-repeat="item in model.important_flags" data-toggle="tooltip" data-placement="bottom" title="Stationnement (total)">
        <i class="fal fa-car"></i>
        <em data-ng-show="item.value>0" class="ng-binding">7</em>
    </div>
</div>