import { boldReadify } from "./utils.js";

let toggleBoldReading = document.getElementById("toggleBoldReading");
let autoButton = document.getElementById("autoButton");
let excludePatternInput = document.getElementById("excludePattern");
let excludePageButton = document.getElementById("excludePageButton");

var buttonEnabledClass = "btn";
var buttonDisabledClass = "btn-disabled";

function setClass(element, cls) {
  element.className = cls;
}

async function updatePatternText() {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  excludePatternInput.value = tab.url;
  updateExcludeButtonText();
}

function updateExcludeButtonText() {
  var currentPattern = excludePatternInput.value;
  chrome.storage.sync.get(["excludedPatterns"], (data) => {
    if (data.excludedPatterns.indexOf(currentPattern) != -1) {
      excludePageButton.innerText = "Remove URL from exclude list";
      setClass(excludePageButton, buttonDisabledClass);
    } else {
      excludePageButton.innerText = "Add URL to exclude list";
      setClass(excludePageButton, buttonEnabledClass);
    }
  });
}

updatePatternText();

function toggleExcludedPattern(pattern) {
  chrome.storage.sync.get(["excludedPatterns"], (data) => {
    var patterns = data.excludedPatterns;

    var index = -1;
    for (var i = 0; i < data.excludedPatterns.length; i++) {
      if (patterns[i] === pattern) {
        index = i;
        break;
      }
    }
    if (index === -1) {
      patterns.push(pattern);
    } else {
      patterns.splice(index, 1);
    }
    chrome.storage.sync.set({ excludedPatterns: patterns });
    updateExcludeButtonText();
  });
}

excludePageButton.addEventListener("click", async () => {
  toggleExcludedPattern(excludePatternInput.value);
});

function updateAutoApplyText(isAuto) {
  if (isAuto) {
    autoButton.innerText = "Disable Automatic Mode";
    setClass(autoButton, buttonDisabledClass);
  } else {
    autoButton.innerText = "Enable Automatic Mode";
    setClass(autoButton, buttonEnabledClass);
  }
}

chrome.storage.sync.get(["autoApply"], (data) => {
  updateAutoApplyText(data.autoApply);
});

excludePatternInput.addEventListener("input", async (text) => {
  updateExcludeButtonText();
});

toggleBoldReading.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: boldReadify,
  });
});

autoButton.addEventListener("click", async () => {
  chrome.storage.sync.get(["autoApply"], (data) => {
    updateAutoApplyText(!data.autoApply);
    chrome.storage.sync.set({ autoApply: !data.autoApply });
  });
});
