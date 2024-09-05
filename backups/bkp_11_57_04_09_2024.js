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
  
  // Function to style a message based on textDecoration (line-through or none)
  function styleMessage(message, textDecoration) {
    if (!message) return;
  
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
    moneyImg.style.width = "100px";
    moneyImg.style.height = "auto";
    moneyImg.style.marginTop = "10px";
  
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
  
  // Function to add a checkbox before each chat message
  function addCheckboxToMessages() {
    const messages = document.querySelectorAll(
      "yt-live-chat-text-message-renderer, yt-live-chat-paid-message-renderer, yt-live-chat-member-message-renderer"
    );
  
    messages.forEach((message) => {
      // Skip pinned messages and messages inside the tp-yt-paper-dialog
      if (isPinnedMessage(message) || message.closest("tp-yt-paper-dialog"))
        return;
  
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
  
    if (currentCheckbox.checked) {
      messages.slice(0, currentIndex).forEach((msg) => {
        if (!isPinnedMessage(msg) && !isInSuperChatModal(msg)) {
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
      // Uncheck and unstyle all messages after the current one
      messages.slice(currentIndex).forEach((msg) => {
        if (!isPinnedMessage(msg) && !isInSuperChatModal(msg)) {
          const checkbox = msg
            .closest(".chat-message-container")
            ?.querySelector(".message-checkbox");
          if (checkbox && checkbox.checked) {
            checkbox.checked = false;
            styleMessage(msg, "none");
          }
        }
      });
  
      // Unstyle the current message
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
  
  // Initialize the script
  observeChatContainerChanges();
  removeSpecificElements();
  setupMutationObserver();
  addCheckboxToMessages();
  