// Function to send message to active tab
function popup(message) {
  chrome.tabs.query({ currentWindow: true, active: true }, function(tabs) {
      var activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, { "message": message });
  });
}

// Add event listeners to the buttons in the popup HTML
document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("loadImagesBtn").addEventListener("click", function() {
      popup("loadImages");
  });

  document.getElementById("modifyHtmlBtn").addEventListener("click", function() {
      popup("modifyHtml");
  });
});
