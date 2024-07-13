function loadImages() {
  // Create a hidden canvas element
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d', { willReadFrequently: true }); // Specify willReadFrequently

  // Get all image elements on the page
  var imgElements = document.getElementsByTagName('img');

  for (var i = 0; i < imgElements.length; i++) {
      var imgElement = imgElements[i];

      // Ensure cross-origin images are not tainted
      imgElement.crossOrigin = "anonymous";

      // Add <figure> if not already wrapped
      if (imgElement.parentNode.tagName.toLowerCase() !== 'figure') {
          var figureElement = document.createElement('figure');
          imgElement.parentNode.insertBefore(figureElement, imgElement);
          figureElement.appendChild(imgElement);
      }

      // Add <figcaption> if not already present
      if (!imgElement.nextElementSibling || imgElement.nextElementSibling.tagName.toLowerCase() !== 'figcaption') {
          var figCaption = document.createElement('figcaption');
          imgElement.parentNode.appendChild(figCaption);
      }

      // Wait for the image to load
      imgElement.onload = (function(imgElement) {
          return function() {
              // Calculate new dimensions
              var aspectRatio = imgElement.width / imgElement.height;
              var newHeight = Math.min(imgElement.height, 64);
              var newWidth = newHeight * aspectRatio;

              // Set canvas dimensions to the new dimensions
              canvas.width = newWidth;
              canvas.height = newHeight;

              // Draw the resized image onto the canvas
              context.drawImage(imgElement, 0, 0, newWidth, newHeight);

              try {
                  // Get the image data from the canvas
                  var imageData = context.getImageData(0, 0, newWidth, newHeight);

                  // Convert image data to a blob
                  canvas.toBlob(function(blob) {
                      // Create a form data object
                      var formData = new FormData();
                      formData.append('image', blob, 'image.png');

                      // Send the image data to the server using fetch
                      fetch('https://9c75-3-147-44-61.ngrok-free.app/analyze-image', { // Replace with your server URL
                          method: 'POST',
                          body: formData
                      })
                      .then(response => response.json())
                      .then(data => {
                          // Update the figcaption with the data from the server
                          console.log(data);
                          imgElement.nextElementSibling.textContent = data.result || 'Hello';
                      })
                      .catch(error => {
                          console.error('Error:', error);
                          imgElement.nextElementSibling.textContent = 'Hello';
                      });
                  }, 'image/png');
              } catch (e) {
                  console.error('Failed to execute getImageData:', e);
              }
          }
      })(imgElement);

      // If the image is already loaded, trigger the load event
      if (imgElement.complete) {
          imgElement.onload();
      }
  }
};


function fetchAndModifyHTML() {
    // Send the current HTML to your API and receive the modified HTML back
    const currentHtml = document.body.innerHTML;
    fetch('https://3b2c-3-139-85-224.ngrok-free.app/process-html', {  // Your API endpoint here
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({
        html: currentHtml,
        geminiQuery: 'test'  // Example query, adjust as needed
        })
    })
    .then(response => {
        if (!response.ok) {
        return response.json().then(err => { throw new Error(err.error || 'Network response was not ok'); });
        }
        return response.json();  // Assuming the API returns a JSON object
    })
    .then(data => {
        console.log(data)
        const modifiedHtml = data.modified_html;
        // Set the inner HTML of the document to the modified HTML
        document.body.innerHTML = modifiedHtml;
        console.log(modifiedHtml);
    })
    .catch(error => {
        console.error('Error fetching and modifying HTML:', error);
    });
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'modifyHtml') {
        alert("modify");
        return
        fetchAndModifyHTML();
    }

    if (request.message === 'loadImages') {
        alert("images");
        return
        loadImages();
    }
  
});