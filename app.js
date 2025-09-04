document.addEventListener('DOMContentLoaded', () => {
    const resultContainer = document.getElementById('result');
    let lastResult, countResults = 0;

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
                buttonHtml = `<button onclick="window.open('${formUrl}', '_blank')" class="submit-btn">Submit to Google Form</button>`;
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