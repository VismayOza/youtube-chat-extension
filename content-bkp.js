// Function to check if a message is pinned
function isPinnedMessage(message) {
    return message && message.hasAttribute("in-banner");
  }
  
  // Function to add a checkbox before each chat message
  function addCheckboxToMessages() {
    const messages = document.querySelectorAll(
      "yt-live-chat-text-message-renderer"
    );
  
    messages.forEach((message) => {
      if (isPinnedMessage(message)) return;
  
      if (!message.closest(".chat-message-container")) {
        const containerDiv = document.createElement("div");
        containerDiv.className = "chat-message-container";
        containerDiv.style.display = "flex";
  
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "message-checkbox";
        checkbox.style.marginRight = "8px";
  
        containerDiv.appendChild(checkbox);
        message.parentNode.insertBefore(containerDiv, message);
        containerDiv.appendChild(message);
  
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
    const currentMessage = currentCheckbox
      .closest(".chat-message-container")
      .querySelector("yt-live-chat-text-message-renderer");
    const currentIndex = messages.indexOf(currentMessage);
  
    if (currentCheckbox.checked) {
      hideReportFeedbackOptions();
  
      messages.forEach((msg, i) => {
        if (i < currentIndex && !isPinnedMessage(msg)) {
          const prevCheckbox = msg
            .closest(".chat-message-container")
            .querySelector(".message-checkbox");
          if (prevCheckbox && !prevCheckbox.checked) {
            prevCheckbox.checked = true;
            styleMessage(msg, "line-through");
            hideReportFeedbackOptions();
          }
        }
      });
      styleMessage(currentMessage, "line-through");
    } else {
      hideReportFeedbackOptions();
  
      messages.forEach((msg, i) => {
        if (i > currentIndex && !isPinnedMessage(msg)) {
          const nextCheckbox = msg
            .closest(".chat-message-container")
            .querySelector(".message-checkbox");
          if (nextCheckbox && nextCheckbox.checked) {
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
  
  // Initial setup
  observeChatContainerChanges();
  addCheckboxToMessages();
  removeSpecificElements();