<div class="rooms detail-section" data-ng-show="[model.rooms, model.units] | siHasValue">
                    <div class="title" data-ng-click="toggleSection('rooms')">
                        <div class="ng-binding">
                            Pièces
                        </div>
                        <div class="icon"><i class="fal fa-plus"></i><i class="fal fa-minus"></i></div>
                    </div>
                    <div class="detail-section-content">
                        <!-- ngRepeat: unit in model.units track by $index -->
                        <div class="unit-list ng-scope" data-ng-repeat="unit in model.units track by $index">
                            <h4 class="title ng-hide" data-ng-show="['OFFICE','INDUSTRY','COMMERCIAL'].includes(unit.category_code) || model.units.length>1">
                                <span class="ng-binding">Unité Chambre</span>
                                <span class="area ng-binding ng-hide" data-ng-show="unit.dimension | siHasValue"> </span>
                            </h4>

                            <div class="flags ng-hide" data-ng-show="model.units.length>1" style="--unit-flag-count:0;">
                                <div class="spacer"></div>
                                <!-- ngRepeat: flag in unit.flags track by $index -->
                            </div>

                            <div class="room-list ng-hide" ng-show="(model.rooms | filter : {'unit_sequence' : unit.sequence}).length > 0">
                                <div class="room-item list-header">
                                    <div class="type"></div>
                                    <div class="level">Niveau</div>
                                    <div class="floor">Plancher</div>
                                </div>
                                <!-- ngRepeat: room in model.rooms | filter : {'unit_sequence' : unit.sequence} track by $index -->
                            </div>
                        </div><!-- end ngRepeat: unit in model.units track by $index -->
                    </div>
                </div>