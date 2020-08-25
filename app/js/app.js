/**
 * Javascript SDK Voice & Video Call Demo
 */
var serverBase, mHostUrl, client;
const tokenAPI = '/cpaas/auth/v1/token';

whenReady(function() {
    Notification.initialize();
    let changeView = new ChangeView();
    changeView.showPasswordGrant();
});

class Notification {
    static initialize(el) {
        this.container = document.querySelector('.notification');
        this.close = document.querySelector('.notification .close');
        this.close.addEventListener('click', e => this.container.classList.add('hide'));
    }
}

class ChangeView {
    constructor() {
        this.accountPasswordGrantView = document.getElementById('passwordID');
        this.accountClientCredentialsView = document.getElementById('clientCredID');

        this.accountPasswordGrantradio = document.getElementById('passwordGrant');
        this.accountPasswordGrantradio.addEventListener('click', (evt) => this.showPasswordGrant(evt));

        this.accountClientCredentialsradio = document.getElementById('clientCred');
        this.accountClientCredentialsradio.addEventListener('click', (evt) => this.showClientCredentials(evt));
    }

    showPasswordGrant() {
        Effect.hide(this.accountClientCredentialsView);
        Effect.show(this.accountPasswordGrantView);
    }

    showClientCredentials() {
        Effect.show(this.accountClientCredentialsView);
        Effect.hide(this.accountPasswordGrantView);
    }
}

function initClient() {
    let mServerUrl = constructServerUrl();
    mHostUrl = new URL(mServerUrl).host;
    console.log(mHostUrl);

    client = Kandy.create({
        call: {
          // Specify the TURN/STUN servers that should be used.
          iceServers: [
            { urls: "turns:turn-ucc-1.genband.com:443?transport=tcp" },
            { urls: "stun:turn-ucc-1.genband.com:3478?transport=udp" },
            { urls: "turns:turn-ucc-2.genband.com:443?transport=tcp" },
            { urls: "stun:turn-ucc-2.genband.com:3478?transport=udp" }
          ],
          // Specify that credentials should be fetched from the server.
          serverTurnCredentials: true
        },
      
        // Required: Server connection configs.
        authentication: {
          server: {
            base: mHostUrl 
          },
          clientCorrelator: "sampleCorrelator"
        }
      });

    // Set listener for successful call starts.
    client.on('call:start', function(params) {
        log('Call successfully started. Waiting for response.')
    })

    // Set listener for generic call errors.
    client.on('call:error', function(params) {
        log('Encountered error on call: ' + params.error.message)
    })

    // Set listener for changes in a call's state.
    client.on('call:stateChange', function(params) {
    // Retrieve call state.
    const call = client.call.getById(params.callId);
  
    if (params.error && params.error.message) {
      log("Error: " + params.error.message);
    }
    log("Call state changed from " + params.previous.state + " to " + call.state);
  
    renderMedia(params.callId);
  
    // If the call ended, stop tracking the callId.
    if (call.state === "ENDED") {
      callId = null;
    }
  });

    // Set listener for incoming calls.
    client.on('call:receive', function(params) {
        // Keep track of the callId.
        callId = params.callId

        // Retrieve call information.
        call = client.call.getById(params.callId)
        log('Received incoming call')
    })

    
    // Listen for subscription changes.
client.on("subscription:change", function() {
    if (
      client.services.getSubscriptions().isPending === false &&
      client.services.getSubscriptions().subscribed.length > 0
    ) {
      log("Successfully subscribed");
    }
  });
  
  client.on('subscription:error', function() {
    log('Error: Unable to subscribe')
  })


  
// Set listener for new tracks.
client.on('call:newTrack', function (params) {
    // Check whether the new track was a local track or not.
    if (params.local) {
      // Only render local visual media into the local container.
      const localTrack = client.media.getTrackById(params.trackId)
      if (localTrack.kind === 'video') {
        client.media.renderTracks([params.trackId], '#local-container')
      }
    } else {
      // Render the remote media into the remote container.
      client.media.renderTracks([params.trackId], '#remote-container')
    }
  })
  
  // Set listener for ended tracks.
  client.on('call:trackEnded', function (params) {
    // Check whether the ended track was a local track or not.
    if (params.local) {
      // Remove the track from the local container.
      client.media.removeTracks([params.trackId], '#local-container')
    } else {
      // Remove the track from the remote container.
      client.media.removeTracks([params.trackId], '#remote-container')
    }
  })
  
  // Set listener for new tracks.
  client.on('media:sourceUnmuted', function (params) {
    // Render the remote media into the remote container.
    // Retrieve call and track state.
    let call = client.call.getById(callId)
    let track = client.media.getTrackById(params.trackId)
  
    // Re-render the media into the correct container.
    if (call.remoteTracks.includes(params.trackId)) {
      client.media.renderTracks([params.trackId], '#remote-container')
    } else if (call.localTracks.includes(params.trackId) && track.kind === 'video') {
      // We only want to render local video because local audio would cause an echo.
      client.media.renderTracks([params.trackId], '#local-container')
    }
  })
  
  // Set listener for ended tracks.
  client.on('media:sourceMuted', function (params) {
    // Remove the track from the remote container.
    // Retrieve call state.
    let call = client.call.getById(callId)
  
    // Unrender the media from the correct container.
    if (call.remoteTracks.includes(params.trackId)) {
      client.media.removeTracks([params.trackId], '#remote-container')
    } else if (call.localTracks.includes(params.trackId)) {
      client.media.removeTracks([params.trackId], '#local-container')
    }
  })
}

