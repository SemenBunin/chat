let ws;
let user = '';

if ('Notification' in window) {
  Notification.requestPermission();
}

function start() {
  user = document.getElementById('name').value;
  document.getElementById('login').classList.add('hidden');
  document.getElementById('chat').classList.remove('hidden');

  ws = new WebSocket(`ws://${location.host}`);

  ws.onmessage = e => {
    const msg = JSON.parse(e.data);
    if (msg.type === 'history') msg.data.forEach(show);
    if (msg.type === 'message') {
      show(msg.data);
      if (document.hidden) notify(msg.data);
    }
  };
}

function send() {
  const text = document.getElementById('text').value;
  const file = document.getElementById('file').files[0];

  if (file) {
    const fd = new FormData();
    fd.append('file', file);

    fetch('/upload', { method: 'POST', body: fd })
      .then(r => r.json())
      .then(r => ws.send(JSON.stringify({ user, file: r.file })));

    document.getElementById('file').value = '';
  } else {
    ws.send(JSON.stringify({ user, text }));
  }

  document.getElementById('text').value = '';
}

function show(m) {
  const d = document.createElement('div');
  d.className = 'msg';
  d.innerHTML = `<b class="name">${m.user}</b>: ${m.text || ''}
    ${m.file ? `<a href="${m.file}" target="_blank">📎 файл</a>` : ''}`;
  messages.appendChild(d);
}

function notify(m) {
  if (Notification.permission === 'granted') {
    new Notification(m.user, {
      body: m.text || 'Файл'
    });
  }
}
