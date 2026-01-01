const ws = new WebSocket((location.protocol==='https:'?'wss://':'ws://')+location.host);
const messages = document.getElementById('messages');
const form = document.getElementById('form');
const text = document.getElementById('text');
const avatarUpload = document.getElementById('avatarUpload');
const avatarPreview = document.getElementById('avatarPreview');
const fileUpload = document.getElementById('fileUpload');

const userId = localStorage.getItem('userId');
const userName = localStorage.getItem('userName');
avatarPreview.src = localStorage.getItem('avatar')||'';

// Генерация ключа для чата (AES-256)
let chatKey = localStorage.getItem('chatKey');
if(!chatKey){
    chatKey = CryptoJS.lib.WordArray.random(32).toString();
    localStorage.setItem('chatKey', chatKey);
}

// Шифрование
function encrypt(msg){
    return CryptoJS.AES.encrypt(msg, chatKey).toString();
}

// Дешифрование
function decrypt(enc){
    return CryptoJS.AES.decrypt(enc, chatKey).toString(CryptoJS.enc.Utf8);
}

function addMessage(user, text, avatar, me){
    const div = document.createElement('div');
    div.className = 'msg'+(me?' me':'');
    div.innerHTML = `${avatar?`<img src="${avatar}" class="avatar">`:''}<div class="content"><div class="user">${user}</div>${text}</div>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}

ws.onopen = ()=>{
    ws.send(JSON.stringify({type:'identify', userId}));
};

ws.onmessage = e=>{
    const msg = JSON.parse(e.data);
    if(msg.encrypted){
        addMessage(msg.user, decrypt(msg.encrypted), msg.avatar, msg.senderId===userId);
    }
};

avatarUpload.addEventListener('change', async e=>{
    const file = e.target.files[0];
    if(!file) return;
    const data = new FormData();
    data.append('avatar',file);
    const res = await fetch('/avatar',{method:'POST', body:data});
    const json = await res.json();
    avatarPreview.src=json.url;
    localStorage.setItem('avatar',json.url);
});

fileUpload.addEventListener('change', async e=>{
    const file = e.target.files[0];
    if(!file) return;
    const data = new FormData();
    data.append('file',file);
    const res = await fetch('/upload',{method:'POST',body:data});
    const json = await res.json();
    text.value = `[Файл: <a href="${json.url}" target="_blank">${json.name}</a>]`;
});

form.addEventListener('submit', e=>{
    e.preventDefault();
    const t = text.value.trim();
    if(!t) return;
    const enc = encrypt(t);
    ws.send(JSON.stringify({chatId:'default', senderId:userId, user:userName, encrypted:enc, avatar:avatarPreview.src, recipients:[userId]}));
    text.value='';
});
