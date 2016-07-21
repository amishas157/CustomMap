"use strict";
mapboxgl.accessToken = 'pk.eyJ1IjoiYW1pc2hhIiwiYSI6ImNpcWt1bWc4bjAzOXNmdG04bng4dHVhZ3EifQ.bJK6rpjNmiP3kW2pROdScg';

var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/light-v9', //stylesheet location
    center: [77.5966, 12.9582], // starting position
    zoom: 12,
    hash: true // starting zoom
});

var amenities;
var filteredAmenity = {};

var bbox = [77.4368, 12.8225, 77.7564, 13.0939];
var size = 1;
var temp = turf.hexGrid(bbox, size);

var hexgrid = {};

map.on('load', function () {
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
              [0, '#FFFFFF'],
              [3, '#D0EBBE'],
              [6, '#B1DE93'],
              [9, '#92D168'],
              [12, '#73C43D'],
              [15, '#64be28'],
              [18, '#509820'],
              [21, '#3C7218'],
              [24, '#325F14'],
              [27, '#284C10'],
              [30, '#1E390C'],
              [33, '#182e0a'],
              [36, '#122207']
            ]
          },
          "fill-opacity": 0.5,
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

function filterByAmenity(obj) {
  var filter = $('input[name=amenity]:checked', '#menu').attr('id');
  if (obj.properties.amenity == filter) {
    return true;
  } else {
    return false;
  }
}

function showDensity(filter) {
                $.ajax({
                      url: "amenities.geojson",
                      //force to handle it as text
                      dataType: "text",
                      success: function(data) {

                          amenities = $.parseJSON(data);
                          filteredAmenity= amenities.features.filter(filterByAmenity);
                          map.setLayoutProperty('hexLayer', 'visibility', 'visible');
                          countem();
                          map.getSource("hexSource").setData(hexgrid);
                      }
                  });
}
function countem(){
  hexgrid = turf.hexGrid(bbox, size);
  var count = 0;
  for(var x=0;x<hexgrid.features.length;x++){
  hexgrid.features[x].properties.count=0;}
  console.log(hexgrid.features.length);
  for(var y=0;y<Object.keys(hexgrid.features).length;){
     count = 0;
  for(var c=0;c<filteredAmenity.length;c++){
  var poly=turf.polygon(hexgrid.features[y].geometry.coordinates);
  if(filteredAmenity[c].geometry["type"] == "Polygon" ) {
      if(turf.inside(turf.centroid(filteredAmenity[c]),poly)) {
        hexgrid.features[y].properties.count += 1;
        count++;
    }
  }

  if(filteredAmenity[c].geometry["type"] == "Point")
  {
    if(turf.inside(filteredAmenity[c],poly)){
      hexgrid.features[y].properties.count += 1;
      count++;
    }
  }

  }
  if(count == 0) {
    hexgrid.features.splice( y, 1 );
  }
  else {
    y++;
  }
  }
}
