async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}


function onSubmittingCertificate() {
    
    let certificateValue = document.getElementById("certificateInput").value; 
    if (certificateValue === "")
        return 


    // The upperCase method if mandatory for sha256 comparison function
    getCurrentTab().then( tab => {
        CMH.certificatesChecker.checkTab(tab, true, certificateValue.toUpperCase() );
    });
}

document.getElementById("sendCertificate").addEventListener("click", onSubmittingCertificate);

chrome.storage.local.set({ greeting: "Hello, world!" }, () => {

    if ( chrome.runtime.lastError) {
        console.error("Error saving to storage.", chrome.runtime.lastError)
    }
    else {   
        console.log("Greeting saved to storage.");
    }
});


