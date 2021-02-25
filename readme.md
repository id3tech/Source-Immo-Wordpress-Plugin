# Version 1.1.05

## Offical release
We've finally reach the point of the official release. Yay!


## Intuitive admin interface

* Style editor for colors, borders, spacings, etc
* Search engine designer
* Choose which information to display for list items


## Adaptative search engine
Use views to add tabs to the search engine from views you've created
You can also select which field are searchable

## List item changes

* Selective data to display
* New double layer mode with hover effect (fade, slide, flip)
* Single layer mode now shows the pictures of the property on hover
* Server side renders for broker list

## Agent informations
New informations are available for agent (limited)
* Spoken language(s)
* Experience
* Protection(s) for sellers or buyers offered by the agent
* Rating
* Comments

## Addons support
Addons are now supported and will be add periodically.
In this release:
* [RE/MAX Québec](https://www.remax-quebec.com/) addon - Display an inner frame from remax-quebec.com website for listing details
* [Prospects Software](https://www.prospects.com) integration addon - Show lead form in listing details

## Elementor support
Build custom page for listings and brokers with Elementor's widget
* List of data - Display a list from an alias
* List slider - Renders a listings picture slider
* Search tools - Show the complete search tools
* Search box - Display the simple search input box
* Single item details - Show the default detailled layout for listings or brokers
* Single item part - Render specific part of the default layout, where you want to

Add some specific information with Dynamic Tags (Elementor Pro Only)
* Broker data
* Listing data


## New filters
* New filter for addenda formatting level (default value is 2): si/listing/addanda/format_level


## Other things

* Picture boxing preference
* You can change the default view which will update every list that used the previous one
* Sprinkle hooks here and there
* Minor bugs fixes
* Disconnection now make a backup of the settings to be restored upon credentials update
* Fix Yoast support
* Add minor support for Avada's Fusion theme
* Fix WPML default language shortcut for listings, brokers, cities and offices


## Change log
Version 1.1.05
* Fixes missing address in contact form title
* Improved security for REST API

Version 1.1.04
* Add + symbole for list line-feed in TextToHtml filter

Version 1.1.03
* Add missing translation for Size
* Fix empty data label in list item not taking their space
* Fix dimension formatting for rooms (in print)
* Change on update method for upcoming deprecation (no biggie)

Version 1.1.0
* Add support for priority group sorting
* Fix dimension formatting for rooms by converting inches to feet/inches instead of feet with decimals

Version 1.0.11
* Tweak addanda formatting
* Adjust visual hint for data table
* Add class for item in list in direct render mode. Ex.: item-{{item.ref_number}}
* Add class on listing item for city-code ex.: city-{{item.location.city_code}}

Version 1.0.9
* Fix taxable price when set to false
* Fix load priority in single data controller
* Resolve district code in listing/location
* Add filter on server-side list loading

Version 1.0.8
* Fix permalink problem with listing that lack price (no transaction)

Version 1.0.7
* Change source_url to url for first picture in print

Version 1.0.6
* Add filter for addenda formatting level
* Fix placeholder for empty list

requires: 5.1.1
tested: 5.3