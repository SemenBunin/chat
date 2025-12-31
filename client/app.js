const ws = new WebSocket(
  (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host
);

const messages = document.getElementById('messages');
const form = document.getElementById('form');
const messageInput = document.getElementById('message');
const usernameInput = document.getElementById('username');

usernameInput.value = localStorage.getItem('username') || '';

function addMessage(user, text, me = false) {
  const div = document.createElement('div');
  div.className = 'msg' + (me ? ' me' : '');
  div.innerHTML = `<div class="user">${user}</div>${text}`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

ws.onmessage = e => {
  const msg = JSON.parse(e.data);
  addMessage(msg.user, msg.text, msg.user === usernameInput.value);
};

form.onsubmit = e => {
  e.preventDefault();
  const user = usernameInput.value.trim();
  const text = messageInput.value.trim();
  if (!user || !text) return;

  localStorage.setItem('username', user);

  ws.send(JSON.stringify({ user, text }));
  messageInput.value = '';
};
