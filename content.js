// Function to check if a message is pinned
function isPinnedMessage(message) {
  return message && message.hasAttribute("in-banner");
}

// Function to add a checkbox before each chat message
function addCheckboxToMessages() {
  // Select all chat messages
  const messages = document.querySelectorAll(
    "yt-live-chat-text-message-renderer"
  );

  messages.forEach((message) => {
    // Skip pinned messages
    if (isPinnedMessage(message)) return;

    // Check if the message already has a checkbox
    if (message.closest(".chat-message-container")) return;

    // Create a new container div for checkbox and message
    const containerDiv = document.createElement("div");
    containerDiv.className = "chat-message-container"; // You can define a class for further CSS customization
    containerDiv.style.display = "flex"; // Maintain a flex layout to align checkbox and message

    // Create a new checkbox element
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "message-checkbox";
    checkbox.style.marginRight = "8px"; // Adjust spacing as needed

    // Insert the checkbox and the message into the new container div
    message.parentNode.insertBefore(containerDiv, message); // Insert the container before the message
    containerDiv.appendChild(checkbox); // Add checkbox to the container
    containerDiv.appendChild(message); // Add the original message to the container

    // Add an event listener to toggle the crossed-out style
    checkbox.addEventListener("change", (e) => {
      e.preventDefault();
      handleCheckboxChange(e.target);
    });
  });
}

// Function to handle checkbox change
function handleCheckboxChange(currentCheckbox) {
  const messages = Array.from(
    document.querySelectorAll("yt-live-chat-text-message-renderer")
  );
  const currentMessage = currentCheckbox.nextElementSibling; // Changed to next sibling
  const currentIndex = messages.indexOf(currentMessage);

  if (currentCheckbox.checked) {
    // Hide report and feedback options
    hideReportFeedbackOptions();

    // Check all previous messages and cross them out
    messages.forEach((msg, i) => {
      if (i < currentIndex && !isPinnedMessage(msg)) {
        const prevCheckbox = msg.previousElementSibling; // Get the checkbox before the message
        if (prevCheckbox && prevCheckbox.checked === false) {
          prevCheckbox.checked = true;
          styleMessage(msg, "line-through");
          hideReportFeedbackOptions(msg); // Hide options for previous messages
        }
      }
    });
    styleMessage(currentMessage, "line-through");
  } else {
    hideReportFeedbackOptions();

    // Uncheck all messages below the current message and remove cross-out
    messages.forEach((msg, i) => {
      if (i > currentIndex && !isPinnedMessage(msg)) {
        const nextCheckbox = msg.previousElementSibling; // Get the checkbox before the message
        if (nextCheckbox && nextCheckbox.checked === true) {
          nextCheckbox.checked = false;
          styleMessage(msg, "none");
        }
      }
    });
    styleMessage(currentMessage, "none");
  }
}

// Function to style a message
function styleMessage(message, textDecoration) {
  message.style.textDecoration = textDecoration; // Set text decoration
  message.style.color = textDecoration === "line-through" ? "#444" : ""; // Set text color
  message.style.opacity = textDecoration === "line-through" ? "0.7" : ""; // Set opacity
  message.style.backgroundColor =
    textDecoration === "line-through" ? "#747070" : ""; // Set background color
  const userName = message.querySelector("#author-name");
  if (userName) {
    userName.style.textDecoration = textDecoration; // Set text decoration for username
  }
}

// Function to hide report and feedback options
function hideReportFeedbackOptions() {
  hideElementByTag("tp-yt-iron-dropdown");
  hideElementByTag(".report-menu");
  hideElementByTag(".block-menu");
}

// Function to hide elements by tag or class name
function hideElementByTag(tagName) {
  const elements = document.querySelectorAll(tagName); // Get all elements by the tag or class name

  elements.forEach((element) => {
    if (element.id !== "dropdown") {
      element.style.display = "none";
    }
  });
}

// Function to set up MutationObserver
function setupMutationObserver() {
  const chatContainer = document.querySelector(
    "yt-live-chat-item-list-renderer"
  );
  if (!chatContainer) return; // Ensure the chat container exists

  const observer = new MutationObserver(() => {
    addCheckboxToMessages();
    removeSpecificElements();
  });

  observer.observe(chatContainer, { childList: true, subtree: true });
}

// Function to handle chat container changes
function observeChatContainerChanges() {
  const liveChatContainer = document.querySelector("yt-live-chat-app");
  if (!liveChatContainer) return;

  const chatObserver = new MutationObserver(() => {
    const chatContainer = document.querySelector(
      "yt-live-chat-item-list-renderer"
    );
    if (chatContainer) {
      setupMutationObserver(); // Set up observer for chat container
    }
  });

  chatObserver.observe(liveChatContainer, { childList: true, subtree: true });
}

// Function to remove specific elements initially and during mutation
function removeSpecificElements() {
  hideElementByTag("tp-yt-iron-dropdown");
  hideElementByTag(".report-menu");
  hideElementByTag(".block-menu");

  // Remove #menu elements inside yt-live-chat-text-message-renderer
  const chatMenuElements = document.querySelectorAll(
    "yt-live-chat-text-message-renderer #menu"
  );
  chatMenuElements.forEach((element) => {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  });
}

// Initial setup
observeChatContainerChanges();
addCheckboxToMessages(); // Initial call to add checkboxes to already loaded messages
removeSpecificElements(); // Remove specific elements on initial load
