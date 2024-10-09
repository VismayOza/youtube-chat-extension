let uniqueIdCounter = 1; // Initialize a counter for unique IDs

// Function to generate a unique ID
function generateUniqueId() {
  return `message-${uniqueIdCounter++}`; // Increment the counter after generating the ID
}

// Function to check if a message is pinned
function isPinnedMessage(message) {
  return message && message.hasAttribute("in-banner");
}

// Function to check if a message is a special type (like Super Chat, Member Message)
function isSpecialMessage(message) {
  return message.matches(
    "yt-live-chat-paid-message-renderer, yt-live-chat-member-message-renderer"
  );
}

// Function to determine if a message is inside the Super Chat modal
function isInSuperChatModal(message) {
  return !!message.closest("yt-live-chat-viewer-engagement-message-renderer");
}

// Function to check if a message is from Nightbot
function isNightbotMessage(message) {
  const authorName = message.querySelector("#author-name");
  return (
    authorName && authorName.textContent.trim().toLowerCase() === "nightbot"
  );
}

// Function to check if a message is from Streamlabs
function isStreamlabsMessage(message) {
  const authorName = message.querySelector("#author-name");
  return (
    authorName && authorName.textContent.trim().toLowerCase() === "streamlabs"
  );
}

// Function to style a message based on textDecoration (line-through or none)
function styleMessage(message, textDecoration) {
  if (!message) return;

  // Apply styles to the message
  message.style.textDecoration = textDecoration;
  message.style.color = textDecoration === "line-through" ? "gray" : "";
  message.style.opacity = textDecoration === "line-through" ? "0.7" : "";
  message.style.textDecorationThickness = "2px";

  // Apply styles to the author name if it exists
  const userName = message.querySelector("#author-name");
  if (userName) {
    userName.style.textDecoration = textDecoration;
    userName.style.color = textDecoration === "line-through" ? "gray" : "";
    userName.style.textDecorationThickness = "2px";
  }

  // Handle images
  const images = message.querySelectorAll("img");
  images.forEach((img) => {
    const imgParent = img.parentElement;

    if (textDecoration === "line-through") {
      // Add a line if it's not already there
      if (!imgParent.querySelector(".line-through-overlay")) {
        const line = document.createElement("div");
        line.className = "line-through-overlay";
        line.style.position = "absolute";
        line.style.top = "50%";
        line.style.left = "0";
        line.style.width = "100%";
        line.style.height = "2px";
        line.style.backgroundColor = "gray";
        line.style.transform = "translateY(-50%)";
        if (imgParent.id != "overlay-image") {
          imgParent.style.position = "relative";
        }
        imgParent.appendChild(line);
      }
    } else {
      // Remove the line if it's there
      const line = imgParent.querySelector(".line-through-overlay");
      if (line) {
        line.remove();
      }
      imgParent.style.position = ""; // Revert to original positioning
    }
  });
}

// Function to style special messages like Super Chat and Member Messages
function styleSpecialMessage(message) {
  if (!message || isPinnedMessage(message)) return;

  message.style.border = "2px solid gold";
  message.style.padding = "5px";
  message.style.borderRadius = "8px";
  message.style.backgroundColor = "rgba(255, 215, 0, 0.2)";

  const username = message.querySelector("#author-name");
  if (username) {
    username.style.fontWeight = "bold";
    username.style.color = "orange";
  }

  const moneyImg = document.createElement("img");
  moneyImg.src = chrome.runtime.getURL("./images/1603780019212.jpeg");
  moneyImg.alt = "Money Image";
  moneyImg.style.width = "auto";
  moneyImg.style.height = "150px";
  moneyImg.style.marginTop = "10px";
  moneyImg.style.objectFit = "cover";

  const existingImg = message.querySelector(".money-img");
  if (!existingImg) {
    moneyImg.className = "money-img";
    message.appendChild(moneyImg);
  }
}

// Function to apply styles based on the saved checkbox state
function applyStylesOnLoad(checkbox, message) {
  if (!checkbox || !message) return;

  const textDecoration = checkbox.checked ? "line-through" : "none";
  styleMessage(message, textDecoration);
}

