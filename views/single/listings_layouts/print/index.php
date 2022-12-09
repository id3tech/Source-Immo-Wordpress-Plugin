
<div class="print-default">
        <page class="front-page">
            
            <?php SourceImmo::view('single/listings_layouts/print/front', array('model'=>$model))?>
            
        </page>

        <page class="details">
            
            
            <div class="page-layout">
                <?php SourceImmo::view('single/listings_layouts/print/proximity_flags', array('model'=>$model))?>
                
                <?php SourceImmo::view('single/listings_layouts/print/addendum', array('model'=>$model))?>

                
                <?php SourceImmo::view('single/listings_layouts/print/inclusions', array('model'=>$model))?>
                <?php SourceImmo::view('single/listings_layouts/print/exclusions', array('model'=>$model))?>
    
            </div>
            <header><?php SourceImmo::view('single/listings_layouts/print/header', array('model'=>$model, 'page'=>'details'))?></header>
            <footer><?php SourceImmo::view('single/listings_layouts/print/footer', array('model'=>$model, 'page'=>'details'))?></footer>
        </page>

        <page class="details-part2">
            
            
            <div class="page-layout">

                <?php SourceImmo::view('single/listings_layouts/print/building', array('model'=>$model))?>
                <?php SourceImmo::view('single/listings_layouts/print/land', array('model'=>$model))?>
                <?php SourceImmo::view('single/listings_layouts/print/other', array('model'=>$model))?>
                <?php SourceImmo::view('single/listings_layouts/print/units', array('model'=>$model))?>
                <?php SourceImmo::view('single/listings_layouts/print/financial', array('model'=>$model))?>
                
                
            </div>
            <header><?php SourceImmo::view('single/listings_layouts/print/header', array('model'=>$model, 'page'=>'details'))?></header>
            <footer><?php SourceImmo::view('single/listings_layouts/print/footer', array('model'=>$model, 'page'=>'details'))?></footer>
        </page>

        <?php 
        
        if(isset($model->rooms) && is_array($model->rooms) && count($model->rooms) > 0){
            SourceImmo::view('single/listings_layouts/print/rooms', array('model'=>$model));
        }
        ?>

        <?php
        // split photos into groups of 12
        $photoGroups = array();
        $photoOffset = 0;
        while (count($model->photos) > $photoOffset*12) {
            $photoGroups[] = array_slice($model->photos,$photoOffset*12,12);
            $photoOffset++;
        }

        for ($i=0; $i < count($photoGroups); $i++) { 
        ?>
        <page class="photos">
            <header><?php SourceImmo::view('single/listings_layouts/print/header', array('model'=>$model, 'page'=>'photos'))?></header>
            <footer><?php SourceImmo::view('single/listings_layouts/print/footer', array('model'=>$model, 'page'=>'photos'))?></footer>
            
            <div class="page-layout">
                <h3><?php 
                    if(count($photoGroups) > 1){
                        echo StringPrototype::format(__("Property's photos ({0}/{1})",SI),$i+1, count($photoGroups));
                    }
                    else{
                        _e("Property's photos",SI);
                    }
                ?></h3>
                <div class="photo-list">
                    <?php
                    foreach ($photoGroups[$i] as $photo) {
                    ?>
                    <div class="item">
                        <div class="photo">
                            
                            <img src="<?php echo($photo->url) ?>" />
                        </div>
                        <label><?php echo($photo->category) ?></label>
                    </div>
                    <?php
                    }
                    ?>
                </div>
            </div>
        </page>
        <?php
        }
        ?>
        
        

        <page class="last-page">
            <?php SourceImmo::view('single/listings_layouts/print/back', array('model'=>$model))?>
        
                           
        </page>
</div>