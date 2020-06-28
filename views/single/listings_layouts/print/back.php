<div class="page-layout">
    <div class="panel overlay dock-left brokers">
        <h3><?php _e('Presented by',SI) ?></h3>
        <div class="broker-list">
            
        <?php
        foreach ($model->brokers as $broker) {
            SourceImmo::view('single/listings_layouts/print/broker', array('broker'=>$broker));
        }
        ?>
        </div>

        
    </div>

    <div class="panel overlay dock-right notepad">
            <h3><?php _e('Personnal notes',SI) ?></h3>
            <div class="handwrite-zone">
            </div>
        
    </div>
</div>

<header><?php SourceImmo::view('single/listings_layouts/print/header', array('model'=>$model, 'page'=>'last'))?></header>
<footer><?php SourceImmo::view('single/listings_layouts/print/footer', array('model'=>$model, 'page'=>'last'))?></footer>
            