// Function to add a checkbox and number before each chat message
function addCheckboxToMessages() {
  const messages = document.querySelectorAll(
    "yt-live-chat-text-message-renderer, yt-live-chat-paid-message-renderer, yt-live-chat-member-message-renderer"
  );

  messages.forEach((message, index) => {
    // Skip pinned messages and messages inside the tp-yt-paper-dialog
    if (isPinnedMessage(message) || message.closest("tp-yt-paper-dialog"))
      return;

    const messageId = generateUniqueId(); // Use the unique ID generator
    const uniqueId = `checkbox-${messageId}`;

    if (!message.closest(".chat-message-container")) {
      const containerDiv = document.createElement("div");
      containerDiv.className = "chat-message-container";
      containerDiv.style.display = "flex";
      containerDiv.style.position = "relative";

      const numberSpan = document.createElement("span");
      numberSpan.textContent = `${index + 1}. `;
      numberSpan.style.fontWeight = "bold";
      numberSpan.style.marginRight = "8px";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = uniqueId;
      checkbox.className = "message-checkbox";
      checkbox.style.marginRight = "8px";
      checkbox.setAttribute("aria-label", "Mark message as processed");

      const label = document.createElement("label");
      label.htmlFor = uniqueId;
      label.style.cursor = "pointer";
      label.style.display = "inline-block";

      containerDiv.appendChild(numberSpan); // Add number before checkbox
      containerDiv.appendChild(checkbox);
      message.parentNode.insertBefore(containerDiv, message);
      containerDiv.appendChild(label);
      containerDiv.appendChild(message);

      // Disable and strike-through Nightbot and Streamlabs messages
      if (isNightbotMessage(message) || isStreamlabsMessage(message)) {
        checkbox.checked = true;
        checkbox.disabled = true;
        styleMessage(message, "line-through");
      } else {
        // Load saved state and apply necessary styles
        const savedState = localStorage.getItem(uniqueId);
        if (savedState !== null) {
          checkbox.checked = savedState === "true";
          applyStylesOnLoad(checkbox, message); // Apply styles based on loaded state
        }
      }

      checkbox.addEventListener("change", (e) => {
        e.preventDefault();
        handleCheckboxChange(e.target);
      });
    }

    // Special handling for Super Chat and Member Messages
    if (isSpecialMessage(message)) {
      styleSpecialMessage(message);
    }
  });
}

// Function to handle checkbox change
function handleCheckboxChange(currentCheckbox) {
  const messages = Array.from(
    document.querySelectorAll(
      "yt-live-chat-text-message-renderer, yt-live-chat-paid-message-renderer, yt-live-chat-member-message-renderer"
    )
  );
  const currentContainer = currentCheckbox.closest(".chat-message-container");
  const currentMessage = currentContainer?.querySelector(
    "yt-live-chat-text-message-renderer, yt-live-chat-paid-message-renderer, yt-live-chat-member-message-renderer"
  );

  if (!currentMessage || isInSuperChatModal(currentMessage)) return;

  const currentIndex = messages.indexOf(currentMessage);

  // Handle message checking and unchecking
  if (currentCheckbox.checked) {
    messages.slice(0, currentIndex).forEach((msg) => {
      if (
        !isPinnedMessage(msg) &&
        !isInSuperChatModal(msg) &&
        !isNightbotMessage(msg) &&
        !isStreamlabsMessage(msg)
      ) {
        const prevCheckbox = msg
          .closest(".chat-message-container")
          ?.querySelector(".message-checkbox");
        if (prevCheckbox && !prevCheckbox.checked) {
          prevCheckbox.checked = true;
          styleMessage(msg, "line-through");
        }
      }
    });

    styleMessage(currentMessage, "line-through");
  } else {
    messages.slice(currentIndex).forEach((msg) => {
      if (
        !isPinnedMessage(msg) &&
        !isInSuperChatModal(msg) &&
        !isNightbotMessage(msg) &&
        !isStreamlabsMessage(msg)
      ) {
        const checkbox = msg
          .closest(".chat-message-container")
          ?.querySelector(".message-checkbox");
        if (checkbox && checkbox.checked) {
          checkbox.checked = false;
          styleMessage(msg, "none");
        }
      }
    });

    styleMessage(currentMessage, "none");
  }

  saveCheckboxState();
}

