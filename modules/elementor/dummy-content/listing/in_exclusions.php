<div class="in-exclusions detail-section  ng-hide" data-ng-show="[model.inclusions, model.exclusions] | siHasValue">
                    <div class="title" data-ng-click="toggleSection('in_exclusions')">
                        <div>Inclusions et exclusions</div>
                        <div class="icon"><i class="fal fa-plus"></i><i class="fal fa-minus"></i></div>
                    </div>
                    <div class="detail-section-content">
                        <div class="spec ng-hide" data-ng-show="model.inclusions!=undefined">
                            <label>Inclusions</label>
                            <div class="ng-binding"></div>
                        </div>
                        <div class="spec ng-hide" data-ng-show="model.exclusions!=undefined">
                            <label>Exclusions</label>
                            <div class="ng-binding"></div>
                        </div>
                    </div>
                </div>