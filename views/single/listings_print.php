<?php
    add_filter('wp_title', function($parts) use ($model){
        return $model->location->full_address . ' - ' . $model->subcategory;
    }, 10);
    add_filter('document_title_parts', function($parts) use ($model){
        return [$model->location->full_address, $model->subcategory];
    }, 10);
    
?>

<html class="listings print">
    <head>
        <?php wp_head(); ?>
        <meta name="format-detection" content="telephone=no">
    </head>
    <body>

        <?php if(isset($_GET['infos'])) {
            echo('<div class="info-panel">');
            __json($model->attributes);
            echo('</div>');
        }?>

<?php
    $printLayout = dirname(__FILE__) . '/listings_layouts/print/index.php';
    //$listingMarket = $model->
    
    $printLayoutVariants = [$model->subcategory_code . '-' . $model->category, $model->category];
    
    array_push($printLayoutVariants, implode('-',$model->market_codes));
    foreach($model->market_codes as $code){
        if(!in_array($code,$printLayoutVariants)){
            array_push($printLayoutVariants, $code);
        }
    }

    foreach ($printLayoutVariants as $value) {
        $value = sanitize_title($value);
        $printDirectory = dirname(__FILE__) . '/listings_layouts/print-' . $value . '/index.php';
        if(file_exists($printDirectory)){
            $printLayout = $printDirectory;
            break;
        }
    }
    $printLayout = apply_filters('si/listing/printLayout', $printLayout, $model);
    

    include $printLayout;
?>

        <button class="print-button" onclick="fnPrint()"><i class="fal fa-print"></i></button>
        <script type="text/javascript">
        const fnPrint = function(){
            window.print();
        }
        </script>

        
    </body>
</html>