// Function to save checkbox state
function saveCheckboxState() {
  const checkboxes = document.querySelectorAll(".message-checkbox");
  checkboxes.forEach((checkbox) => {
    localStorage.setItem(checkbox.id, checkbox.checked);
  });
}

// Function to set up MutationObserver for monitoring changes
function setupMutationObserver() {
  const chatContainer = document.querySelector(
    "yt-live-chat-item-list-renderer"
  );
  if (!chatContainer) return;

  const observer = new MutationObserver(() => {
    addCheckboxToMessages();
    removeSpecificElements();
  });

  observer.observe(chatContainer, { childList: true, subtree: true });
}

// Function to observe changes in the live chat container
function observeChatContainerChanges() {
  const liveChatContainer = document.querySelector("yt-live-chat-app");
  if (!liveChatContainer) return;

  const chatObserver = new MutationObserver(() => {
    const chatContainer = document.querySelector(
      "yt-live-chat-item-list-renderer"
    );
    if (chatContainer) {
      setupMutationObserver();
    }
  });

  chatObserver.observe(liveChatContainer, { childList: true, subtree: true });
}

// Function to remove specific elements initially and during chat updates
function removeSpecificElements() {
  const elements = document.querySelectorAll(
    "tp-yt-paper-button#show-more, tp-yt-paper-button#show-less, yt-live-chat-legacy-paid-message-renderer"
  );
  elements.forEach((element) => {
    element.style.display = "none";
  });

  const dropdownMenus = document.querySelectorAll("tp-yt-iron-dropdown");
  dropdownMenus.forEach((menu) => {
    menu.style.display = "none";
  });
}

// Function to add the "Uncheck All" button
function addUncheckAllButton() {
  const existingButton = document.querySelector("#uncheck-all-button");
  if (existingButton) return;

  const button = document.createElement("button");
  button.id = "uncheck-all-button";
  button.textContent = "Uncheck All";
  button.style.position = "fixed";
  button.style.top = "0.5%";
  button.style.right = "10px";
  button.style.padding = "10px 20px";
  button.style.backgroundColor = "#007bff";
  button.style.color = "white";
  button.style.border = "none";
  button.style.borderRadius = "5px";
  button.style.cursor = "pointer";
  button.style.zIndex = "1000";

  button.addEventListener("click", () => {
    document.querySelectorAll(".message-checkbox").forEach((checkbox) => {
      if (!checkbox.disabled) {
        // Only uncheck checkboxes that are not disabled
        checkbox.checked = false;
        const message = document
          .getElementById(checkbox.id)
          ?.closest(".chat-message-container")
          ?.querySelector(
            "yt-live-chat-text-message-renderer, yt-live-chat-paid-message-renderer, yt-live-chat-member-message-renderer"
          );
        if (message) {
          styleMessage(message, "none");
        }
      }
    });
    saveCheckboxState();
  });

  document.body.appendChild(button);
}

// Function to initialize voice recognition
function initializeVoiceRecognition() {
  if (!("webkitSpeechRecognition" in window)) {
    console.log("Speech recognition not supported.");
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US"; // Set the language to English
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    handleVoiceCommand(transcript);
  };

  recognition.onerror = function (event) {
    console.error("Speech recognition error:", event.error);
  };

  recognition.onend = function () {
    console.log("Speech recognition ended.");
    // Restart recognition after ending
    recognition.start();
  };

  recognition.start();
}

// Function to handle the voice command
function handleVoiceCommand(transcript) {
  console.log("Voice command received:", transcript);

  // Check if the transcript is a number
  const messageNumber = parseInt(transcript, 10);
  if (!isNaN(messageNumber)) {
    const messages = Array.from(
      document.querySelectorAll(
        "yt-live-chat-text-message-renderer, yt-live-chat-paid-message-renderer, yt-live-chat-member-message-renderer"
      )
    );

    const targetMessage = messages[messageNumber - 1]; // Get message by number

    if (targetMessage) {
      const checkbox = targetMessage
        .closest(".chat-message-container")
        ?.querySelector(".message-checkbox");
      if (checkbox) {
        checkbox.checked = true;
        styleMessage(targetMessage, "line-through");
        saveCheckboxState();
        checkPreviousMessages(messages.slice(0, messageNumber - 1)); // Check all previous messages up to the matched message
      }
    }
  }
}

