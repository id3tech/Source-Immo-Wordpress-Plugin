<div class="si-summary si-apply-typography">
    <div class="si-label ref-number">111111111</div>
    
    <?php si_dummy_include('listing/location.php') ?>
    

    <?php si_dummy_include('listing/description.php') ?>

    <div class="links" ng-show="model.links">
        <!-- ngRepeat: (key,item) in model.links track by $index -->
    </div>
    <div class="attachments ng-hide" ng-show="model.documents.length>0">
        <!-- ngRepeat: item in model.documents -->
    </div>

    <?php si_dummy_include('listing/flags.php') ?>
    
    <div class="open-houses ng-hide" data-ng-show="model.open_houses | siHasValue">
        <h4><i class="fal fa-calendar-alt"></i> Visite libre</h4>
        <div class="open-house-list">
            <!-- ngRepeat: item in model.open_houses -->
        </div>
    </div>
</div>