// Attach a submit handler to the form

const {$} = window;
let predictionId = Date.now();

function getFormData($form){
    var unindexed_array = $form.serializeArray();
    var indexed_array = {};

    $.map(unindexed_array, function(n, i){
        indexed_array[n['name']] = n['value'];
    });

    return indexed_array;
}

// Render the response on the page for splits:
// [-float("inf"), -15.0, 0, 30.0, float("inf")]
function renderPage(response) {

  console.log(response);

  var displayMessage;

  if(response.Prediction == 0 || response.Prediction == '0') {
      displayMessage = "Early (15+ Minutes Early)";
    }
    else if(response.Prediction == 1 || response.Prediction == '1') {
      displayMessage = "Slightly Early (0-15 Minute Early)";
    }
    else if(response.Prediction == 2 || response.Prediction == '2') {
      displayMessage = "Slightly Late (0-30 Minute Delay)";
    }
    else if(response.Prediction == 3 || response.Prediction == '3') {
      displayMessage = "Very Late (30+ Minutes Late)";
    }
    
    console.log(displayMessage)

    $( "#result" ).empty().append( displayMessage );
}


$(function () {
  var socket = io.connect('/', { 'forceNew': true });

  $( "#flight_delay_classification" ).submit(function( event ) {

    // Stop form from submitting normally
    event.preventDefault();

    // Get some values from elements on the page:
    var $form = $( this ),
      term = $form.find( "input[name='s']" ).val(),
      url = $form.attr( "action" );

    socket.emit("predict", getFormData($form));

    // $( "#result" ).empty().append( "Processing..." );
   
  });


  socket.on('messages', function(action) {
    try{
      switch(action.type) {
        case "CONFIRMATION":
          $( "#result" ).empty().append( "Processing..." );
          break;
        case "ERROR":
          $( "#result" ).empty().append( "ERROR" );
          break;
        case "PREDICTION":
          if (predictionId === (action.payload.predictionId)) {
            renderPage(action.payload.Prediction);
          }
          break;
        default:
          console.error("Unrecognized message type");
      }
    } catch (e) {
      console.error(e)
    }
  });



}