// Function to check all previous messages up to the matched message
function checkPreviousMessages(previousMessages) {
  previousMessages.forEach((message) => {
    const checkbox = message
      .closest(".chat-message-container")
      ?.querySelector(".message-checkbox");
    if (checkbox && !checkbox.checked) {
      checkbox.checked = true;
      styleMessage(message, "line-through");
    }
  });
  saveCheckboxState();
}

// Function to initialize everything
function initialize() {
  addCheckboxToMessages();
  observeChatContainerChanges();
  addUncheckAllButton(); // Add the button initially
  initializeVoiceRecognition(); // Initialize voice recognition
}

// Run the initialization
initialize();

// Function to check if a message is pinned
// function isPinnedMessage(message) {
//   return message && message.hasAttribute("in-banner");
// }

// // Function to check if a message is a special type (like Super Chat, Member Message)
// function isSpecialMessage(message) {
//   return message.matches(
//     "yt-live-chat-paid-message-renderer, yt-live-chat-member-message-renderer"
//   );
// }

// // Function to determine if a message is inside the Super Chat modal
// function isInSuperChatModal(message) {
//   return !!message.closest("yt-live-chat-viewer-engagement-message-renderer");
// }

// // Function to check if a message is from Nightbot
// function isNightbotMessage(message) {
//   const authorName = message.querySelector("#author-name");
//   return (
//     authorName && authorName.textContent.trim().toLowerCase() === "nightbot"
//   );
// }

// // Function to check if a message is from Streamlabs
// function isStreamlabsMessage(message) {
//   const authorName = message.querySelector("#author-name");
//   return (
//     authorName && authorName.textContent.trim().toLowerCase() === "streamlabs"
//   );
// }

// // Function to style a message based on textDecoration (line-through or none)
// function styleMessage(message, textDecoration) {
//   if (!message) return;

//   // Apply styles to the message
//   message.style.textDecoration = textDecoration;
//   message.style.color = textDecoration === "line-through" ? "gray" : "";
//   message.style.opacity = textDecoration === "line-through" ? "0.7" : "";
//   message.style.textDecorationThickness = "2px";

//   // Apply styles to the author name if it exists
//   const userName = message.querySelector("#author-name");
//   if (userName) {
//     userName.style.textDecoration = textDecoration;
//     userName.style.color = textDecoration === "line-through" ? "gray" : "";
//     userName.style.textDecorationThickness = "2px";
//   }

//   // Handle images
//   const images = message.querySelectorAll("img");
//   images.forEach((img) => {
//     const imgParent = img.parentElement;

//     if (textDecoration === "line-through") {
//       // Add a line if it's not already there
//       if (!imgParent.querySelector(".line-through-overlay")) {
//         const line = document.createElement("div");
//         line.className = "line-through-overlay";
//         line.style.position = "absolute";
//         line.style.top = "50%";
//         line.style.left = "0";
//         line.style.width = "100%";
//         line.style.height = "2px";
//         line.style.backgroundColor = "gray";
//         line.style.transform = "translateY(-50%)";
//         if (imgParent.id != "overlay-image") {
//           imgParent.style.position = "relative";
//         }
//         imgParent.appendChild(line);
//       }
//     } else {
//       // Remove the line if it's there
//       const line = imgParent.querySelector(".line-through-overlay");
//       if (line) {
//         line.remove();
//       }
//       imgParent.style.position = ""; // Revert to original positioning
//     }
//   });
// }

// // Function to style special messages like Super Chat and Member Messages
// function styleSpecialMessage(message) {
//   if (!message || isPinnedMessage(message)) return;

//   message.style.border = "2px solid gold";
//   message.style.padding = "5px";
//   message.style.borderRadius = "8px";
//   message.style.backgroundColor = "rgba(255, 215, 0, 0.2)";

//   const username = message.querySelector("#author-name");
//   if (username) {
//     username.style.fontWeight = "bold";
//     username.style.color = "orange";
//   }

