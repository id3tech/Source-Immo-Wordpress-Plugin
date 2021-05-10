<?php
class SiUpdater{

  private $sourceRepo;
  private $repo;
  private $slug; // plugin slug
  private $pluginData; // plugin data
  private $pluginFile; // __FILE__ of our plugin
  private $repoResult; // holds data from GitHub
  
  function __construct($pluginFile, $repo_name=null, $source='https://update.id-3.net'){
    
    add_filter( "pre_set_site_transient_update_plugins", array($this, "setTransientPluginUpdate") );
    //add_filter( "pre_set_transient_update_plugins", [$this, "setTransientPluginUpdate"] );
    // add_filter('site_transient_update_plugins', array($this, 'setTransientPluginUpdate'));
    // add_filter('transient_update_plugins', array($this, 'setTransientPluginUpdate'));
    add_filter( "plugins_api", [$this, "setPluginInfo" ], 10, 3 );
    //add_filter( "upgrader_post_install", [$this, "postInstall"], 10, 3 );


    $this->pluginFile = $pluginFile;
    $this->sourceRepo = $source;
    $this->repo = ($repo_name==null) ? basename(dirname($pluginFile)) : $repo_name;
  }

  // Get information regarding our plugin from WordPress
  private function initPluginData() {
    $this->slug = plugin_basename( $this->pluginFile );
    $this->pluginData = get_plugin_data( $this->pluginFile );
  }

  function setTransientPluginUpdate($transient){
    // If we have checked the plugin data before, don't re-check
    if ( empty( $transient->checked ) ) {
      return $transient;
    }

    $this->initPluginData();
    //$plugin_info = get_site_transient('update_plugins');
    $pluginInfos = $this->getRepoPluginInfo();
    
    // Check the versions if we need to do an update
    if(version_compare( $pluginInfos->version, $transient->checked[$this->slug],'<=' )) return $transient;
   
    // Update the transient to include our updated plugin data
    $obj = new stdClass();
    $obj->id = 'wp.org/plugins/' . $this->repo;
    $obj->slug = $this->repo;
    $obj->plugin = $this->slug;
    $obj->new_version = $pluginInfos->version;
    $obj->url = $this->pluginData["PluginURI"];
    $obj->package = $this->sourceRepo . $pluginInfos->download_link;
    $obj->icons = [
      "1x" => SI_PLUGIN_URL . 'styles/assets/logo-128x128.jpg',
      "2x" => SI_PLUGIN_URL . 'styles/assets/logo-256x256.jpg'
    ];
    $obj->banners = [
      "low" =>  SI_PLUGIN_URL . 'styles/assets/banner-772x250.jpg',
      "high" => SI_PLUGIN_URL . 'styles/assets/banner-1544x500.jpg'
    ];
    $obj->banners_rtl = array();

    // Gets the tested version of WP if available
    $matches = null;
    preg_match( "/tested:\s([\d\.]+)/i", $pluginInfos->body, $matches );
    if ( ! empty( $matches ) ) {
        if ( is_array( $matches ) ) {
            if ( count( $matches ) > 1 ) {
              $obj->tested = $matches[1];
            }
        }
    }
    
    $transient->response[$this->slug] = $obj;
    return $transient;
  }

  function getRepoPluginInfo(){
    if( !empty($this->repoResult) ) return $this->repoResult;
    
    $url = $this->sourceRepo . "/infos/{$this->repo}/json";
    $callArgs = [];

    $infosRaw =  wp_remote_retrieve_body( wp_remote_get( $url, $callArgs ) );
    
    $this->repoResult = json_decode( $infosRaw );
    return $this->repoResult;
  }

  function setPluginInfo($plugins_api, $action, $args){
    
    // Get plugin & GitHub release information
    $this->initPluginData();
    $repoInfos = $this->getRepoPluginInfo();
    
    $pluginSlug = $args->slug;
    // If nothing is found, do nothing
    // if ("plugin_information" !== $action) {
    //   return $plugins_api;
    // }

    
    if ($pluginSlug != $this->repo) {
      return $plugins_api;
    }

    if ( empty( $args->slug ) || $args->slug != $this->repo ) {
      return $plugins_api;
    }


    // Add our plugin information
    $args->last_updated = $repoInfos->modify_date;
    $args->slug = $this->slug;
    $args->plugin_name  = $this->pluginData["Name"];
    $args->name  = $this->pluginData["Name"];
    $args->version = $repoInfos->version;
    $args->author = $this->pluginData["AuthorName"];
    $args->homepage = $this->pluginData["PluginURI"];
    $args->banners = [
      "high" => SI_PLUGIN_URL . 'styles/assets/banner-1544x500.jpg',
      "low" => SI_PLUGIN_URL . "styles/assets/banner-772x250.jpg"
    ];
    
    // This is our release download zip file
    $downloadLink = $repoInfos->download_link;
    $args->download_link = $downloadLink;

    // We're going to parse the GitHub markdown release notes, include the parser
    require_once( SI_PLUGIN_DIR . "/modules/Parsedown.php" );

    // Create tabs in the lightbox
    if(! empty($repoInfos->sections)){
      $args = $repoInfos->sections;
    }
    else{
      $repoBody = explode('## Change log',$repoInfos->body);
      $changelogs = class_exists( "Parsedown" )
                    ? Parsedown::instance()->parse( $repoBody[1] )
                    : $repoBody[1];
      $description = class_exists( "Parsedown" )
                      ? Parsedown::instance()->parse( $repoBody[0])
                      : $this->pluginData['description'];

      $args->sections = [
        'description' => $description,
        'changelog' => substr($changelogs,0,strpos($changelogs,'requires:'))
      ];
    }

    // Gets the required version of WP if available
    $matches = null;
    preg_match( "/requires:\s([\d\.]+)/i", $repoInfos->body, $matches );
    if ( ! empty( $matches ) ) {
        if ( is_array( $matches ) ) {
            if ( count( $matches ) > 1 ) {
                $args->requires = $matches[1];
            }
        }
    }
    
    // Gets the tested version of WP if available
    $matches = null;
    preg_match( "/tested:\s([\d\.]+)/i", $repoInfos->body, $matches );
    if ( ! empty( $matches ) ) {
        if ( is_array( $matches ) ) {
            if ( count( $matches ) > 1 ) {
                $args->tested = $matches[1];
            }
        }
    }


    return $args;
  }


  // Use this method to rename folder upon installation
  // in case of a directory name mismatche, but it shouldn't be the case
  function postInstall($true, $hook_extra, $result){

    // remove the next line to actually do somethig
    return $result;


    // Get plugin information
    $this->initPluginData();
      
    // Remember if our plugin was previously activated
    $wasActivated = is_plugin_active( $this->slug );

    global $wp_filesystem;
    $pluginFolder = WP_PLUGIN_DIR . DIRECTORY_SEPARATOR . dirname( $this->slug );
    $wp_filesystem->move( $result['destination'], $pluginFolder );
    $result['destination'] = $pluginFolder;

    // Re-activate plugin if needed
    if ( $wasActivated ) {
      $activate = activate_plugin( $this->slug );
    }

    return $result;
  }
}