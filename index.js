"use strict";

mapboxgl.accessToken = 'pk.eyJ1IjoiYW1pc2hhIiwiYSI6ImNpcWt1bWc4bjAzOXNmdG04bng4dHVhZ3EifQ.bJK6rpjNmiP3kW2pROdScg';

var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/dark-v9', //stylesheet location
    center: [77.5966, 12.9582], // starting position
    zoom: 12,
    hash: true // starting zoom
});

console.log(map.getBounds());

var amenities;
var filteredAmenity = {};

var bbox = [map.getBounds()["_sw"]["lng"], map.getBounds()["_sw"]["lat"], map.getBounds()["_ne"]["lng"], map.getBounds()["_ne"]["lat"]];
//var bbox = [77.4368, 12.8225, 77.7564, 13.0939];
var size = 3;
var temp = turf.hexGrid(bbox, size);

var hexgrid = {};

var filterEl = document.getElementById('feature-filter');
var listingEl = document.getElementById('feature-listing');

var availableAmenities = [
    "ActionScript",
    "AppleScript",
    "Asp",
    "BASIC",
    "C",
    "C++",
    "Clojure"
];

function normalize(string) {
    return string.trim().toLowerCase();
}

function renderListings(amenities) {
    filterEl.setAttribute("placeholder", amenities[0]);
    // listingEl.innerHTML = '';
    //    amenities.forEach(function(amenity) {
    //        var item = document.createElement('button');
    //        item.addEventListener('mouseover', function() {
    //        });
    //        listingEl.appendChild(item);
    //    });
}

filterEl.addEventListener('keyup', function(e) {
    var value = normalize(e.target.value);

    var filtered = availableAmenities.filter(function(feature) {
        var name = normalize(feature);
        return name.indexOf(value) > -1;
    });
    renderListings(filtered);

});

map.on('load', function() {
    // Density hexgrid overlay
    map.addSource('hexSource', {
        type: 'geojson',
        data: temp
    });
    map.addLayer({
        'id': 'hexLayer',
        'source': 'hexSource',
        "type": "fill",
        "paint": {
            'fill-color': {
                property: 'count',
                stops: [
                    [0, '#000'],
                    [1, '#017a20'],
                    [6, '#ede51e'],
                    [15, '#fa4a3d']
                ]
            },
            "fill-opacity": 0.4
        },
        "layout": {
            "visibility": 'none'
        }
    });

    // Amenities vector tiles
    map.addSource('amenitiesSource', {
        "type": "vector",
        "url": "mapbox://amisha.4f400ilq"
    });
    map.addLayer({
        'id': 'amenitiesLayer',
        'source': 'amenitiesSource',
        'source-layer': 'outputgeojson',
        "type": "circle",
        "paint": {
            'circle-color': '#fff',
            'circle-opacity': 0.5,
            'circle-radius': 2
        }
    });



})

var layerList = document.getElementById('menu');
var inputs = layerList.getElementsByTagName('input');

for (var i = 0; i < inputs.length; i++) {
    inputs[i].onclick = showDensity;
}

var selectedAmenity;

function filterByAmenity(obj) {
    var filter = $('input[name=amenity]:checked', '#menu').attr('id');
    selectedAmenity = filter;
    if (obj.properties.amenity == filter) {
        return true;
    } else {
        return false;
    }
}

function showDensity(filter) {
    amenities = map.querySourceFeatures('amenitiesSource', {
        sourceLayer: 'outputgeojson'
    });
    filteredAmenity = amenities.filter(filterByAmenity);
    map.setLayoutProperty('hexLayer', 'visibility', 'visible');
    map.setFilter('amenitiesLayer', ['==', 'amenity', selectedAmenity]);
    countem();
    map.getSource("hexSource").setData(hexgrid);

}

function countem() {
    hexgrid = turf.hexGrid(bbox, size);
    var count = 0;
    for (var x = 0; x < hexgrid.features.length; x++) {
        hexgrid.features[x].properties.count = 0;
    }
    console.log(hexgrid.features.length);
    for (var y = 0; y < Object.keys(hexgrid.features).length;) {
        count = 0;
        for (var c = 0; c < filteredAmenity.length; c++) {
            var poly = turf.polygon(hexgrid.features[y].geometry.coordinates);
            if (filteredAmenity[c].geometry["type"] == "Polygon") {
                if (turf.inside(turf.centroid(filteredAmenity[c]), poly)) {
                    hexgrid.features[y].properties.count += 1;
                    count++;
                }
            }

            if (filteredAmenity[c].geometry["type"] == "Point") {
                if (turf.inside(filteredAmenity[c], poly)) {
                    hexgrid.features[y].properties.count += 1;
                    count++;
                }
            }

        }
        if (count == 0) {
            hexgrid.features.splice(y, 1);
        } else {
            y++;
        }
    }
}
