// Main and Options pages in sidePanel
const tabs = document.querySelectorAll("[data-tab-target]")
const tabContents = document.querySelectorAll("[data-tab-content]")

tabs.forEach(tab => {
    tab.addEventListener("click", () => {
 
        const target = document.querySelector(tab.dataset.tabTarget)
  
        tabContents.forEach(tabContent => {
            tabContent.classList.remove("active")
        })

        tabs.forEach(tab => {
            tab.classList.remove("active")
        })

        tab.classList.add("active")
        target.classList.add("active")
    })
})


// Button that lets you show and hide steps so the user doesn't have to scroll down each time they open the extension
document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('display-steps');
    const sections = document.querySelectorAll('#main h2, #main img');
    
    const sectionsState = localStorage.getItem('sectionsState');
    
    if (sectionsState === 'hidden') {
        sections.forEach(section => section.classList.add('hidden'));
        toggleButton.textContent = chrome.i18n.getMessage('__showSteps__');
        toggleButton.setAttribute('data-state', 'hide');
    } else {
        toggleButton.textContent = chrome.i18n.getMessage('__hideSteps__');
    }

    toggleButton.addEventListener('click', () => {
        const currentState = toggleButton.getAttribute('data-state');
        
        if (currentState === 'show') {
            sections.forEach(section => section.classList.add('hidden'));
            toggleButton.textContent = chrome.i18n.getMessage('__showSteps__');
            toggleButton.setAttribute('data-state', 'hide');
            localStorage.setItem('sectionsState', 'hidden');
        } else {
            sections.forEach(section => section.classList.remove('hidden'));
            toggleButton.textContent = chrome.i18n.getMessage('__hideSteps__');
            toggleButton.setAttribute('data-state', 'show');
            localStorage.setItem('sectionsState', 'visible');
        }
    });
});


// Localization for the Main page (similar to the begining of options/options.js which is for localization of the Options page)
document.getElementById('restrictionMessage').textContent = chrome.i18n.getMessage('__restriction__');
document.getElementById('step1').textContent = chrome.i18n.getMessage('__step1__');
document.getElementById('step2').textContent = chrome.i18n.getMessage('__step2__');
document.getElementById('step3').textContent = chrome.i18n.getMessage('__step3__');
document.getElementById('step4').textContent = chrome.i18n.getMessage('__step4__');

document.getElementById('img1').src = chrome.i18n.getMessage('__img1__');
document.getElementById('img2').src = chrome.i18n.getMessage('__img2__');
document.getElementById('img3').src = chrome.i18n.getMessage('__img3__');
document.getElementById('img4').src = chrome.i18n.getMessage('__img4__');

document.getElementById('certificateInput').placeholder = chrome.i18n.getMessage('__certInput__');
document.getElementById('sendCertificate').textContent = chrome.i18n.getMessage('__send__');

const helpbtn = document.getElementById("help-btn")
helpbtn.onclick = function() {
    chrome.tabs.create({ url: "https://wikipedia.org/wiki/IDN_homograph_attack" })
};

helpbtn.title = chrome.i18n.getMessage('__infoUnicodeIDNDomainNames__');