<?php
if(isset(SourceImmo::current()->configs->map_api_key) && (SourceImmo::current()->configs->map_api_key != '')){
    $lnglat = $model->location->latitude . "," . $model->location->longitude ;
    $map_endpoint = "https://maps.googleapis.com/maps/api/staticmap?center=" . $lnglat . "&zoom=16&size=500x500&maptype=roadmap" .
                        "&markers=" . $lnglat . "&key=" . SourceImmo::current()->configs->map_api_key;
    ?>
    <div class="panel overlay dock-bottom map">
        <img class="static-map" src="<?php echo $map_endpoint ?>" />
        <div class="notepad">
            <h4><?php _e('Note how to go there',SI) ?></h4>
            <div class="handwrite-zone">
            </div>
        </div>
    </div>
    <?php
}