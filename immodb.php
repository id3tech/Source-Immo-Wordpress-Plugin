<?php
/*
Plugin Name: ID-3 Immo DB
Plugin URI: immodb.id-3.net
Description: Connect to your ImmoDB account and display your real estate venues with easy tools and shortcodes
Version: 0.0.1a
Author: ID-3 Technologies
Author URI: https://id-3.net/immodb/
License: GPLv2 or later
Text Domain: immodb
*/
define( 'IMMODB_VERSION', '0.0.1' );
define( 'IMMODB_MINIMUM_WP_VERSION', '4.0' );
define( 'IMMODB_PLUGIN', __FILE__);
define( 'IMMODB_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'IMMODB', 'immodb' );

register_activation_hook( __FILE__, array( 'ImmoDB', 'plugin_activation' ) );
register_deactivation_hook( __FILE__, array( 'ImmoDB', 'plugin_deactivation' ) );

require_once( IMMODB_PLUGIN_DIR . '/core/utils.immodb.php' );
require_once( IMMODB_PLUGIN_DIR . '/core/class.immodb-config.php' );
require_once( IMMODB_PLUGIN_DIR . '/core/class.immodb-shortcodes.php' );
require_once( IMMODB_PLUGIN_DIR . '/core/class.immodb.php' );
require_once( IMMODB_PLUGIN_DIR . '/core/class.immodb-api.php' );

add_action( 'init', array( 'ImmoDB', 'init' ) );
add_action( 'rest_api_init', array( 'ImmoDBAPI', 'init' ) );

if ( is_admin() || ( defined( 'WP_CLI' ) && WP_CLI ) ) {
	require_once( IMMODB_PLUGIN_DIR . '/core/class.immodb-admin.php' );
	add_action( 'init', array( 'ImmoDBAdmin', 'init' ) );
}
