// Function to add checkbox before each chat message
function addCheckboxToMessages() {
    // Select all chat messages
    const messages = document.querySelectorAll('yt-live-chat-text-message-renderer');
  
    messages.forEach(message => {
      // Check if the message already has a checkbox
      if (message.querySelector('.message-checkbox')) return;
  
      // Create a new checkbox element
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'message-checkbox';
      checkbox.style.marginRight = '8px'; // Adjust spacing as needed
  
      // Find the user's name element
      const userNameElement = message.querySelector('#author-name');
      if (userNameElement) {
        // Insert the checkbox before the user's name
        userNameElement.parentNode.insertBefore(checkbox, userNameElement);
        
        // Add an event listener to toggle line above the message
        checkbox.addEventListener('change', (e) => {
          if (e.target.checked) {
            message.style.borderTop = '2px solid red'; // Line above message
          } else {
            message.style.borderTop = 'none'; // Remove line above message
          }
        });
      }
    });
  }
  
  // Function to set up MutationObserver
  function setupMutationObserver() {
    // Observe changes in the chat container to handle new messages
    const chatContainer = document.querySelector('yt-live-chat-frame');
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
  