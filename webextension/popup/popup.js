browser.runtime.getBackgroundPage().then(async (backgroundPage) => {
  const CMH = backgroundPage.CMH
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  
  let indexElementToCheck = await CMH.tabsManager.processTab(tab, !CMH.options.settings.disableNotifications)
  let sameDomain = null

  if (Array.isArray(indexElementToCheck)) {
    indexElementToCheck = indexElementToCheck[0]
    sameDomain = true
  }

  if (indexElementToCheck === 'stop' || CMH.tabsManager.tabsStatus[tab.id].unique.length === 0)
    window.close()

  // Wait for CMH.tabsManager.tabsStatus[tab.id].unique to be populated by CMH.certificatesChecker.handleVerificationResult
  let maxAttempts = 100;
  let element = null
  if (CMH.options.settings.deepInspection && !sameDomain) {
    element = CMH.tabsManager.tabsStatus[tab.id].unique[CMH.tabsManager.tabsStatus[tab.id].unique.length - 1]?.[3] // Status of last element of CMH.tabsManager.tabsStatus[tab.id].unique
  } else {
    element = CMH.tabsManager.tabsStatus[tab.id].unique[indexElementToCheck]?.[3] // Status of element at indexElementToCheck of CMH.tabsManager.tabsStatus[tab.id].unique
  }
  while (maxAttempts > 0 && (element === -1)) {
    await new Promise(resolve => setTimeout(resolve, 50));
    if (CMH.options.settings.deepInspection && !sameDomain) {
      element = CMH.tabsManager.tabsStatus[tab.id].unique[CMH.tabsManager.tabsStatus[tab.id].unique.length - 1]?.[3] // Status of last element of CMH.tabsManager.tabsStatus[tab.id].unique
    } else {
      element = CMH.tabsManager.tabsStatus[tab.id].unique[indexElementToCheck]?.[3] // Status of element at indexElementToCheck of CMH.tabsManager.tabsStatus[tab.id].unique
    }
    maxAttempts--;
  }

  const listContainer = document.getElementById('domain-list');
  let statusClass = 'unknown'

  let index = null
  let i = -1
  if (CMH.options.settings.deepInspection) {
    index = CMH.tabsManager.tabsStatus[tab.id].unique.length - 1
    i = 0
  } else {
    index = indexElementToCheck
    i = indexElementToCheck
  }
  for (i; i <= index; i++) {
    if (CMH.tabsManager.tabsStatus[tab.id].unique[i]?.[3] === CMH.common.status.VALID) {
      statusClass = 'valid';
    }
    else if (CMH.tabsManager.tabsStatus[tab.id].unique[i]?.[3] === CMH.common.status.INVALID) {
      statusClass = 'invalid';
    }
    else {
      statusClass = 'unknown';
    }

    const item = document.createElement('div');
    item.className = 'domain-item';
    item.innerHTML = `
        <span class="status-dot ${statusClass}"></span>
        <strong>${CMH.tabsManager.tabsStatus[tab.id].unique[i]?.[1]}</strong> <small>(${statusClass})</small>
        <div class="details">
        <p>IP: ${CMH.tabsManager.tabsStatus[tab.id].unique[i]?.[0]}</p>
        <p>SHA256: ${CMH.tabsManager.tabsStatus[tab.id].unique[i]?.[2]?.fingerprints?.sha256}</p>
        </div>
    `;

    item.addEventListener('click', () => {
        item.classList.toggle('expanded');
    });

    listContainer.appendChild(item);
  }
});