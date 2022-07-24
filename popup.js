let processButton = document.getElementById("process");

processButton.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  document.getElementById("statusText").innerHTML = "";

  if (!tab.url.includes("musescore.com")) {
    document.getElementById("statusText").innerHTML = "Must be on musescore.com";
    return;
  }

  // Needs more testing, could load pages quicker
  // chrome.tabs.setZoom(tab.id, .25);

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['create.js'],
  });

  window.close();
});