<?php
$builder = new PDFBuilder('P', array(
    'family'=>'OpenSans', 
    'style'=> '',
    'size' => 10
  ));

$builder->SetTitle($model->location->full_address);
// First page
$builder->addPage();

$builder->drawRectangle($builder->pageColumn(3/5),0,$builder->pageColumn(2/5),26, '#ff9900');
$builder->withFont(20)->at($builder->pageColumn(3/5) + 5,10)->addText($model->price_text,$builder->pageColumn(2/5)-10,0,'#fff','R');

$builder->drawRectangle(0,0,$builder->pageColumn(3/5),26, '#cccccc');
$builder->withFont(20)->at(5,10)->addText(mb_strtoupper($model->subcategory . ' ' . $model->transaction));
$builder->addText($model->location->full_address);

$builder->moveBy(0,5)->addText($model->description,$builder->pageColumn(3/5) - 15);


$builder->render();