<div class="addendum detail-section" data-ng-show="model.addendum | siHasValue">
                    <div class="title" data-ng-click="toggleSection('addendum')">
                        <div>Addenda</div>
                        <div class="icon"><i class="fal fa-plus"></i><i class="fal fa-minus"></i></div>
                    </div>
                    <div class="detail-section-content"><span ng-bind-html="model.addendum | textToHtml" class="ng-binding">
                            <p>Immeuble giclé a 60%
                                <br>récemment utilisé pour une ressource intermédiaire
                                <br>20 unités disponible
                                <br>Système de sécurité
                                <br>Ascenseur</p>
                        </span></div>
                </div>