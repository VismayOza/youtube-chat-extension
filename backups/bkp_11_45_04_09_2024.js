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

// Function to add a checkbox before each chat message
function addCheckboxToMessages() {
  const messages = document.querySelectorAll(
    "yt-live-chat-text-message-renderer, yt-live-chat-paid-message-renderer, yt-live-chat-member-message-renderer"
  );

  messages.forEach((message) => {
    const messageId =
      message.getAttribute("id") ||
      message.getAttribute("data-message-id") ||
      message.textContent.trim();
    const uniqueId = `checkbox-${messageId}`;

    if (!message.closest(".chat-message-container")) {
      const containerDiv = document.createElement("div");
      containerDiv.className = "chat-message-container";
      containerDiv.style.display = "flex";

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

      containerDiv.appendChild(checkbox);
      message.parentNode.insertBefore(containerDiv, message);
      containerDiv.appendChild(label);
      containerDiv.appendChild(message);

      // Load saved state and apply necessary styles
      const savedState = localStorage.getItem(uniqueId);
      if (savedState !== null) {
        checkbox.checked = savedState === "true";
        applyStylesOnLoad(checkbox, message); // Apply styles based on loaded state
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

// Function to style special messages like Super Chat and Member Messages
// function styleSpecialMessage(message) {
//   if (!message) return; // Ensure message is not null

//   message.style.border = "2px solid gold";
//   message.style.padding = "5px";
//   message.style.borderRadius = "8px";
//   message.style.backgroundColor = "rgba(255, 215, 0, 0.2)";

//   const username = message.querySelector("#author-name");
//   if (username) {
//     username.style.fontWeight = "bold";
//     username.style.color = "orange";
//   }
// }

function styleSpecialMessage(message) {
  if (!message) return; // Ensure message is not null

  message.style.border = "2px solid gold";
  message.style.padding = "5px";
  message.style.borderRadius = "8px";
  message.style.backgroundColor = "rgba(255, 215, 0, 0.2)";

  const username = message.querySelector("#author-name");
  if (username) {
    username.style.fontWeight = "bold";
    username.style.color = "orange";
  }

  // Create and append the money image
  const moneyImg = document.createElement("img");
  moneyImg.src = chrome.runtime.getURL("./images/1603780019212.jpeg"); // Replace with your image URL or path
  moneyImg.alt = "Money Image";
  moneyImg.style.width = "100px"; // Adjust size as needed
  moneyImg.style.height = "auto";
  moneyImg.style.marginTop = "10px";

  // Check if an image already exists to avoid duplicates
  const existingImg = message.querySelector(".money-img");
  if (!existingImg) {
    moneyImg.className = "money-img";
    message.appendChild(moneyImg);
  }
}

// Function to apply styles when loading from storage
function applyStylesOnLoad(checkbox, message) {
  if (!message) return; // Ensure message is not null

  const textDecoration = checkbox.checked ? "line-through" : "none";
  styleMessage(message, textDecoration);
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

  if (!currentMessage) return; // Ensure currentMessage is not null

  const currentIndex = messages.indexOf(currentMessage);

  if (currentCheckbox.checked) {
    hideReportFeedbackOptions();

    // Check previous messages
    messages.slice(0, currentIndex).forEach((msg) => {
      if (!isPinnedMessage(msg)) {
        const prevCheckbox = msg
          .closest(".chat-message-container")
          ?.querySelector(".message-checkbox");
        if (prevCheckbox && !prevCheckbox.checked) {
          prevCheckbox.checked = true;
          styleMessage(msg, "line-through");
        }
      }
    });

    // Style the current message
    styleMessage(currentMessage, "line-through");
    showUserFeedback("Message processed and styled.");
  } else {
    hideReportFeedbackOptions();

    // Uncheck and unstyle subsequent messages
    messages.slice(currentIndex + 1).forEach((msg) => {
      if (!isPinnedMessage(msg)) {
        const nextCheckbox = msg
          .closest(".chat-message-container")
          ?.querySelector(".message-checkbox");
        if (nextCheckbox && nextCheckbox.checked) {
          nextCheckbox.checked = false;
          styleMessage(msg, "none");
        }
      }
    });

    // Unstyle the current message
    styleMessage(currentMessage, "none");
    showUserFeedback("Message unchecked and styling removed.");
  }

  // Save checkbox state
  saveCheckboxState();
}

// Function to style a message
function styleMessage(message, textDecoration) {
  if (!message) return; // Ensure message is not null

  message.style.textDecoration = textDecoration;
  message.style.color = textDecoration === "line-through" ? "gray" : "";
  message.style.opacity = textDecoration === "line-through" ? "0.7" : "";
  message.style.textDecorationThickness = "2px";

  const userName = message.querySelector("#author-name");
  if (userName) {
    userName.style.textDecoration = textDecoration;
    userName.style.color = textDecoration === "line-through" ? "gray" : "";
    userName.style.textDecorationThickness = "2px";
  }

  const images = message.querySelectorAll("img");
  images.forEach((img) => {
    if (textDecoration === "line-through") {
      img.style.position = "relative";
      const line = document.createElement("div");
      line.style.position = "absolute";
      line.style.top = "50%";
      line.style.left = "0";
      line.style.width = "100%";
      line.style.height = "2px";
      line.style.backgroundColor = "gray";
      line.style.transform = "translateY(-50%)";
      img.parentElement.style.position = "relative";
      img.parentElement.appendChild(line);
    } else {
      const lines = img.parentElement.querySelectorAll("div");
      lines.forEach((line) => line.remove());
      img.style.position = "";
    }
  });
}

// Function to hide report and feedback options
function hideReportFeedbackOptions() {
  hideElementByTag("tp-yt-iron-dropdown");
  hideElementByTag(".report-menu");
  hideElementByTag(".block-menu");
}

// Function to hide elements by tag or class name
function hideElementByTag(tagName) {
  const elements = document.querySelectorAll(tagName);
  elements.forEach((element) => {
    if (element.id !== "dropdown") {
      element.style.display = "none";
    }
  });
}

// Function to display user feedback
function showUserFeedback(message) {
  const feedbackDiv = document.createElement("div");
  feedbackDiv.textContent = message;
  feedbackDiv.style.position = "fixed";
  feedbackDiv.style.bottom = "10px";
  feedbackDiv.style.right = "10px";
  feedbackDiv.style.padding = "5px 10px";
  feedbackDiv.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  feedbackDiv.style.color = "white";
  feedbackDiv.style.borderRadius = "5px";
  feedbackDiv.style.zIndex = "1000";
  document.body.appendChild(feedbackDiv);

  setTimeout(() => {
    feedbackDiv.remove();
  }, 3000); // Removes feedback after 3 seconds
}

// Function to persist checkbox state
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

// Function to remove specific elements initially and during mutation
function removeSpecificElements() {
  hideElementByTag("tp-yt-iron-dropdown");
  hideElementByTag(".report-menu");
  hideElementByTag(".block-menu");

  const chatMenuElements = document.querySelectorAll(
    "yt-live-chat-text-message-renderer #menu"
  );
  chatMenuElements.forEach((element) => {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  });
}

// Adding keyboard navigation support
document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp" || event.key === "ArrowDown") {
    const checkboxes = Array.from(
      document.querySelectorAll(".message-checkbox")
    );
    const focusedCheckbox = document.activeElement;
    const currentIndex = checkboxes.indexOf(focusedCheckbox);

    if (currentIndex !== -1) {
      const nextIndex =
        event.key === "ArrowUp" ? currentIndex - 1 : currentIndex + 1;
      if (checkboxes[nextIndex]) {
        checkboxes[nextIndex].focus();
      }
      event.preventDefault();
    }
  }
});

// Initial setup
observeChatContainerChanges();
addCheckboxToMessages();
removeSpecificElements();
