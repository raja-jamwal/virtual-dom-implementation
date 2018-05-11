# virtual-dom-implementation like React
This is proof of concept virtual dom implementation just like react written in pure javascript in under 100 lines.

+
-- vdom.js: contains implementation for the virtual dom
-- flickr.js: sample flickr app implemented using the given vdom implmentation
-- util.js: generic utils function

Just run index.html, you should see a minimal flickr like implementation.

There are some implemenation constrains I've put

* At any points there are at max 20 Image elements
* Images are lazy loaded
* API request are pooled from flickr api, maintaining a internal pool
* Infinite scroll
