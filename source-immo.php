<?php
/*
Plugin Name: Source.immo
Plugin URI: https://source.immo
Description: Connect to your Source.immo account and display your normalized and always up to date real estate listings and related data on your web site. 
Version: 1.2.08
Author: ID-3 Technologies
Author URI: https://id-3.net/source-immo
License: GPLv2 or later
Text Domain: si
*/




define( 'SI_NAME', 'Source.immo');
define( 'SI', 'si' );
define( 'SI_APP_ID', 'ead7575f-8d1c-42e7-9f59-4cf9e065167e');
//define( 'SI_VERSION', '1.2.04' );
define( 'SI_MINIMUM_WP_VERSION', '4.0' );
define( 'SI_PLUGIN', __FILE__);
define( 'SI_PLUGIN_DIR', str_replace('\\', '/',plugin_dir_path( __FILE__ ) ) );
define(	'SI_PLUGIN_URL', '/' . str_replace(str_replace('\\', '/', ABSPATH),'',SI_PLUGIN_DIR));
define( 'SI_DEVMODE', false );

register_activation_hook( __FILE__, array( 'SourceImmo', 'plugin_activation' ) );
register_deactivation_hook( __FILE__, array( 'SourceImmo', 'plugin_deactivation' ) );

require_once( SI_PLUGIN_DIR . '/core/utils.si.php' );
require_once( SI_PLUGIN_DIR . '/core/class.si-objects.php' );
require_once( SI_PLUGIN_DIR . '/core/class.si-config.php' );
require_once( SI_PLUGIN_DIR . '/core/class.si-shortcodes.php' );
require_once( SI_PLUGIN_DIR . '/core/class.si-page-builder.php' );
require_once( SI_PLUGIN_DIR . '/core/class.si-addons.php' );
require_once( SI_PLUGIN_DIR . '/core/class.si.php' );
require_once( SI_PLUGIN_DIR . '/core/class.si-api.php' );

// include form 3rd party support
require_once( SI_PLUGIN_DIR . '/modules/forms/index.php' );

add_action( 'init', array( 'SourceImmo', 'init' ) );
add_action( 'rest_api_init', array( 'SourceImmoAPI', 'init' ) );

if ( is_admin() || ( defined( 'WP_CLI' ) && WP_CLI ) ) {
	require_once( SI_PLUGIN_DIR . '/core/class.si-admin.php' );
	add_action( 'init', array( 'SourceImmoAdmin', 'init' ) );
}

if ( is_admin() ) {
	require_once( SI_PLUGIN_DIR . '/core/class.si-update.php' );
    //new SiGitHubPluginUpdater( __FILE__, 'id3tech', "Source-Immo-Wordpress-Plugin","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" );
	new SiUpdater( __FILE__);
}

load_default_textdomain();