//   const moneyImg = document.createElement("img");
//   moneyImg.src = chrome.runtime.getURL("./images/1603780019212.jpeg");
//   moneyImg.alt = "Money Image";
//   moneyImg.style.width = "auto";
//   moneyImg.style.height = "150px";
//   moneyImg.style.marginTop = "10px";
//   moneyImg.style.objectFit = "cover";

//   const existingImg = message.querySelector(".money-img");
//   if (!existingImg) {
//     moneyImg.className = "money-img";
//     message.appendChild(moneyImg);
//   }
// }

// // Function to apply styles based on the saved checkbox state
// function applyStylesOnLoad(checkbox, message) {
//   if (!checkbox || !message) return;

//   const textDecoration = checkbox.checked ? "line-through" : "none";
//   styleMessage(message, textDecoration);
// }

// // Function to add a checkbox before each chat message
// function addCheckboxToMessages() {
//   const messages = document.querySelectorAll(
//     "yt-live-chat-text-message-renderer, yt-live-chat-paid-message-renderer, yt-live-chat-member-message-renderer"
//   );

//   messages.forEach((message) => {
//     // Skip pinned messages and messages inside the tp-yt-paper-dialog
//     if (isPinnedMessage(message) || message.closest("tp-yt-paper-dialog"))
//       return;

//     const messageId =
//       message.getAttribute("id") ||
//       message.getAttribute("data-message-id") ||
//       message.textContent.trim();
//     const uniqueId = `checkbox-${messageId}`;

//     if (!message.closest(".chat-message-container")) {
//       const containerDiv = document.createElement("div");
//       containerDiv.className = "chat-message-container";
//       containerDiv.style.display = "flex";
//       containerDiv.style.position = "relative";

//       const checkbox = document.createElement("input");
//       checkbox.type = "checkbox";
//       checkbox.id = uniqueId;
//       checkbox.className = "message-checkbox";
//       checkbox.style.marginRight = "8px";
//       checkbox.setAttribute("aria-label", "Mark message as processed");

//       const label = document.createElement("label");
//       label.htmlFor = uniqueId;
//       label.style.cursor = "pointer";
//       label.style.display = "inline-block";

//       containerDiv.appendChild(checkbox);
//       message.parentNode.insertBefore(containerDiv, message);
//       containerDiv.appendChild(label);
//       containerDiv.appendChild(message);

//       // Disable and strike-through Nightbot and Streamlabs messages
//       if (isNightbotMessage(message) || isStreamlabsMessage(message)) {
//         checkbox.checked = true;
//         checkbox.disabled = true;
//         styleMessage(message, "line-through");
//       } else {
//         // Load saved state and apply necessary styles
//         const savedState = localStorage.getItem(uniqueId);
//         if (savedState !== null) {
//           checkbox.checked = savedState === "true";
//           applyStylesOnLoad(checkbox, message); // Apply styles based on loaded state
//         }
//       }

//       checkbox.addEventListener("change", (e) => {
//         e.preventDefault();
//         handleCheckboxChange(e.target);
//       });
//     }

//     // Special handling for Super Chat and Member Messages
//     if (isSpecialMessage(message)) {
//       styleSpecialMessage(message);
//     }
//   });
// }

// // Function to handle checkbox change
// function handleCheckboxChange(currentCheckbox) {
//   const messages = Array.from(
//     document.querySelectorAll(
//       "yt-live-chat-text-message-renderer, yt-live-chat-paid-message-renderer, yt-live-chat-member-message-renderer"
//     )
//   );
//   const currentContainer = currentCheckbox.closest(".chat-message-container");
//   const currentMessage = currentContainer?.querySelector(
//     "yt-live-chat-text-message-renderer, yt-live-chat-paid-message-renderer, yt-live-chat-member-message-renderer"
//   );

//   if (!currentMessage || isInSuperChatModal(currentMessage)) return;

//   const currentIndex = messages.indexOf(currentMessage);

//   // Handle message checking and unchecking
//   if (currentCheckbox.checked) {
//     messages.slice(0, currentIndex).forEach((msg) => {
//       if (
//         !isPinnedMessage(msg) &&
//         !isInSuperChatModal(msg) &&
//         !isNightbotMessage(msg) &&
//         !isStreamlabsMessage(msg)
//       ) {
//         const prevCheckbox = msg
//           .closest(".chat-message-container")
//           ?.querySelector(".message-checkbox");
//         if (prevCheckbox && !prevCheckbox.checked) {
//           prevCheckbox.checked = true;
//           styleMessage(msg, "line-through");
//         }
//       }
//     });

