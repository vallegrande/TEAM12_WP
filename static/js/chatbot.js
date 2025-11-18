document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("chatbot-toggle");
  const close = document.getElementById("chatbot-close");
  const chatbot = document.getElementById("chatbot");
  const send = document.getElementById("chatbot-send");
  const input = document.getElementById("chatbot-input");
  const messages = document.getElementById("chatbot-messages");

  // State and constants
  const STORAGE_KEY = 'pochi_chat_history_v1';

  // Helpers
  function formatTime(d) {
    const h = d.getHours().toString().padStart(2,'0');
    const m = d.getMinutes().toString().padStart(2,'0');
    return `${h}:${m}`;
  }

  function createMessageNode(sender, text, time){
    const wrap = document.createElement('div');
    wrap.className = 'chat-message ' + (sender === 'user' ? 'message-user' : 'message-bot');
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.innerHTML = text.replace(/\n/g, '<br>');
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = time || formatTime(new Date());
    wrap.appendChild(bubble);
    wrap.appendChild(meta);
    return wrap;
  }

  // Persistencia simple en localStorage
  function loadHistory(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    }catch(e){ return []; }
  }
  function saveHistory(list){
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }catch(e){}
  }

  function renderHistory(){
    messages.innerHTML = '';
    const hist = loadHistory();
    hist.forEach(entry => {
      const node = createMessageNode(entry.sender, entry.text, entry.time);
      messages.appendChild(node);
    });
    messages.scrollTop = messages.scrollHeight;
  }

  // Typing indicator
  function showTyping(){
    let tip = messages.querySelector('.typing-indicator');
    if(tip) return tip;
    tip = document.createElement('div');
    tip.className = 'typing-indicator message-bot';
    tip.innerHTML = '<div class="dots"><span></span><span></span><span></span></div>';
    messages.appendChild(tip);
    messages.scrollTop = messages.scrollHeight;
    return tip;
  }
  function hideTyping(){
    const tip = messages.querySelector('.typing-indicator');
    if(tip) tip.remove();
  }

  // Bot logic (simple rules + fallback)
  function getBotReply(text){
    if (!text) return "¿En qué puedo ayudarte?";
    if (text.includes('hola')) return '¡Hola! 😊 ¿Buscas carne de res, cerdo o pollo?';
    if (text.includes('res')) return 'La carne de res es ideal para asados o guisos. Tenemos cortes como lomo y bistec 🥩.';
    if (text.includes('pollo')) return 'Tenemos muslo, pechuga y alitas frescas 🐔.';
    if (text.includes('cerdo')) return 'Deliciosas chuletas, costillas y más 🐷.';
    if (text.includes('horario') || text.includes('hora') || text.includes('atención')) return '⏰ Nuestros horarios: L-V 8:00-18:00, S 8:00-15:00. Domingos cerrado.';
    if (text.includes('whatsapp') || text.includes('pedido') || text.includes('pedidos')) return '📲 Puedes pedir por WhatsApp: +51 913608946. Envíanos tu lista y te confirmamos.';
    if (text.includes('gracias')) return '¡Con gusto! 🐮 Si necesitas algo más, aquí estoy.';
    // Fallback: sugerir opciones
    return 'Lo siento, no entendí muy bien. Puedes escribir "horario", "pedido" o el tipo de carne (res/cerdo/pollo).';
  }

  // Add message and persist
  function addMessage(sender, text){
    const time = formatTime(new Date());
    const node = createMessageNode(sender, text, time);
    messages.appendChild(node);
    messages.scrollTop = messages.scrollHeight;
    // persist
    const hist = loadHistory();
    hist.push({ sender, text, time });
    saveHistory(hist);
  }

  // Clear unread badge
  function clearBadge(){
    toggle.classList.remove('has-unread');
  }

  // Initialize UI & history
  renderHistory();

  // Toggle open/close
  toggle.addEventListener('click', () => {
    chatbot.classList.toggle('hidden');
    if(!chatbot.classList.contains('hidden')){
      clearBadge();
    }
  });

  close.addEventListener('click', () => {
    chatbot.classList.add('hidden');
  });

  // Send on click; Enter sends, Shift+Enter newline
  send.addEventListener('click', () => handleSend(false));
  input.addEventListener('keydown', (e) => {
    if(e.key === 'Enter' && !e.shiftKey){
      e.preventDefault();
      handleSend(false);
    }
  });

  function handleSend(isQuick){
    const text = input.value.trim();
    if(!text) return;
    addMessage('user', text);
    input.value = '';

    // Simulate typing and reply
    const typing = showTyping();
    const reply = getBotReply(text.toLowerCase());
    // delay proportional to message length
    const delay = Math.min(1400 + reply.length * 20, 3200);
    setTimeout(() => {
      hideTyping();
      addMessage('bot', reply);
      // if chat is closed, mark unread
      if(chatbot.classList.contains('hidden')){
        toggle.classList.add('has-unread');
      }
    }, delay);
  }

  // Small utility to clear history (not exposed in UI by default)
  window.pochiChat = {
    clearHistory: () => { localStorage.removeItem(STORAGE_KEY); renderHistory(); }
  };

});
