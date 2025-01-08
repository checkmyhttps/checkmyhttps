/*
api.js : permet de requêter le serveur cmh pour obtenir le certificat du serveur
*/

// importScripts("./lib/common.js")
// importScripts("./lib/certificateManager.js")
// importScripts("./lib/options.js")

let defaultCheckServer = {
  url: "https://checkmyhttps.net/",
  publicKey: `-----BEGIN PUBLIC KEY-----
  MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAvPk7sw/smaqXrF+glR1i
  be/AjaxTnUCVwYJ+iSYxizBl5n42RGRaxhbbkJuM9esnFJd74bb9Uv5oM5rZWtSO
  sedr49uY237V5C3z0PPSYPaJD290bJzwK4bOZim9cr8DT25KhRj5WoXbnuULVLAE
  5DO55nUbhp51HisOUsZwtYNEE53D8Ev8wX2iwzAx4X0E2KvVpoyI23u4UVFdQxUJ
  GVzI7Bs8OQyzFJBhalEjaylK3gDNDMFF3reNGgIEPIMIs9I6bUaOgaQsT/b65SR9
  qxWyrOrQcYl42y8mpC7SN+8zPnxUuRQgIgvR1VDThJVf5+pRi+phPLaX5exEkoDZ
  ISU8UiCquAfd0dgjNzo/wUvSykkJvAZHNtkn5kNeVE/cOYFw8jWZfX7oe2Gy5CGk
  83abNDpkpdvDpDJwHA8oP8q/0Wzd1EJkGyPfr79eEwtUEblWXaYvVPrvcrBkuex0
  F1MMQJ82WtAwP7DtwEvkHDezuMyjK2jO0cxcYfXh1mjuTRYuCZ4fdvVUpIyoDo8g
  MoWqP4U0RmOXjG7GoqVVH89aFxtMYmXWolL08sYSOBG2R3sD/kMQq2I++DpDyxtX
  8cxDdBxXrh+PNQTOLbuuQIesn/MTHSHMo8bHDVsooEVrgGDIad2/AK2seihhVMsj
  17aoSfDrFx7OQi+0BmiZKzsCAwEAAQ==
  -----END PUBLIC KEY-----`
}

// Permet l'ouverture du "SidePanel" lorsque l'on clique sur l'icon de l'extension
chrome.sidePanel.setPanelBehavior( {openPanelOnActionClick: true}).catch( (error) => console.error(error));

// Permet d'initialiser dans le local storage la variable souhaitée ! 
function initializeVariableInLocalStorage(varInfoArray) {

    let keyName = varInfoArray[0]
    let valueType = varInfoArray[1]

    switch(valueType) {

        case "boolean":
            chrome.storage.local.set({ [keyName]: varInfoArray[2] || false}).then( () => {})
            break;
        case "string":
            chrome.storage.local.set({ [keyName]: varInfoArray[2] || ""}).then( () => {})
            break;
        default:
    }
}

/*
Apply a verification on serverUrl and publicKey from userMessage
*/
async function applyVerificationOnServerAndPublicKeyParameters(request) {
    // let serverURL = request.serverUrl || " ";
    // if (serverURL.length === 0) {
    //     return -1
    // }

    // serverURL += 'api.php?info&sign'

    // console.log("ServerURL " + serverURL)

    // let response = null 
    // let response_data = null 
    // let httpHeadMethod = false 

    // try {
    //     if (httpHeadMethod) {
    //       fetchInit = { method: 'HEAD' }
    //     } else {
    //       fetchInit = {}
    //     }
    //     response = await fetch(serverURL, fetchInit)
        
    //     const contentType = response.headers.get('content-type')
    //     console.log("ETAT BOOLEAN: " + contentType.includes("application/json") )
    //     console.log("ETAT BOOLEAN: " + (contentType != null) )
        
    //     if(contentType != null && contentType.includes('application/json')) {
    //         console.log("Je rentre dans")
    //         response_data = await response.json()
    //         console.log("RESPONSE: " + response_data)
    //         console.log("Data: " + response_data.signature)

    //     } else {
    //       response_data = await response.text()
    //     }
    //   } catch (e) {
    //     // console.error(e)
    //   }

    // console.log("Fetch the server" + response_data)
}

/*

Take action on data variables saved in local storage
*/
async function takeActionFromMessageToDataVariables(request) {

    let keyName = request.dataVariable[0]
    let valueType = request.dataVariable[1]
    let updateVariable = request.dataVariable[2] 

    let isInitialized = await checkIfDataVariablesInLocalStorageIsInitialized(keyName);

    if (isInitialized) {

        // If the array contain a third value, this means that we want to change the value of the variable
        if (updateVariable != undefined) {
            initializeVariableInLocalStorage([keyName, valueType, updateVariable])
        }

        // We get the actual value to send it back in the content script
        let result = await chrome.storage.local.get( [keyName]);
        console.log("Direction le client: " + Object.values(result) ) 
        
        console.log("Je renvoie le résultat.")
        return {response: Object.values(result)}
    }
    else 
    {
        initializeVariableInLocalStorage( [keyName, valueType] )
    }
}

/*
Enabling this event in order to receive message for our content scripts files
*/
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {

        if (request.dataVariable != undefined) {
            takeActionFromMessageToDataVariables(request).then((response) => {
                sendResponse(response)
            })
            return true
        }
        
        if (request.verifyServerConfiguration != undefined) {
            applyVerificationOnServerAndPublicKeyParameters(request).then( (result) => {
                console.log("VOICI LE RESULTAT DE LA VERIF: "  + result)
            })
            return true
        }
                
        // chrome.storage.local.get(null, (result) => {
        //     console.log("All stored data:", result);
        // });

        return true
    }
);

async function checkIfDataVariablesInLocalStorageIsInitialized(keyName) {

    let result = await chrome.storage.local.get(keyName)

    return Object.hasOwn(result, keyName)
}

// We check wether the default variables are initialized, otherwise we call a function to initialize them !
chrome.runtime.onInstalled.addListener( () => {

    checkIfDataVariablesInLocalStorageIsInitialized("checkServerUrl").then( (isInitialized) => {
        if ( !isInitialized ) {
            initializeVariableInLocalStorage( ["checkServerUrl", "string", defaultCheckServer.url] )
            initializeVariableInLocalStorage( ["publicKey", "string", defaultCheckServer.publicKey] )
        }
    });
    

    // chrome.storage.local.get(null, (result) => {
    //     console.log("All stored data:", result);
    // });

})

