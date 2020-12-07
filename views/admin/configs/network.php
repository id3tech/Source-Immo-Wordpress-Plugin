<form autocomplete="off">
<div id="si-admin-configs" class="config-panel" ng-cloak>
<div class="section-navigations">
    <div class="nav-button-list">
      <div class="nav-button general" ng-click="show('general')">
        <i class="fal fa-fw fa-inbox">
          <b ng-if="hasErrorNotices()">{{notices.length}}</b>
        </i> <lstr>General</lstr>
      </div>
    </div>
  </div>

  <div class="sections">
    <section id="general">
      <?php SourceImmo::view('admin/configs/network-general') ?>
    </section>
  </div>
</div>
</form>