function isPinnedMessage(message) {
  if (message && message.hasAttribute("in-banner")) {
    return true;
  }

  return false;
}

// Function to add checkbox before each chat message
function addCheckboxToMessages() {
  // Select all chat messages
  const messages = document.querySelectorAll(
    "yt-live-chat-text-message-renderer"
  );

  messages.forEach((message) => {
    // Skip pinned messages
    if (isPinnedMessage(message)) return;

    // Check if the message already has a checkbox
    if (message.querySelector(".message-checkbox")) return;

    // Create a new checkbox element
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "message-checkbox";
    checkbox.style.marginRight = "8px"; // Adjust spacing as needed

    // Find the user's name element
    const userImageElement = message.querySelector("#author-photo");
    if (userImageElement) {
      // Insert the checkbox before the user's name
      userImageElement.parentNode.insertBefore(checkbox, userImageElement);

      // Add an event listener to toggle the crossed-out style
      checkbox.addEventListener("change", (e) => {
        e.preventDefault();
        handleCheckboxChange(e.target);
      });
    }
  });
}

// Function to handle checkbox change
function handleCheckboxChange(currentCheckbox) {
  const messages = Array.from(
    document.querySelectorAll("yt-live-chat-text-message-renderer")
  );
  const currentMessage = currentCheckbox.closest(
    "yt-live-chat-text-message-renderer"
  );
  const currentIndex = messages.indexOf(currentMessage);

  // Update styles based on checkbox state
  if (currentCheckbox.checked) {
    // Hide report and feedback options
    hideReportFeedbackOptions();

    // Check all previous messages and cross them out
    messages.forEach((msg, i) => {
      if (i < currentIndex && !isPinnedMessage(msg)) {
        const prevCheckbox = msg.querySelector(".message-checkbox");
        if (prevCheckbox && !prevCheckbox.checked) {
          prevCheckbox.checked = true;
          msg.style.textDecoration = "line-through"; // Cross out the message
          const userName = msg.querySelector("#author-name");
          if (userName) {
            userName.style.textDecoration = "line-through"; // Cross out the username
          }
        }
      }
    });
    currentMessage.style.textDecoration = "line-through"; // Cross out the current message
    const userName = currentMessage.querySelector("#author-name");
    if (userName) {
      userName.style.textDecoration = "line-through"; // Cross out the current username
    }
  } else {
    // Only uncheck the current message and remove cross-out
    currentMessage.style.textDecoration = "none"; // Remove cross-out from the current message
    const userName = currentMessage.querySelector("#author-name");
    if (userName) {
      userName.style.textDecoration = "none"; // Remove cross-out from the current username
    }
  }
}

// Function to hide report and feedback options
function hideReportFeedbackOptions() {
  // Select and hide the "Report" and "Feedback" options
  const reportFeedbackButtons = document.querySelectorAll(
    "yt-live-chat-message-action-menu-renderer"
  );
  reportFeedbackButtons.forEach((button) => {
    button.style.display = "none";
  });
}

// Function to set up MutationObserver
function setupMutationObserver() {
  const chatContainer = document.querySelector("yt-live-chat-frame");
  const observer = new MutationObserver(() => {
    addCheckboxToMessages();
  });

  if (chatContainer) {
    observer.observe(chatContainer, { childList: true, subtree: true });
  }
}

// Initial setup
setupMutationObserver();

// Initial call to add checkboxes to already loaded messages
addCheckboxToMessages();
