browser.runtime.getBackgroundPage().then(async (backgroundPage) => {
  const CMH = backgroundPage.CMH
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  
  const t = await CMH.tabsManager.processTab(tab, !CMH.options.settings.disableNotifications)

  if (!t && !CMH.options.settings.deepInspection) {
    await new Promise(resolve => setTimeout(resolve, 200)); 
    window.close();
    return
  }

  const listContainer = document.getElementById('domain-list');
  let statusClass

  for (let i = 1; i < CMH.tabsManager.tabsStatus[tab.id].unique.length; i++) {
    if (CMH.tabsManager.tabsStatus[tab.id].unique[i]?.[3] === CMH.common.status.VALID) {
      statusClass = 'valid';
    }
    if (CMH.tabsManager.tabsStatus[tab.id].unique[i]?.[3] === CMH.common.status.INVALID) {
      statusClass = 'invalid';
    }
    if (CMH.tabsManager.tabsStatus[tab.id].unique[i]?.[3] === CMH.common.status.UNKNOWN) {
      statusClass = 'unknown';
    }

    const item = document.createElement('div');
    item.className = 'domain-item';
    item.innerHTML = `
        <span class="status-dot ${statusClass}"></span>
        <strong>${CMH.tabsManager.tabsStatus[tab.id].unique[i]?.[1]}</strong> <small>(${statusClass})</small>
        <div class="details">
        <p>IP: ${CMH.tabsManager.tabsStatus[tab.id].unique[i]?.[0]}</p>
        <p>SHA256: ${CMH.tabsManager.tabsStatus[tab.id].unique[i]?.[2].fingerprints.sha256}</p>
        </div>
    `;

    item.addEventListener('click', () => {
        item.classList.toggle('expanded');
    });

    listContainer.appendChild(item);
  }
});