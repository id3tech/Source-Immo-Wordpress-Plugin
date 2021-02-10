<div class="rooms si-detail-section" data-ng-show="[model.rooms, model.units] | siHasValue">
                    <div class="si-title" data-ng-click="toggleSection('rooms')">
                        <div class="ng-binding">
                            Pièces
                        </div>
                        <div class="si-icon"><i class="fal fa-plus"></i><i class="fal fa-minus"></i></div>
                    </div>
                    <div class="si-detail-section-content">
                        <!-- ngRepeat: unit in model.units track by $index -->
                        <div class="unit-list ng-scope" data-ng-repeat="unit in model.units track by $index">

                            <div class="room-list">
                                <div class="room-item list-header">
                                    <div class="type"></div>
                                    <div class="level">Niveau</div>
                                    <div class="floor">Plancher</div>
                                </div>
                                <div class="room-item ">
                                    <div class="type">Salon</div>
                                    <div class="level">1er étage</div>
                                    <div class="floor">Bois</div>
                                </div>
                                <div class="room-item ">
                                    <div class="type">Chambre</div>
                                    <div class="level">1er étage</div>
                                    <div class="floor">Bois</div>
                                </div>
                                <div class="room-item ">
                                    <div class="type">Cuisine</div>
                                    <div class="level">1er étage</div>
                                    <div class="floor">Céramique</div>
                                </div>
                                <div class="room-item ">
                                    <div class="type">Salle de bain</div>
                                    <div class="level">1er étage</div>
                                    <div class="floor">Céramique</div>
                                </div>
                                <!-- ngRepeat: room in model.rooms | filter : {'unit_sequence' : unit.sequence} track by $index -->
                            </div>
                        </div><!-- end ngRepeat: unit in model.units track by $index -->
                    </div>
                </div>