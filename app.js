// These variables need to be in a broader scope to be accessible by the global reset function.
let lastResult;
let resultContainer;

/**
 * Opens the Google Form in a new tab and resets the UI for the next scan.
 * This function is called from the button generated in onScanSuccess.
 * @param {string} formUrl - The pre-filled Google Form URL.
 */
function handleSubmitAndReset(formUrl) {
    window.open(formUrl, '_blank');
    resultContainer.style.display = 'none';
    lastResult = null; // Allow scanning the same code again
    console.log("UI has been reset for the next scan.");
}

document.addEventListener('DOMContentLoaded', () => {
    resultContainer = document.getElementById('result');
    let countResults = 0;

    function onScanSuccess(decodedText, decodedResult) {
        // To avoid continuous scanning, we can check if the result is new.
        if (decodedText !== lastResult) {
            lastResult = decodedText;
            countResults++;
            console.log(`Scan result ${countResults}: ${decodedText}`, decodedResult);

            let buttonHtml;
            if (typeof APP_CONFIG === 'undefined' || APP_CONFIG.GOOGLE_FORM_URL.includes("YOUR_FORM_ID")) {
                buttonHtml = `<button class="submit-btn" disabled>Configure Google Form in config.js</button>`;
                console.warn("Google Form URL/Field ID not configured. Please create and configure config.js.");
            } else {
                const encodedQrValue = encodeURIComponent(decodedText);
                const formUrl = `${APP_CONFIG.GOOGLE_FORM_URL}?usp=pp_url&${APP_CONFIG.QR_VALUE_FIELD_ID}=${encodedQrValue}`;
                buttonHtml = `<button onclick="handleSubmitAndReset('${formUrl}')" class="submit-btn">Submit & Scan Next</button>`;
            }

            // Make the result container visible and display the result
            resultContainer.style.display = 'block';
            resultContainer.innerHTML = `
                <p><strong>Success!</strong> QR Code detected:</p>
                <p class="scanned-text">${createLink(decodedText)}</p>
                ${buttonHtml}
            `;
        }
    }

    function createLink(text) {
        try {
            // Check if the text is a valid URL
            new URL(text);
            return `<a href="${text}" target="_blank" rel="noopener noreferrer">${text}</a>`;
        } catch (_) {
            // If not a URL, return the text as is
            return text;
        }
    }

    // When scan is unsuccessful, this callback is executed.
    function onScanFailure(error) {
        // We can ignore scan failures, as they happen frequently when no QR code is in view.
        // console.warn(`Code scan error = ${error}`);
    }

    // Create a new scanner instance
    const html5QrcodeScanner = new Html5QrcodeScanner(
        "reader", // ID of the element to render the scanner
        { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            facingMode: "environment" // Use 'user' for front camera
        },
        /* verbose= */ false);

    // Render the scanner
    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
});