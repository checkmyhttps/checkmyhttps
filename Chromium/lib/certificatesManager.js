/**
 * @file Certificates manager.
 * @author CheckMyHTTPS's team
 * @license GPL-3.0
 */


/*
Functions that make the Send button at the bottom of Main page in sidePanel check the actual tab
*/
async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

function onSubmittingCertificate() {
  let certificateValue = document.getElementById("certificateInput").value; 
  if (certificateValue === "")
      return 

  // The upperCase method if mandatory for sha256 comparison function
  getCurrentTab().then( tab => {
      CMH.certificatesChecker.checkTab(tab, !CMH.options.settings.disableNotifications, certificateValue.toUpperCase() );
  });
}

document.getElementById("sendCertificate").addEventListener("click", onSubmittingCertificate);