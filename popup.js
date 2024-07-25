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
      chrome.storage.sync.get('imageModeOn', function (data) {
          // Toggle the imageModeOn state
          const imageModeOn = data.imageModeOn !== undefined ? !data.imageModeOn : true;
          chrome.storage.sync.set({ imageModeOn });

          // Update button style based on imageModeOn state
          if (imageModeOn) {
              document.getElementById("loadImagesBtn").classList.add('on');
          } else {
              document.getElementById("loadImagesBtn").classList.remove('on');
          }

          // Call popup function to inform active tab about the mode change
          popup("toggleImageMode");
      });
  });

  document.getElementById("modifyHtmlBtn").addEventListener("click", function() {
      popup("modifyHtml");
  });

  // Check initial state and update button style accordingly
  chrome.storage.sync.get('imageModeOn', function (data) {
      if (data.imageModeOn) {
          document.getElementById("loadImagesBtn").classList.add('on');
      } else {
          document.getElementById("loadImagesBtn").classList.remove('on');
      }
  });

  const imageMode = document.getElementById('imageMode');

  chrome.storage.sync.get('imageMode', function (data) {
    if (data.imageMode) {
      imageMode.value = data.imageMode;
    }
    else{
      imageMode.value = "describe";
    }
  });

  imageMode.addEventListener('change', function () {
    chrome.storage.sync.set({ imageMode: imageMode.value });
  });

});