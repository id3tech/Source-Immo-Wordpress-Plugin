<div class="general-infos">
    <div class="welcome-message">
        <h1 lstr>Welcome</h1>
        <p lstr>Thank you for using source.immo plugin for Worpress.</p>

        <p lstr>This plugin is used to display your real estate data. To manage the data, please visit the <a href="https://portal.source.immo" target="_blank">source.immo portal</a></p>

        
        <h2>Version <?php echo SI_VERSION?></h2>
        <h4 lstr>What's new</h4>
        <p class="si-markdown-text" ng-bind-html="whatNewText"></p>
        <div layout="row" layout-align="start center">
            <md-button ng-click="showReadme()"><lstr>Read change logs</lstr></md-button>
            <md-button ng-click="showDocumentation()"><lstr>Show documentation</lstr></md-button>
        </div>
        
    </div>

    <div class="notice-list">
        <si-notice ng-repeat="item in notices" si-model="item"></si-notice>
    </div>

    <div class="informations">
        
    </div>
    
</div>