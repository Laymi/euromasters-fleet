Markers = new Mongo.Collection('markers');

if (Meteor.isServer) {
  Markers.update({},{$set: {lat:0}},{multi:true});
}

if (Meteor.isClient) {
  Template.map.onCreated(function() {
    GoogleMaps.ready('map', function(map) {
      google.maps.event.addListener(map.instance, 'click', function(event) {
        Markers.insert({ lat: event.latLng.lat(), lng: event.latLng.lng() });
      });

      var markers = {};

      /*var marker = new google.maps.Marker({
        draggable: true,
        animation: google.maps.Animation.DROP,
        position: new google.maps.LatLng(50.400325, 7.613507),
        map: map.instance,
        id: document._id
      });

      markers[document._id] = marker;*/

      Markers.find().observe({
        added: function (document) {
          /*var marker = new google.maps.Marker({
            draggable: true,
            animation: google.maps.Animation.DROP,
            position: new google.maps.LatLng(document.lat, document.lng),
            map: map.instance,
            id: document._id
          });*/

          console.log('insert new marker at:', document.lat, document.lng);
          var marker = new google.maps.Circle({
            strokeColor: '#dc4f49',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#dc4f49',
            fillOpacity: 0.35,
            map: map.instance,
            center: new google.maps.LatLng(document.lat, document.lng),
            radius: 50
          });

          google.maps.event.addListener(marker, 'dragend', function(event) {
            Markers.update(marker.id, { $set: { lat: event.latLng.lat(), lng: event.latLng.lng() }});
          });

          markers[document._id] = marker;
        },
        changed: function (newDocument, oldDocument) {
          markers[newDocument._id].setPosition({ lat: newDocument.lat, lng: newDocument.lng });
        },
        removed: function (oldDocument) {
          markers[oldDocument._id].setMap(null);
          google.maps.event.clearInstanceListeners(markers[oldDocument._id]);
          delete markers[oldDocument._id];
        }
      });
    });
  });

  Meteor.startup(function() {
    GoogleMaps.load();
  });

  Template.map.helpers({
    mapOptions: function() {
      if (GoogleMaps.loaded()) {
        return {
          center: new google.maps.LatLng(50.400325, 7.613507),
          zoom: 15
        };
      }
    }
  });

  getAPIresultFromGPSoverIP = function() {
    /*
    http.get("whateverthegpsoveripapi.is", function(res) {
      console.log("Got response: " + res.statusCode);
      return res;
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
    });
    */
    // Took the schema of the results from the GPSoverIP documentation
    res = [
      {"id":"217789","WE":50.400325,"NS":7.613507,"dir":234,"speed":44.8,"ts":"2015-09-08 06:48:41","unix_ts":1441694921,"matrix_id":"-2"},
      {"id":"217789","WE":50.400326,"NS":7.613508,"dir":234,"speed":44.8,"ts":"2015-09-08 06:48:41","unix_ts":1441694921,"matrix_id":"-2"},
      {"id":"217789","WE":50.400327,"NS":7.613509,"dir":234,"speed":44.8,"ts":"2015-09-08 06:48:41","unix_ts":1441694921,"matrix_id":"-2"}
    ];
    return res;
  };

  window.setInterval(function(lat, lng) {
    apiResults = getAPIresultFromGPSoverIP();
    console.log('apiResults', apiResults);
    apiResults.forEach(function(result) {
      Markers.insert({ lat: result.WE, lng: result.NS });
    });
  },3000);
}
