"use strict";

mapboxgl.accessToken = 'pk.eyJ1IjoiYW1pc2hhIiwiYSI6ImNpcWt1bWc4bjAzOXNmdG04bng4dHVhZ3EifQ.bJK6rpjNmiP3kW2pROdScg';

var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/streets-v9', //stylesheet location
    center: [77.5966, 12.9582], // starting position
    zoom: 12 // starting zoom
});

var bbox = [77.4368, 12.8225, 77.7564, 13.0939];

var size = 1;
var hexgrid = turf.hexGrid(bbox, size);
for(var x=0;x<Object.keys(hexgrid.features).length;x++){
hexgrid.features[x].properties.count=0;}

map.on('load', function () {
    map.addSource('amenities', {
        type: 'vector',
        url: 'mapbox://amisha.awotbgdx'
    });
    map.addLayer({
        'id': 'hospitals',
        'source': 'amenities',
        "type": "symbol",
        "layout": {
            "icon-image": "airport-15",
            "icon-padding": 0,
            "visibility": 'visible'
        },
        'source-layer': 'hospital',
        'filter': ["==", "amenity", 'hospital']
    });
})

  map.querySourceFeatures('amenities');