//     styleMessage(currentMessage, "line-through");
//   } else {
//     messages.slice(currentIndex).forEach((msg) => {
//       if (
//         !isPinnedMessage(msg) &&
//         !isInSuperChatModal(msg) &&
//         !isNightbotMessage(msg) &&
//         !isStreamlabsMessage(msg)
//       ) {
//         const checkbox = msg
//           .closest(".chat-message-container")
//           ?.querySelector(".message-checkbox");
//         if (checkbox && checkbox.checked) {
//           checkbox.checked = false;
//           styleMessage(msg, "none");
//         }
//       }
//     });

//     styleMessage(currentMessage, "none");
//   }

//   saveCheckboxState();
// }

// // Function to save checkbox state
// function saveCheckboxState() {
//   const checkboxes = document.querySelectorAll(".message-checkbox");
//   checkboxes.forEach((checkbox) => {
//     localStorage.setItem(checkbox.id, checkbox.checked);
//   });
// }

// // Function to set up MutationObserver for monitoring changes
// function setupMutationObserver() {
//   const chatContainer = document.querySelector(
//     "yt-live-chat-item-list-renderer"
//   );
//   if (!chatContainer) return;

//   const observer = new MutationObserver(() => {
//     addCheckboxToMessages();
//     removeSpecificElements();
//   });

//   observer.observe(chatContainer, { childList: true, subtree: true });
// }

// // Function to observe changes in the live chat container
// function observeChatContainerChanges() {
//   const liveChatContainer = document.querySelector("yt-live-chat-app");
//   if (!liveChatContainer) return;

//   const chatObserver = new MutationObserver(() => {
//     const chatContainer = document.querySelector(
//       "yt-live-chat-item-list-renderer"
//     );
//     if (chatContainer) {
//       setupMutationObserver();
//     }
//   });

//   chatObserver.observe(liveChatContainer, { childList: true, subtree: true });
// }

// // Function to remove specific elements initially and during chat updates
// function removeSpecificElements() {
//   const elements = document.querySelectorAll(
//     "tp-yt-paper-button#show-more, tp-yt-paper-button#show-less, yt-live-chat-legacy-paid-message-renderer"
//   );
//   elements.forEach((element) => {
//     element.style.display = "none";
//   });

//   const dropdownMenus = document.querySelectorAll("tp-yt-iron-dropdown");
//   dropdownMenus.forEach((menu) => {
//     menu.style.display = "none";
//   });
// }

// // Function to add the "Uncheck All" button
// function addUncheckAllButton() {
//   const existingButton = document.querySelector("#uncheck-all-button");
//   if (existingButton) return;

//   const button = document.createElement("button");
//   button.id = "uncheck-all-button";
//   button.textContent = "Uncheck All";
//   button.style.position = "fixed";
//   button.style.top = "0.5%";
//   button.style.right = "10px";
//   button.style.padding = "10px 20px";
//   button.style.backgroundColor = "#007bff";
//   button.style.color = "white";
//   button.style.border = "none";
//   button.style.borderRadius = "5px";
//   button.style.cursor = "pointer";
//   button.style.zIndex = "1000";

//   button.addEventListener("click", () => {
//     document.querySelectorAll(".message-checkbox").forEach((checkbox) => {
//       if (!checkbox.disabled) {
//         // Only uncheck checkboxes that are not disabled
//         checkbox.checked = false;
//         const message = document
//           .getElementById(checkbox.id)
//           ?.closest(".chat-message-container")
//           ?.querySelector(
//             "yt-live-chat-text-message-renderer, yt-live-chat-paid-message-renderer, yt-live-chat-member-message-renderer"
//           );
//         if (message) {
//           styleMessage(message, "none");
//         }
//       }
//     });
//     saveCheckboxState();
//   });

//   document.body.appendChild(button);
// }

// // Function to initialize voice recognition
// function initializeVoiceRecognition() {
//   if (!("webkitSpeechRecognition" in window)) {
//     console.log("Speech recognition not supported.");
//     return;
//   }

