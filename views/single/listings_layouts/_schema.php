<?php
$listingSchema = new ListingSchema($model);
echo($listingSchema->toJson());

if(isset($model->open_houses) && count($model->open_houses) > 0){
    foreach ($model->open_houses as $openHouse) {
        $ohSchema = new ListingOpenHouseSchema($model, $openHouse);
        echo($ohSchema->toJson());
    }
}

foreach ($model->brokers as $broker) {
    $brokerSchema = new BrokerSchema($broker);
    echo($brokerSchema->toJson());
}