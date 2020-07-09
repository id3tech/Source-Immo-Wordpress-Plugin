<div class="page-layout">
    <div class="panel overlay dock-left">
        <div class="brokers">
            <h3><?php _e('Presented by',SI) ?></h3>
            <div class="broker-list">
                
            <?php
            foreach ($model->brokers as $broker) {
                SourceImmo::view('single/listings_layouts/print/broker', array('broker'=>$broker));
            }
            ?>
            </div>
        </div>

        <div class="recap">
            <?php
            $lnglat = $model->location->latitude . "," . $model->location->longitude ;
            $map_endpoint = "https://maps.googleapis.com/maps/api/staticmap?center=" . $lnglat . "&zoom=16&size=500x500&maptype=roadmap" .
                                "&markers=" . $lnglat . "&key=" . SourceImmo::current()->configs->map_api_key;
            ?>
            
            
            <div class="transaction"><?php echo($model->subcategory . ' ' . $model->transaction) ?></div>
            <div class="price"><?php echo($model->price_text) ?></div>
                    

            <div class="address">
                <div class="civic"><?php echo($model->location->civic_address)?></div>
                <div class="city"><?php echo($model->location->city) ?></div>
            </div>
            
            <div class="ref_number"><?php echo($model->ref_number) ?></div>
        </div>

        <div class="logo">
            <?php SourceImmo::view('single/listings_layouts/print/logo');?>
        </div>
    </div>

    <div class="panel overlay dock-right notepad">
            <h3><?php _e('Personnal notes',SI) ?></h3>
            <div class="handwrite-zone">
            </div>

            <img class="static-map" src="<?php echo $map_endpoint ?>" />
    </div>
</div>

<header><?php SourceImmo::view('single/listings_layouts/print/header', array('model'=>$model, 'page'=>'last'))?></header>
<footer><?php SourceImmo::view('single/listings_layouts/print/footer', array('model'=>$model, 'page'=>'last'))?></footer>
            