var possibleDestinations = [
  {"name": "Hotel Secure", "GPS": "50.353511,7.600736999999981"},
  {"name": "Hoten Ibis", "GPS": "50.354466,7.590697999999975"},
  {"name": "Sporthalle", "GPS": "50.331389,7.584722000000056"},
  {"name": "Partyhalle", "GPS": "50.365278,7.3125"},
  {"name": "Vallendar", "GPS": "50.4000612,7.613961199999949"},
  {"name": "Enchilada Koblenz", "GPS": "50.359207,7.600740999999971"}
];

var fzgIdToShuttleId = function (fzgid) {
  switch (fzgid) {
    case 218739:
      return 0;
      break;
    case 218841:
      return 1;
      break;
    case 218840:
      return 2;
      break;
    case 217040:
      return 3;
      break;
    case 218744:
      return 4;
      break;
    case 218850:
      return 5;
      break;
    case 218852:
      return 6;
      break;
    case 218836:
      return 7;
      break;
    case 218684:
      return 8;
      break;
    case 218736:
      return 9;
      break;
    case 218803:
      return 10;
      break;
    case 218854:
      return 11;
      break;
    case 218848:
      return 12;
      break;
    case 218858:
      return 13;
      break;
    case 218867:
      return 14;
      break;
    case 216088:
      return 15;
      break;
    case 218847:
      return 16;
      break;
    case 218849:
      return 17;
      break;
    case 218720:
      return 18;
      break;
    case 218277:
      return 19;
      break;
    case 218741:
      return 20;
      break;
    case 218768:
      return 21;
      break;
    case 218791:
      return 22;
      break;
    case 218793:
      return 23;
      break;
    case 218794:
      return 24;
      break;
    case 218839:
      return 25;
      break;
    case 218862:
      return 26;
      break;
    default:
      return 0;
      break;

  }
}


if (Meteor.isClient) {
  Template.main.events({
    'click #calculate': function () {
      destinationId = parseInt(document.getElementById('destinationDropdown').value);
      shuttleId = parseInt(document.getElementById('shuttleDropdown').value);
      Meteor.call('getDurationAndDistance', destinationId, shuttleId, function(err, res) {
        document.getElementById('time').value = res;
      });
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    Meteor.methods({
      getDurationAndDistance: function(destinationIndex, shuttleId){
      /* Get current positions of the trackers */
      var liveApiCallback = Meteor.http.call("GET", "http://live.apioverip.de/?module=devices&action=get&nozlib=1&user=123456&pwd=1234567890&mode=contacts&format=json");
      liveApiCallback = liveApiCallback.data;
      var apiCallback = liveApiCallback[fzgIdToShuttleId(parseInt(shuttleId))];

      var shuttlePosition = String(apiCallback.NS)+","+String(apiCallback.WE);

      /* Calculate distance and duration between point A and B */
      var destination = possibleDestinations[destinationIndex].GPS;

      var googleMapsGetUrl = "https://maps.googleapis.com/maps/api/distancematrix/json?origins="+shuttlePosition+"&destinations="+destination

      var eta = Meteor.http.call("GET", googleMapsGetUrl);
      var etaTime = eta.data.rows[0].elements[0].duration.text
      var etaRange = eta.data.rows[0].elements[0].distance.text
      return etaTime;
      }
    });
  });
}
