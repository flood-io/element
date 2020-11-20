const WatirSpec = function() {
    
  return {
    addMessage: function(string) {
        const text = document.createTextNode(string);
        const message = document.createElement('div');
        const messages = document.getElementById('messages');

        message.appendChild(text);
        messages.appendChild(message);
    }
  };
  
    
}(); // WatirSpec

