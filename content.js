function isPinnedMessage(message) {
  if (message && message.hasAttribute("in-banner")) {
    return true;
  }
  return false;
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
          msg.style.color = "#444"; // Make the text darker
          msg.style.opacity = "0.7"; // Make the message slightly transparent
          msg.style.backgroundColor = "#747070"; // Set a light background color to make it stand out
          const userName = msg.querySelector("#author-name");
          if (userName) {
            userName.style.textDecoration = "line-through"; // Cross out the username
          }
          hideReportFeedbackOptions(msg); // Hide options for previous messages
        }
      }
    });
    currentMessage.style.textDecoration = "line-through"; // Cross out the current message
    currentMessage.style.color = "#444"; // Make the text darker
    currentMessage.style.opacity = "0.7"; // Make the message slightly transparent
    currentMessage.style.backgroundColor = "#747070"; // Set a light background color to make it stand out
    const userName = currentMessage.querySelector("#author-name");
    if (userName) {
      userName.style.textDecoration = "line-through"; // Cross out the current username
    }
  } else {
    hideReportFeedbackOptions();

    // Uncheck all messages below the current message and remove cross-out
    messages.forEach((msg, i) => {
      if (i > currentIndex && !isPinnedMessage(msg)) {
        const nextCheckbox = msg.querySelector(".message-checkbox");
        if (nextCheckbox && nextCheckbox.checked) {
          nextCheckbox.checked = false;
          msg.style.textDecoration = "none"; // Remove cross-out from the message
          msg.style.color = ""; // Restore the text color
          msg.style.opacity = ""; // Restore the opacity
          msg.style.backgroundColor = ""; // Restore the background color
          const userName = msg.querySelector("#author-name");
          if (userName) {
            userName.style.textDecoration = "none"; // Remove cross-out from the username
          }
        }
      }
    });
    currentMessage.style.textDecoration = "none"; // Remove cross-out from the current message
    currentMessage.style.color = ""; // Restore the text color
    currentMessage.style.opacity = ""; // Restore the opacity
    currentMessage.style.backgroundColor = ""; // Restore the background color
    const userName = currentMessage.querySelector("#author-name");
    if (userName) {
      userName.style.textDecoration = "none"; // Remove cross-out from the current username
    }
  }
}

// Function to hide report and feedback options for a specific message
function hideReportFeedbackOptions() {
  hideElementByTag("tp-yt-iron-dropdown");
}

function hideElementByTag(tagName) {
  const elements = document.getElementsByTagName(tagName); // Get all elements by the tag name

  // Loop through each element and hide it
  for (let i = 0; i < elements.length; i++) {
    elements[i].style.display = "none";
  }
}

// Function to set up MutationObserver
function setupMutationObserver() {
  const chatContainer = document.querySelector(
    "yt-live-chat-item-list-renderer"
  );
  if (!chatContainer) return; // Ensure the chat container exists

  const observer = new MutationObserver(() => {
    addCheckboxToMessages();
  });

  observer.observe(chatContainer, { childList: true, subtree: true });
}

// Initial setup
setupMutationObserver();

// Initial call to add checkboxes to already loaded messages
addCheckboxToMessages();
