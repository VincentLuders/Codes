(async function() {
    'use strict';

    // Step 1: Extract the text from the description element
    let descriptionElement = document.querySelector("#viewad-description-text");
    if (!descriptionElement) {
        console.error("Description element not found");
        return;
    }
    let descriptionText = descriptionElement.textContent;

    // Step 2: Add two paragraphs and append the specified question to create the complete prompt
    let promptText = descriptionText + "\n\nDoes the vendor in the upper text mention by any mean if he still has an invoice. " + 
                     "Answer with \"Yes\" if he did and answer with \"No\" if he hasn't mentioned an invoice or he has written he has no invoice. " + 
                     "You can only answer with \"No\" or \"Yes\". Don't give any additional comment.";

    try {
        // Step 3: Make an API call to OpenAI's API using the provided API key and the generated prompt
        let response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer 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"
            },
            body: JSON.stringify({
                "prompt": promptText,
                "max_tokens": 10
            })
        });

        let responseData = await response.json();

        // Step 4: Get the response from the API and extract the answer (either "Yes" or "No")
        let answer = responseData.choices[0].text.trim();

        // Step 5: Based on the answer, fill in the message text area with the appropriate message
        let messageTextArea = document.querySelector('textarea[name="message"]');
        if (messageTextArea) {
            if (answer.toLowerCase() === "yes") {
                messageTextArea.value = "Haben Sie Paypal?";
            } else if (answer.toLowerCase() === "no") {
                messageTextArea.value = "Haben Sie eine Rechnung?";
            } else {
                console.error("Unexpected answer from API: " + answer);
            }
        } else {
            console.error("Message text area not found");
        }
    } catch (error) {
        console.error("Error making API call", error);
    }
})();
