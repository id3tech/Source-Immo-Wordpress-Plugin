

<form autocomplete="off">
<div id="si-admin-configs" class="config-panel" ng-cloak ng-show="configs.registered && message == null">
  <div class="section-navigations">
    <div class="nav-button-list">
      <div class="nav-button general" ng-click="show('general')">
        <i class="fal fa-fw fa-inbox">
          <b ng-if="hasErrorNotices()">{{notices.length}}</b>
        </i> <lstr>General</lstr>
      </div>

      <div class="nav-button listings" ng-click="show('listings')">
        <i class="fal fa-fw fa-home"></i> <lstr>Listings</lstr>
      </div>

      <div class="nav-button brokers" ng-click="show('brokers')">
        <i class="fal fa-fw fa-user"></i> <lstr>Brokers</lstr>
      </div>

      <div class="nav-button offices" ng-click="show('offices')">
        <i class="fal fa-fw fa-store"></i> <lstr>Offices</lstr>
      </div>   

      <div class="nav-button agencies" ng-click="show('agencies')">
        <i class="fal fa-fw fa-building"></i> <lstr>Agencies</lstr>
      </div>

      <div class="nav-button cities" ng-click="show('cities')">
        <i class="fal fa-fw fa-city"></i> <lstr>Cities</lstr>
      </div>

      <div class="nav-button styles" ng-click="show('styles')">
        <i class="fal fa-fw fa-palette"></i> <lstr>Styles</lstr>
      </div>

      <div class="nav-button addons" ng-if="addons.length > 0" ng-click="show('addons')">
        <i class="fal fa-fw fa-cogs"></i> <lstr>Addons</lstr>
      </div>

      <div class="nav-button advanced" ng-click="show('advanced')">
        <i class="fal fa-fw fa-wrench"></i> <lstr>Advanced</lstr>
      </div>

    </div>
  </div>

  <div class="sections">
    <section id="general">
      <?php SourceImmo::view('admin/configs/general') ?>
    </section>

    <section id="styles">
      <?php SourceImmo::view('admin/configs/styles') ?>
    </section>
    
    <section id="listings">
      <si-data-group-editor si-type="listings"></si-data-group-editor>
    </section>

    <section id="cities">
      <si-data-group-editor si-type="cities"></si-data-group-editor>
    </section>

    <section id="brokers">
      <si-data-group-editor si-type="brokers"></si-data-group-editor>
    </section>

    <section id="offices">
      <si-data-group-editor si-type="offices"></si-data-group-editor>
    </section>

    <section id="agencies">
      <si-data-group-editor si-type="agencies"></si-data-group-editor>
    </section>


    <section id="addons">
      <?php SourceImmo::view('admin/configs/addons') ?>
    </section>
    
    <section id="advanced">
      <?php SourceImmo::view('admin/configs/advanced') ?>
    </section>
  </div>

</div>
</form>

