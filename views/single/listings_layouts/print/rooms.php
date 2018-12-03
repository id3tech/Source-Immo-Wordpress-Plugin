<?php 
if(isset($model->rooms)){
    foreach ($model->units as $unit) {
        echo('<div class="panel">');
        if(count($model->units)>1) { 
            echo('<h3>' . StringPrototype::format(__('{0} unit',IMMODB),$unit->category) . '</h3>'); 
        } 
        else{
            echo('<h3>' . __("Property's rooms",IMMODB) . '</h3>'); 
        }

        $unitRoomList = array_filter($model->rooms, function($e) use ($unit) {
            return $e->unit_sequence == $unit->sequence;
        });

        if(count($unitRoomList)>0){   
            ?>
            <div class="room-list">
                <div class="room-item list-header">
                    <div class="type"></div>
                    <div class="level"><?php _e('Level',IMMODB) ?></div>
                    <div class="area"><?php _e('Size',IMMODB) ?></div>
                    <div class="floor"><?php _e('Flooring',IMMODB) ?></div>
                    <div class="infos"><?php _e('Infos',IMMODB) ?></div>
                </div>
            <?php
            foreach ($unitRoomList as $room) {
                ?>
                
                <div class="room-item">
                    <div class="type"><?php echo($room->category) ?></div>
                    <div class="level"><?php if(isset($room->level)){echo($room->level);}?> <?php echo($room->level_category) ?></div>
                    <div class="area"><?php echo($room->short_dimension) ?></div>
                    <div class="floor"><?php echo($room->flooring) ?></div>
                    <div class="infos"><?php if(isset($room->details)){echo($room->details);} ?></div>
                </div>
                <?php
            }
            ?>
            </div>
            <?php
        }
        echo('</div>');
    }
}
