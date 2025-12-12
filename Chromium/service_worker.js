/**
 * @type {object}
 * Default settings.
 * Default check server (CheckMyHTTPS project server).
 */
const DEFAULT_SETTINGS = {
    alertOnUnicodeIDNDomainNames:  true,
    disableNotifications:          false,
    checkServerUrl:                'https://checkmyhttps.net/',
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


// Allows the sidePanel to open when you click on the extension icon
chrome.sidePanel.setPanelBehavior({openPanelOnActionClick: true}).catch( (error) => console.error(error));


/*
Take action on data variables saved in local storage
*/
async function takeActionFromMessageToDataVariables(request) {
    let keyName = request.dataVariable[0]
    let updateVariable = request.dataVariable[1]

    let isInitialized = await checkIfDataVariablesInLocalStorageIsInitialized(keyName);

    // If the array contain a third value, this means that we want to change the value of the variable
    if (updateVariable != undefined) {
        initializeVariableInLocalStorage([keyName, updateVariable])
    }
    else if (!isInitialized) {
        initializeVariableInLocalStorage( [keyName] )
    }

    // We get the actual value to send it back in the content script
    let result = await chrome.storage.local.get([keyName]);
    return {response: result[keyName]}
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
        
        if (request.type === 'GetDefaultSettings') {
            sendResponse(DEFAULT_SETTINGS);
            return true  
        } 
    
        return true
    }
);


/*
Allows you to initialize the desired variable in local storage
*/
function initializeVariableInLocalStorage(varInfoArray) {
    chrome.storage.local.set({ [varInfoArray[0]]: varInfoArray[1] }).then( () => {})
}


/*
Checks if a variable in local storage is initialized
*/
async function checkIfDataVariablesInLocalStorageIsInitialized(keyName) {
    let result = await chrome.storage.local.get(keyName)

    return Object.hasOwn(result, keyName)
}


// Check wether the default variables are initialized, otherwise call a function to initialize them
chrome.runtime.onInstalled.addListener( () => {
    const keys = Object.keys(DEFAULT_SETTINGS)
    for (let key of keys){
        checkIfDataVariablesInLocalStorageIsInitialized(key).then( (isInitialized) => {
            if ( !isInitialized ) {               
                initializeVariableInLocalStorage( [key, DEFAULT_SETTINGS[key]] )               
            }
        });
    }
})