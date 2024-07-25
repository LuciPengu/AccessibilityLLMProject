const url = "https://6eab10a9-62c2-4c96-a15b-b920ea74a737-00-yj9t8stt52on.janeway.replit.dev/";
var imageModeOn = false;
chrome.storage.sync.get('imageModeOn', function (data) {
  const val = data.imageModeOn;
  imageModeOn = val;
});

function toggleTemporaryHighlighting(duration) {
    // Function to add styles
    function addStyles() {
        const style = document.createElement('style');
        style.id = 'temporaryHighlightStyles';
        style.innerHTML = `
        header {
            background: #f8d7da !important;
        }
        nav {
            background: #d1ecf1 !important;
        }
        article {
            background: #d4edda !important;
        }
        section {
            background: #fff3cd !important;
        }
        aside {
            background: #cce5ff !important;
        }
        footer {
            background: #e2e3e5 !important;
        }
        `;
        document.head.appendChild(style);
    }

    // Function to remove styles
    function removeStyles() {
        const style = document.getElementById('temporaryHighlightStyles');
        if (style) {
        style.remove();
        }
    }

    // Add styles initially
    addStyles();

    // Remove styles after the specified duration
    setTimeout(removeStyles, duration);
    
}

function ImageToText(imgElement, endPoint) {
    try {
        var msg = new SpeechSynthesisUtterance("Loading Image Data");
        window.speechSynthesis.speak(msg);
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
            return async function() {
                try {
                    // Send the image URL to the server
                    var imageUrl = imgElement.dataset.originalSrc;
                    console.log(imageUrl);
                    // Create a form data object
                    var formData = new FormData();
                    formData.append('image_url', imageUrl);
                    console.log(formData);
                    // Send the image URL to the server using fetch
                    const response = await fetch(`${url}${endPoint}`, { 
                        method: 'POST',
                        body: formData
                    });
                    if (!response.ok) {
                        throw new Error(`Network response was not ok: ${response.statusText}`);
                    }
                    const data = await response.json();
                    // Update the figcaption with the data from the server
                    console.log(data);
                    
                    if (data.result.split(/\s+/).length <= 30){
                        imgElement.nextElementSibling.textContent = data.result;
                        var msg = new SpeechSynthesisUtterance(imgElement.nextElementSibling.textContent);
                        window.speechSynthesis.speak(msg);
                    }
                    else {
                        navigator.clipboard.writeText(data.result);
                        var msg = new SpeechSynthesisUtterance("The Result Was Copied To Your Clipboard");
                        window.speechSynthesis.speak(msg);
                    }
                } catch (error) {
                    console.error('Error:', error);
                    imgElement.nextElementSibling.textContent = 'Hello';
                    var msg = new SpeechSynthesisUtterance(error);
                    window.speechSynthesis.speak(msg);
                }
            }
        (imgElement);

    } catch (error) {
        console.error('Error in loadImages:', error);
    }
}

async function fetchAndModifyHTML() {
    try {
        var msg = new SpeechSynthesisUtterance("Updating Semantic Tags");
        window.speechSynthesis.speak(msg);
        // Send the current HTML to your API and receive the modified HTML back
        const currentHtml = document.body.innerHTML;
        const response = await fetch(`${url}process-html`, {  
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                html: currentHtml,
                geminiQuery: 'test'  // Example query, adjust as needed
            })
        });
        if (!response.ok) {
            const errorData = await response.json();
            var msg = new SpeechSynthesisUtterance("Error, The Site Is Likely Too Large To Update The Tags");
            window.speechSynthesis.speak(msg);
            throw new Error(errorData.error || 'Network response was not ok');
        }
        const data = await response.json();  // Assuming the API returns a JSON object
        const modifiedHtml = data.modified_html;
        const tagCount = data.tag_count;

        var msg = new SpeechSynthesisUtterance("Updated "+tagCount+ " Semantic Tags");
        window.speechSynthesis.speak(msg);

        // Set the inner HTML of the document to the modified HTML
        document.body.innerHTML = modifiedHtml;
        toggleTemporaryHighlighting(5000)
        console.log(modifiedHtml);
    } catch (error) {
        console.error('Error fetching and modifying HTML:', error);
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
        if (request.message === 'modifyHtml') {
            fetchAndModifyHTML();
        }

        if (request.message === "toggleImageMode") {
          chrome.storage.sync.get('imageModeOn', function (data) {
            const val = data.imageModeOn;
            imageModeOn = val;
          });
        }

    } catch (error) {
        console.error('Error in onMessage listener:', error);
    }
});

function modifyImageOnHover(imgElement) {
// Check if the mouseover target is an <img> element
  imgElement.classList.add('highlight');

  // Get the image element
  const img = imgElement;

  // Check if the image has already been modified (to prevent multiple modifications)
  if (!img.dataset.originalSrc) {
      // Store the original src in a data attribute
      img.dataset.originalSrc = img.src;
  }

  // Create a temporary canvas element
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Set canvas dimensions to match the original image
  canvas.width = img.width;
  canvas.height = img.height;
  
  // Fill the canvas with red
  ctx.fillStyle = 'red';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Replace the image source with the red canvas data
  img.src = canvas.toDataURL();

}

// Function to reset image on mouseout
function resetImage(imgElement) {
  // Check if the mouseout target is an <img> element
  if (imgElement.tagName === 'IMG') {
      imgElement.classList.remove('highlight');

      // Restore the original image source
      const img = imgElement;
      if (img.dataset.originalSrc) {
          img.src = img.dataset.originalSrc;
      }
  }
}

document.addEventListener('click', function (event) {
    try {
        chrome.storage.sync.get('settingMode', ({ settingMode }) => {
            mode = settingMode;
        });

        if (event.target.tagName === 'IMG' && imageModeOn) {
            event.preventDefault();
            event.stopPropagation();
            
            chrome.storage.sync.get('imageMode', ({ imageMode }) => {
                if (imageMode == "describe") ImageToText(event.target, "analyze-image");

                if(imageMode == "ocr") ImageToText(event.target, "ocr");
            });

        }
    } catch (error) {
        console.error('Error in document click event:', error);
    }
});

// Add event listeners for mouseover and mouseout
document.addEventListener('mouseover', function (event) {
    try {
        if (imageModeOn && event.target.tagName === "IMG") modifyImageOnHover(event.target);

    } catch (error) {
        console.error('Error in mouseover event:', error);
    }
});
document.addEventListener('mouseout', function (event) {
    try {
        if (imageModeOn && event.target.tagName === "IMG") resetImage(event.target);
    } catch (error) {
        console.error('Error in mouseout event:', error);
    }
});

