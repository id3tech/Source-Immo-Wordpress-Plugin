
<div class="filter-panel letters-panel {{isExpanded('letters')}}">
    <div class="filter-panel-header">
        <h3><?php _e('First letter of the last name', SI) ?></h3>
        <button class="button" type="button"  ng-click="toggleExpand($event,'letters')"><i class="fal fa-times"></i></button>
    </div>
    <div class="filter-panel-content">
        <div class="filter-list letter-list">
            <div class="letter" ng-click="filter.setLetter(null)"><i class="fas fa-ban"></i></div>
            <div class="letter {{filter.data.letters.includes(letter) ? 'active' : ''}}" 
                    ng-repeat="letter in alphaList" 
                    ng-click="filter.setLetter(letter)">
                <span>{{letter.toUpperCase()}}</span>
            </div>
        </div>
    </div>

    <div class="filter-panel-actions">
        <?php include '_actions.php'; ?>
    </div>
</div>