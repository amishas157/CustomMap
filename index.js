"use strict";

mapboxgl.accessToken = 'pk.eyJ1IjoiYW1pc2hhIiwiYSI6ImNpcWt1bWc4bjAzOXNmdG04bng4dHVhZ3EifQ.bJK6rpjNmiP3kW2pROdScg';

var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/streets-v9', //stylesheet location
    center: [77.5966, 12.9582], // starting position
    zoom: 12 // starting zoom
});

var points = [];

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
        "type": "circle",
        'source-layer': "amenities",
        'filter': ["==", 'amenity', 'hospital']
    });
    map.addSource('hospitalSource', {
        type: 'geojson',
        data: hexgrid
    });
    map.addLayer({
        'id': 'hospitalLayer',
        'source': 'hospitalSource',
        "type": "fill",
        "paint": {
        'fill-color': {
            property: 'count',
            stops: [
              [0, '#FF6666'],
              [1, '#FF4040'],
              [2, '#FF3030'],
              [3, '#EE0000 '],
              [4, '#8B0000']
            ]
          },
          "fill-outline-color": "#000000",
          "fill-opacity": 0.5
        },
        "layout": {
            "visibility": 'visible'
        },
        'source-layer': "hospitalSource"
    });
})
  map.on('moveend', function() {
    var obj = map.querySourceFeatures('amenities',  { sourceLayer : 'amenities', filter: ["==", 'amenity', 'hospital']  });
    points = obj;
    countem();
    map.getSource("hospitalSource").setData(hexgrid);
})
function countem(){

  for(var y=0;y<Object.keys(hexgrid.features).length-1;y++){

  for(var c=0;c<points.length-1;c++){
  var poly=turf.polygon(hexgrid.features[y].geometry.coordinates);

  if(points[c].geometry["type"] == "Polygon" ) {
      if(turf.inside(turf.centroid(points[c]),poly))
        hexgrid.features[y].properties.count += 1;
  }

  if(points[c].geometry["type"] == "Point")
  {
    if(turf.inside(points[c],poly)){
      console.log("Yeah!Its done");
      hexgrid.features[y].properties.count += 1;
      console.log(hexgrid.features[y].properties.count);
    }
  }

  } //end 2nd for
  }//end 1st for
}
