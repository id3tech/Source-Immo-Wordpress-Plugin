<si-small-list class="brokers broker-list si-list-of-brokers ng-isolate-scope loaded" si-options="{show_header:true, filter:{max_item_count: 0,sort_fields:[]}}" si-type="brokers" si-filters="getBrokerListFilter()">
                    <div class="list-container" si-lazy-load="">
                        <!-- ngRepeat: item in list | filter : filter_keywords -->
                        <!-- ngInclude: getItemTemplateInclude() -->
                        <article class="si-item si-broker-item si-card-item-layout ref-98718 license-e7655 license-type-broker">
                            <div class="photo">
                                <img src="<?php echo SI_PLUGIN_URL ?>/modules/elementor/assets/images/broker-1.jpg">
                            </div>
                            <div class="name ng-binding">John Doe</div>
                            <div class="license ng-binding">Courtier immobilier</div>
                            <div class="contact">
                                <!-- ngRepeat: (key,phone) in item.phones -->
                                <div class="phone ng-binding ng-scope">bureau : (514) 555-1360</div><!-- end ngRepeat: (key,phone) in item.phones -->
                            </div>
                            <div class="actions">
                                <a class="button ng-binding" href="#">Autres propriétés</a>
                            </div>

                        </article><!-- end ngRepeat: item in list | filter : filter_keywords -->
                    </div>
                </si-small-list>