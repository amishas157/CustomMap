"use strict";

mapboxgl.accessToken = 'pk.eyJ1IjoiYW1pc2hhIiwiYSI6ImNpcWt1bWc4bjAzOXNmdG04bng4dHVhZ3EifQ.bJK6rpjNmiP3kW2pROdScg';

var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/light-v9', //stylesheet location
    center: [77.5966, 12.9582], // starting position
    zoom: 12,
    hash: true // starting zoom
});

var points = [];

var bbox = [77.4368, 12.8225, 77.7564, 13.0939];

var size = 1;
var hexgrid = turf.hexGrid(bbox, size);
for(var x=0;x<Object.keys(hexgrid.features).length;x++){
hexgrid.features[x].properties.count=0;}

map.on('load', function () {
    map.addSource('amenities', {
        type: 'geojson',
        data: 'output.geojson'
    });
    map.addLayer({
        'id': 'amenitiesLayer',
        'source': 'amenities',
        "type": "fill",
        "paint": {
         'fill-color': '#FFFFFF',
          "fill-opacity": 0.1
        },
        "layout": {
            "visibility": 'visible'
        }
    });

    map.addSource('hexSource', {
        type: 'geojson',
        data: hexgrid
    });
    map.addLayer({
        'id': 'hexLayer',
        'source': 'hexSource',
        "type": "fill",
        "paint": {
        'fill-color': {
            property: 'count',
            stops: [
              [0, '#FFFFFF'],
              [2, '#FFDDCC'],
              [4, '#FFBB99'],
              [6, '#FF9966'],
              [8, '#FF7733'],
              [10, '#FF5500'],
              [12, '#CC4400'],
              [14, '#993300'],
              [16, '#662200']
            ]
          },
          "fill-opacity": 0.5
        },
        "layout": {
            "visibility": 'none'
        }
    });
})

var layerList = document.getElementById('menu');
var inputs = layerList.getElementsByTagName('input');

for (var i = 0; i < inputs.length; i++) {
    inputs[i].onclick = showDensity;
}

function showDensity(filter) {
  map.setLayoutProperty('hexLayer', 'visibility', 'visible');
  var filterId = filter.target.id;
  var obj = map.querySourceFeatures('amenities',  { filter: ["==", 'amenity', filterId]  });
  console.log(obj.length);
  points = obj;
  countem();
  map.getSource("hexSource").setData(hexgrid);
}
function countem(){
  console.log("length" + Object.keys(hexgrid.features).length-1);
  for(var x=0;x<Object.keys(hexgrid.features).length;x++){
  hexgrid.features[x].properties.count=0;}

   var arr = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

  for(var y=0;y<Object.keys(hexgrid.features).length;y++){

  for(var c=0;c<points.length;c++){
  var poly=turf.polygon(hexgrid.features[y].geometry.coordinates);
  if(points[c].geometry["type"] == "Polygon" ) {
      if(turf.inside(turf.centroid(points[c]),poly)) {
        hexgrid.features[y].properties.count += 1;
        arr[hexgrid.features[y].properties.count] += 1; }
  }

  if(points[c].geometry["type"] == "Point")
  {
    if(turf.inside(points[c],poly)){
      hexgrid.features[y].properties.count += 1;
      arr[hexgrid.features[y].properties.count] += 1;
    }
  }

  }
  }
  console.log(Object.keys(hexgrid.features).length-1);
  for(var i=0; i<=16; i++) {
    console.log(i + "  " + arr[i]);
  }
}