/**
 * Subscribes to the call service on the websocket channel for notifications.
 * Do this after logging in.
 */
function subscribe() {
    const services = ['call']
    const subscriptionType = 'websocket'
    client.services.subscribe(services, subscriptionType)
    log('Subscribed to call service (websocket channel)')
}


/**
 * Creates a form body from an dictionary
 */
function createFormBody(paramsObject) {
    const keyValuePairs = Object.entries(paramsObject).map(
        ([key, value]) => encodeURIComponent(key) + '=' + encodeURIComponent(value)
    )
    return keyValuePairs.join('&')
}

/**
 * Gets the tokens necessary for authentication to CPaaS
 */
async function getTokensByPasswordGrant({ clientId, username, password }) {

    const cpaasAuthUrl = constructServerUrl();
    const formBody = createFormBody({
        client_id: clientId,
        username,
        password,
        grant_type: 'password',
        scope: 'openid'
    })

    // POST a request to create a new authentication access token.
    const fetchResult = await fetch(cpaasAuthUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formBody
    })

    // Parse the result of the fetch as a JSON format.
    const data = await fetchResult.json()

    return {
        accessToken: data.access_token,
        idToken: data.id_token,
        expiresIn: data.expires_in
    }
}

async function getTokensByClientCredGrant({ client_id, client_secret }) {

    const cpaasAuthUrl = constructServerUrl();
    const formBody = createFormBody({
        client_id,
        client_secret,
        grant_type: 'client_credentials',
        scope: 'openid regular_call'
    })

    // POST a request to create a new authentication access token.
    const fetchResult = await fetch(cpaasAuthUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formBody
    })

    // Parse the result of the fetch as a JSON format.
    const data = await fetchResult.json()

    return {
        accessToken: data.access_token,
        idToken: data.id_token,
        expiresIn: data.expires_in
    }
}

function constructServerUrl() {
    let cpaasUrl;
    let enteredBaseUrl = document.getElementById("serverUrl").value
    if (enteredBaseUrl.trim() !== "") {
        serverBase = enteredBaseUrl.trim()
    }
    cpaasUrl = serverBase + tokenAPI
    return cpaasUrl;
}

async function loginByPasswordGrant() {
    initClient();

    const clientId = document.getElementById('clientId').value
    const userEmail = document.getElementById('userEmail').value
    const password = document.getElementById('password').value

    try {
        const tokens = await getTokensByPasswordGrant({
            clientId,
            username: userEmail,
            password
        })
        client.setTokens(tokens)

        log('Successfully logged in as ' + userEmail + '. Your access token will expire in ' + tokens.expiresIn/60 + ' minutes')
    } catch (error) {
        log('Error: Failed to get authentication tokens. Error: ' + error)
    }
}


async function loginByClientCred() {
    initClient();

    const privateKey = document.getElementById('privateKey').value
    const privateSecret = document.getElementById('privateSecret').value

    try {
        const tokens = await getTokensByClientCredGrant({
            client_id: privateKey,
            client_secret: privateSecret
        })
        client.setTokens(tokens)

        log('Successfully logged in with project User ' + privateKey)
    } catch (error) {
        log('Error: Failed to get authentication tokens. Error: ' + error)
    }
}

// Utility function for appending messages to the message div.
function log(message) {
    console.log(message);
    document.getElementById('terminal').innerHTML += '<p>' + message + '</p>';
}

/*
 *  Voice & Video Call functionality.
 */

// Variable to keep track of the call.
let callId

// Get user input and make a call to the callee.
function makeCall() {
    // Gather call options.
    let destination = document.getElementById('callee').value

    // Check that the destination is in the proper format.
    var callDestRegex = RegExp('^sip:.*@.*$', 'g')
    if (!callDestRegex.test(destination)) {
        log('Destination is in incorrect format. Must be of the form "sip:<someName>@<someDomain>"')
        return
    }

    let withVideo = document.getElementById('make-with-video').checked
    const mediaConstraints = {
        audio: true,
        video: withVideo
    }
    callId = client.call.make(destination, mediaConstraints)
}

// Answer an incoming call.
function answerCall() {
    // Gather call options.
    let withVideo = document.getElementById('answer-with-video').checked

    // Retrieve call state.
    let call = client.call.getById(callId)
    log('Answering call')

    const mediaConstraints = {
        audio: true,
        video: withVideo
    }
    client.call.answer(callId, mediaConstraints)
}

// Reject an incoming call.
function rejectCall() {
    // Retrieve call state.
    let call = client.call.getById(callId)
    log('Rejecting call')

    client.call.reject(callId)
}

// End an ongoing call.
function endCall() {
    // Retrieve call state.
    let call = client.call.getById(callId)
    log('Ending call')

    client.call.end(callId)
}

function renderMedia(callId) {
    // Retrieve call state.
    const call = client.call.getById(callId);
  
    // Retrieve the local track that belongs to video
    const videoTrack = call.localTracks.find(trackId => {
      return client.media.getTrackById(trackId).kind === "video";
    });
  
    // Render local visual media.
    client.media.renderTracks([videoTrack], "#local-container");
  
    // Render the remote audio/visual media.
    client.media.renderTracks(call.remoteTracks, "#remote-container");
  }
