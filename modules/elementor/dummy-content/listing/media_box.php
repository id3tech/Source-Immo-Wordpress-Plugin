<div class="si-mediabox medias select-pictures picture-list-grid" si-model="model" si-picture-list-as="grid">
            <div class="tabs">
                <span class="tab pictures selected">
                    <i class="fal fa-camera"></i> <span class="ng-binding">Photos (17)</span></span>
                <span class="tab videos">
                    <i class="fal fa-video"></i> <span class="ng-binding">Video</span></span>
                <span class="tab virtual-tours">
                    <i class="fal fa-vr-cardboard"></i> <span class="ng-binding">Visite virtuelle</span></span>
                <span class="tab streetview">
                    <i class="fal fa-street-view"></i> <span class="ng-binding">Vue du quartier</span></span>
                <span class="tab map">
                    <i class="fal fa-map"></i> <span class="ng-binding">Carte</span></span>
            </div>
            <div class="viewport">
                <div class="trolley">
                    <div class="tab-content picture-gallery">
                        <!-- ngIf: tabIsAvailable('pictures') -->

                        <div class="si-image-slider   " style="--item-count:41;--item-index:0;--viewport-width:870px;--viewport-height:630px;" ng-dblclick="toggleFullscreen($event)" data-ng-if="tabIsAvailable('pictures')" data-si-pictures="model.photos" data-si-picture-fit="cover" data-si-gap="0" data-si-show-picture-grid="pictureListDisplay!='thumbnails'">
                            <div class="viewport"> 
                                <div class="trolley" style="">
                                    <!-- ngRepeat: img in pictures track by $index -->
                                    <div class="item ng-scope" data-ng-repeat="img in pictures track by $index">
                                        <img alt="Frontage" si-image-auto-fit="cover" src="<?php echo SI_PLUGIN_URL ?>styles/assets/shadow_listing.jpg" style="object-fit: cover;">
                                        <div class="caption"><label class="ng-binding">Frontage</label></div>
                                    </div>
                                </div>
                                
                            </div>

                            <div class="picture-grid-viewport">
                                <div class="trolley">
                                    <!-- ngRepeat: img in pictures track by $index -->
                                    <div class="item ng-scope si-highlight">
                                        <img  alt="Frontage" src="<?php echo SI_PLUGIN_URL ?>styles/assets/shadow_listing.jpg">
                                    </div><!-- end ngRepeat: img in pictures track by $index -->
                                    <div class="item ng-scope">
                                        <img  alt="Hallway" src="<?php echo SI_PLUGIN_URL ?>styles/assets/shadow_listing.jpg">
                                    </div><!-- end ngRepeat: img in pictures track by $index -->
                                    <div class="item ng-scope">
                                        <img alt="Hallway" src="<?php echo SI_PLUGIN_URL ?>styles/assets/shadow_listing.jpg">
                                    </div><!-- end ngRepeat: img in pictures track by $index -->
                                    <div class="item ng-scope">
                                        <img  alt="Living room" src="<?php echo SI_PLUGIN_URL ?>styles/assets/shadow_listing.jpg">
                                    </div>
                                </div>
                            </div>

                            <div class="navigation-controls" data-ng-show="pictures.length > 1">
                                <div class="nav-btn next" ><i class="fal fa-fw fa-angle-right"></i></div>
                                <div class="nav-btn previous"><i class="fal fa-fw fa-angle-left"></i></div>
                            </div>
                            
                            <div class="controls">
                                <!-- ngIf: !model.expand_mode --><div class="nav-btn expand ng-scope" ng-if="!model.expand_mode"><i class="fas fa-expand-wide"></i> <label class="ng-binding">Fullscreen</label></div><!-- end ngIf: !model.expand_mode -->
                                <!-- ngIf: model.expand_mode -->
                            </div>

                        </div>




                        
                        <div class="si-image-slider   " data-ng-if="tabIsAvailable('pictures')" data-si-pictures="model.photos" data-si-gap="0" data-si-show-picture-grid="pictureListDisplay!='thumbnails'" 
                            style="display:none;touch-action: pan-y; user-select: none; -webkit-user-drag: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); --viewport-width:100%; --viewport-height:460px;">
                            <div class="viewport">
                                <div class="trolley" style="--item-count:17;--item-index:0">
                                    <!-- ngRepeat: img in pictures track by $index -->
                                    <div class="item ng-scope" data-ng-repeat="img in pictures track by $index">
                                        <img src="<?php echo SI_PLUGIN_URL ?>/modules/elementor/assets/images/home-1.jpeg" style="object-fit: cover;">
                                        <div class="caption"><label class="ng-binding">Façade</label></div>
                                    </div>
                                </div>

                                <div class="navigation-controls">
                                    <div class="nav-btn next"><i class="fal fa-fw fa-angle-right"></i></div>
                                    <div class="nav-btn previous"><i class="fal fa-fw fa-angle-left"></i></div>
                                </div>

                                <div class="controls">
                                    <div class="nav-btn picture-grid"><i class="fas fa-th"></i> <label class="ng-binding">Toutes les images</label></div>
                                    <div class="nav-btn expand"><i class="fas fa-expand-wide"></i> <label class="ng-binding">Plein écran</label></div>
                                </div>
                            </div>

                        </div>

                        
                    </div><!-- end ngIf: tabIsAvailable('pictures') -->
                    <div class="tab-content videos">
                        <label class="placeholder ng-binding">Video</label>
                        <!-- ngIf: tabIsAvailable('video') --><iframe data-ng-if="tabIsAvailable('video')" id="video-player" allowfullscreen="1" class="ng-scope"></iframe><!-- end ngIf: tabIsAvailable('video') -->
                    </div>
                    <div class="tab-content virtual-tours">
                        <label class="placeholder ng-binding">Visite virtuelle</label>
                        <!-- ngIf: tabIsAvailable('virtual-tours') --><iframe data-ng-if="tabIsAvailable('virtual-tours')" allowfullscreen="1" class="ng-scope"></iframe><!-- end ngIf: tabIsAvailable('virtual-tours') -->
                    </div>
                    <div class="tab-content streetview">
                        <label class="placeholder ng-binding">Vue du quartier</label>
                        <!-- ngIf: tabIsAvailable('streetview') -->
                    </div>
                    <div class="tab-content map">
                        <label class="placeholder ng-binding">Carte</label>
                        <!-- ngIf: tabIsAvailable('map') -->
                    </div>
                </div>
            </div>
            
        </div>