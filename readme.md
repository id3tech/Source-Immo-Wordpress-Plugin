# Version 1.3.1


### Intuitive admin interface

* Style editor for colors, borders, spacings, etc
* Search engine designer
* Choose which information to display for list items


### Adaptative search engine
Use views to add tabs to the search engine from views you've created
You can also select which field are searchable

### List item
* Selective data to display
* New double layer mode with hover effect (fade, slide, flip)
* Single layer mode now shows the pictures of the property on hover
* Server side renders for broker list

### Listing informations
Complete informations about a real estate listing 
* Mediabox display
** Photo gallery
** Video promotion
** VR visit
** Map
** Street view
* Address, description and price
* Proximity features
* Addenda
* Lot and building features
* Room details
* Mortgage calculator
* Neighborhood widget (with Local Logic)
* Navigation of search results
* Printable version
* Filters
** filter for addenda formatting level (default value is 2): si/listing/addanda/format_level

### Agent informations
Complete informations about a real estate agent
* Spoken language(s)
* Experience
* Protection(s) for sellers or buyers offered by the agent
* Listings
* Rating
* Comments

### Office informations
Complete informations about a real estate office
* Name, address
* Listings
* Agents
[] Rating
[] Comments

### Agency informations
Complete informations about a real estate agency
* Name, address
* Listings
* Agents
* Offices
[] Rating
[] Comments


### Addons support
Addons are now supported and will be add periodically.
In this release:
* [RE/MAX Québec](https://www.remax-quebec.com/) addon - Display an inner frame from remax-quebec.com website for listing details
* [Prospects Software](https://www.prospects.com) integration addon - Show lead form in listing details
* [Local Logic](https://www.locallogic.co) integration addon - Show neighborhood widget in listing details

### Elementor support
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
* Office data
* Agency data


### filters



## Change log
Version 1.3.1
* Fix search in small lists
* Fix version constant bug

Version 1.2.18
* Minor visual normalization
* Fix map in single listing


Version 1.2.17
* Minor visual normalization
* Fix Price slider on mobile
* Refined typography support

Version 1.2.16
* Normalized buttons
* Removed style from address and phone number in Office and Agency
* Added Elementor's Typography tool for some Single item part (Name, Contact, Address, etc)
* Added si-hide-empty attribute directive to hide empty (no text content) elements
** Two methods supported:
*** Hard: set the element to display:none
*** Soft: set the element opacity to 0 (still take space)
** Directly on element attribute
** Single item part shortcode
* Fix layout busting in details page on mobile
* Minor layout fixes

Version 1.2.15
* Fix language switch for Office and Agency

Version 1.2.14
* Fix missing permalink on redirect

Version 1.2.13
* More accurate industry icon (map)

Version 1.2.12
* Map legend
* More accurate farm icon (map)
* Detail link on image
* Empty permalink part has default value
* Icon in quicksearch for Office and agency


Version 1.2.11
* Agency support
** Search engine
** Client side rendering
** Display listings and agents count for agency in list
** Support for Elementor
* Update map rendering
** Map marker cluster uses normalized color, but scaled text instead


Version 1.2.09
* Updated office support
** Search engine
** Client side rendering
** Display listings and agents count for office in list
** Support for Elementor
* Fixed visual bug in print front-page where area unit was close to the value
* Changed labels
** Home types for Property types


Version 1.2.08
* Public
** Fix dropdown menu
** Fix quick-search panel positioning
** In broker's search by office panel, grouped offices by agency name
* Admin
** Remove list filter item dropdown for value. Replaced by a contextual menu for easier custom entry


Version 1.2.07
* Change listing's mortgage calculator result order

Version 1.2.06
* Fix locale support for Local Logic widget
* Fix minor ui elements

Version 1.2.05
* Add support for Local Logic neighborhood widget
* Simplified layout in listing details
* Adjust mediabox to fit aspect-ratio instead of fixed height

Version 1.2.04
* Fix grid layout bug in list

Version 1.2.02
* Fix layout bug overflow on iOS device

Version 1.2.01
* Implementation of the new update system
* Fix issue on mobile that automatically close the accordeon panels on touch-scroll
* Fix layout bug on mobile caused by accordeon section special data overflow
* Fix missing class prefix on some components


Version 1.1.09
* Add filter hooks on every string labels. Use "ali_label" hooks to overwrite
* Fixed layout bug for small-list directive and shortcodes
** Add class prefix to the list container element
** Change class list-container to si-list for small-list directive list container

Version 1.1.08
* Add "listing-sold" class to listing single page when a listing has its status set to SOLD
* Add missing "sold" class on listing's list item direct render templates


Version 1.1.07
* Fixed increasing value for transfer tax calculation

Version 1.1.06
* Add support for Yoast published and modified date hook in dynamic page content
* Add shordcodes for standalone calculators (mortgage and transfer tax)
* Update transfer tax bounds and rates for cities with custom specificities
* Fixed double slash in path for admin directives template

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
tested: 5.7.3