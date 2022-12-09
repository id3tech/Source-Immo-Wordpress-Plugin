siApp
.directive('siAddonWebcounterProxy', function(){
    return {
        restrict: 'E',
        scope: {
            trackVisitors: '@',
            trackItemTypes: '@'
        },
        link: function($scope, $element, $attr){
            console.log('siAddonWebcounterProxy/instance');
            $scope.trackedTypes = $scope.trackItemTypes.split(',');

            $scope.init();
        },
        controller: function($scope){
            $scope.STORAGE_KEY = 'si/module/webcount/visitor/';

            $scope.init = function(){
                $scope.proxy = new SIWebCounterProxy(window.location.hostname);

                $scope.$on('siDataLayer/push-event', function($event, $data){
                    if(!$scope.trackedTypes.includes($data.trackType)) {
                        console.log('OFF:siDataLayer/push-event', $data, $scope.trackedTypes);
                        return;
                    }
                    
                    console.log('ON:siDataLayer/push-event', $data);
                    
                    $scope.proxy.increment($data.event, $data.id, $data.eventGroup, $data.eventLabel);
    
                    if($scope.trackVisitors == 'yes' && $data.event.includes('view')){
                        if($scope.is_new_visitor($data.id)){
                            $scope.store_visitor($data.id);
                            $scope.proxy.increment($data.event + '/unique', $data.id, $data.eventGroup, $data.eventLabel);
                        }
                    }
                });
            }

            $scope.is_new_visitor = function($key=''){
                return localStorage.getItem($scope.STORAGE_KEY + $key) === null;
            }
            $scope.store_visitor = function($key=''){
                localStorage.setItem($scope.STORAGE_KEY + $key,true)
            }
            
        }
    }
});

siApp
.directive('siAddonWebcounterWidget', function(){
    return {
        restrict: 'E',
        scope: {
            itemId: '@'
        },
        replace: true,
        template: `
        <div class="si-addon-webcounter-widget" ng-init="init()">
            <div class="si-addon-webcounter-views">
                <label lstr>Viewed</label>
                <div><span>{{counter.views}}</span> <lstr>times</lstr></div>
            </div>
        </div>
        `,
        controller: function($scope){
            $scope.init = function(){
                $scope.fetchData();
            }

            $scope.fetchData = function(){
                const proxy = new SIWebCounterProxy(window.location.host);

                proxy.getCounterValue($scope.itemId).then($data => {
                    console.log('siAddonWebcounterWidget/fetchData', $data);
                })
            }
        }

    }
})


class SIWebCounterProxy {

    constructor(host){
        this.COUNTERS_STORAGE_KEY = 'si/module/webcount/counters';

        this.site_token = host;
        this.counters_queue = null;
        
        this.counters = [];
        this.loadRegisteredCounters();
    }

    loadRegisteredCounters(){
        const data = localStorage.getItem(this.COUNTERS_STORAGE_KEY);
        if(data != null) this.counters = JSON.parse(data);
    }

    saveCounters(){
        localStorage.setItem(this.COUNTERS_STORAGE_KEY, JSON.stringify(this.counters));
    }

    registerCounter($key, $group, $label=null){
        if(this.counters.some(c => c.keyname == $key)) {
            return Promise.resolve();
        }

        $label = $label == null ? $key.humanize() : $label;
        const newCounter = {site_token:this.site_token, group_name: $group, keyname: $key, keyname_description: $label.translate(), keyname_description_en: $label}
        this.counters.push(newCounter);
        this.saveCounters();

        return net.id3.webcounters.register_counters({
            data:{
                counters: [newCounter]
            }
        })
    }


    increment($key, $item_id = '', $group = 'access'){
        
        this.registerCounter($key,$group).then( _ => {
            const lCounters = [];
            lCounters.push({site_token:this.site_token, keyname: $key, track_item_id: $item_id });
    
            try{
                net.id3.webcounters.inc_counters({
                    data: {
                        counters: lCounters
                    }
                });
            }
            catch(e){}

        });

    }

    getCounterValue($item_id){
        return net.id3.webcounters.get_track_item_resume($item_id).then( $response => {
            console.log($response);
            return $response;
        });
    }

}