//   const recognition = new webkitSpeechRecognition();
//   recognition.lang = "en-US"; // Set the language to English
//   recognition.interimResults = false;
//   recognition.maxAlternatives = 1;

//   recognition.onresult = function (event) {
//     const transcript = event.results[0][0].transcript;
//     handleVoiceCommand(transcript);
//   };

//   recognition.onerror = function (event) {
//     console.error("Speech recognition error:", event.error);
//   };

//   recognition.onend = function () {
//     console.log("Speech recognition ended.");
//     // Restart recognition after ending
//     recognition.start();
//   };

//   recognition.start();
// }

// // List of common stop words (you can add more to this list)
// const stopWords = [
//   "the",
//   "is",
//   "in",
//   "and",
//   "of",
//   "to",
//   "a",
//   "it",
//   "on",
//   "with",
//   "as",
//   "for",
// ];

// // Function to normalize punctuation, tokenize and remove stop words
// function tokenizeAndRemoveStopWords(text) {
//   return text
//     .toLowerCase()
//     .replace(/[!?.]/g, ".") // Normalize exclamation marks, full stops, and question marks to a common symbol (.)
//     .replace(/[^\w\s.]/gi, "") // Remove other punctuation
//     .split(" ") // Tokenize by splitting on space
//     .filter((word) => word && !stopWords.includes(word)); // Filter out stop words
// }

// // Cosine Similarity function
// function cosineSimilarity(vec1, vec2) {
//   const dotProduct = vec1.reduce(
//     (sum, val, index) => sum + val * vec2[index],
//     0
//   );
//   const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
//   const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
//   return dotProduct / (magnitude1 * magnitude2);
// }

// // Create word vector for cosine similarity
// function createWordVector(words, allWords) {
//   return allWords.map((word) => (words.includes(word) ? 1 : 0));
// }

// // Function to calculate similarity using Cosine Similarity
// function getSimilarityCosine(s1, s2) {
//   const words1 = tokenizeAndRemoveStopWords(s1);
//   const words2 = tokenizeAndRemoveStopWords(s2);

//   const allWords = Array.from(new Set([...words1, ...words2])); // Unique words in both texts

//   const vector1 = createWordVector(words1, allWords);
//   const vector2 = createWordVector(words2, allWords);

//   return cosineSimilarity(vector1, vector2);
// }

// function handleVoiceCommand(transcript) {
//   console.log("Voice command received:", transcript);

//   const messages = Array.from(
//     document.querySelectorAll(
//       "yt-live-chat-text-message-renderer, yt-live-chat-paid-message-renderer, yt-live-chat-member-message-renderer"
//     )
//   );

//   let targetMessageFound = false; // Flag to indicate if the target message has been found

//   messages.forEach((message, index) => {
//     const messageText = message.querySelector("#message")?.textContent.trim();

//     if (!targetMessageFound && messageText) {
//       // Check if the similarity is 80% or higher using Cosine similarity
//       const similarity = getSimilarityCosine(transcript, messageText);
//       if (similarity >= 0.8) {
//         const checkbox = message
//           .closest(".chat-message-container")
//           ?.querySelector(".message-checkbox");
//         if (checkbox) {
//           checkbox.checked = true;
//           styleMessage(message, "line-through");
//           saveCheckboxState();
//           targetMessageFound = true; // Mark the target message as found
//           checkPreviousMessages(messages.slice(0, index)); // Check all previous messages up to the matched message
//         }
//       }
//     }
//   });
// }

// // Function to check all previous messages up to the matched message
// function checkPreviousMessages(previousMessages) {
//   previousMessages.forEach((message) => {
//     const checkbox = message
//       .closest(".chat-message-container")
//       ?.querySelector(".message-checkbox");
//     if (checkbox && !checkbox.checked) {
//       checkbox.checked = true;
//       styleMessage(message, "line-through");
//     }
//   });
//   saveCheckboxState();
// }

// // Function to initialize everything
// function initialize() {
//   addCheckboxToMessages();
//   observeChatContainerChanges();
//   addUncheckAllButton(); // Add the button initially
//   initializeVoiceRecognition(); // Initialize voice recognition
// }

// // Run the initialization
// initialize();
