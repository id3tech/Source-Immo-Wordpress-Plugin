<?php

function _start_room_page($model){
    ?>
    <page class="rooms">
        <div class="page-layout">
    <?php
}

function _end_room_page($model){
    ?>
        </div>

    <header><?php ImmoDB::view('single/listings_layouts/print/header', array('model'=>$model))?></header>
    <footer><?php ImmoDB::view('single/listings_layouts/print/footer', array('model'=>$model))?></footer>

    </page>
    <?php
}

function _start_unit($model,$unit, $continuing_unit = false){
    echo('<div class="panel unit">');
    if(count($model->units)>1) { 
        if($continuing_unit){
            echo('<h3>' . StringPrototype::format(__('{0} unit (continue)',IMMODB), $unit->category) . '</h3>'); 
        }
        else{
            echo('<h3>' . StringPrototype::format(__('{0} unit',IMMODB),$unit->category) . '</h3>'); 
        }
    } 
    else{
        echo('<h3>' . __("Property's rooms",IMMODB) . '</h3>'); 
    }
}

function _end_unit(){
    echo('</div>');
}

function _start_room_list(){
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
}

function _new_page($model, $unit, $fromRoomsList=true){
    if($fromRoomsList){
        _end_room_list();
        _end_unit();
    }
    
    _end_room_page($model);

    _start_room_page($model);

    if($fromRoomsList){
        _start_unit($model, $unit, true);
        _start_room_list();
    }
    
}

function _end_room_list(){
    echo('</div>');
}

function _calc_space_taken($units, $rooms){
    $lUnitBaseValue = $units * (0.41 + 0.5 + 0.18);
    
    $lResult = $lUnitBaseValue + ($rooms * 0.377);

    return max($lResult, $lUnitBaseValue + 1.2);
}

$roomIndex = 0;
$unitIndex = 0;
if(isset($model->rooms)){
    _start_room_page($model);

    foreach ($model->units as $unit) {
        $unitIndex++;
        if(_calc_space_taken($unitIndex, $roomIndex) >= 10.25){
            _new_page($model,$unit, false);

            $roomIndex = 0;
            $unitIndex = 0;
        }

        _start_unit($model,$unit);

        $unitRoomList = array_filter($model->rooms, function($e) use ($unit) {
            return $e->unit_sequence == $unit->sequence;
        });

        if(count($unitRoomList)>0){   
            _start_room_list();

            foreach ($unitRoomList as $room) {
                $roomIndex += 1;
                if(_calc_space_taken($unitIndex, $roomIndex) >= 10.25){
                    echo('<div style="display:none;">' . _calc_space_taken($unitIndex, $roomIndex) . '</div>');
                    _new_page($model,$unit);

                    $roomIndex = 0;
                    $unitIndex = 0;
                }
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
            _end_room_list();
        }
        else{
            ?>
            <div class="summary-data">
                <?php 
                foreach ($unit->flags as $flag) {
                    echo('<div class="flag"><em>' . $flag['value'] . '</em><label>' . $flag['caption'] . '</label></div>');
                }
                ?>
            </div>
            <?php
        }
        
        _end_unit();
    }

    
    _end_room_page($model);
}
