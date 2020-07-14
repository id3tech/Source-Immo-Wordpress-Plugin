# Version 0.4.72 RC1

## Admin interface changes

* Access admin interface directly from the wordpress menu
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



## Other things

* You can change the default view which will update every list that used the previous one
* Sprinkle hooks here and there
* Minor bugs fixes
* Disconnection now make a backup of the settings to be restored upon credentials update
* Fix Yoast support
* Add minor support for Avada's Fusion theme


requires: 5.1.1
tested: 5.3