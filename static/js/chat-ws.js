/**
 * Urugwiro Real-Time Chat — WebSocket Client
 * Works with ChatConsumer on the backend.
 *
 * Usage:
 *   const urugwiroChat = new UrugwiroChat({
 *     userId: 5,
 *     contactId: 12,
 *     userAvatar: 'J',
 *     contactAvatar: 'A',
 *     messagesEl: document.getElementById('chatMessages'),
 *     inputEl: document.getElementById('chatInput'),
 *     sendBtn: document.getElementById('chatSendBtn'),
 *     statusEl: document.getElementById('wsStatus'),
 *     typingEl: document.getElementById('typingIndicator'),
 *     emptyEl: document.getElementById('emptyState'),
 *   });
 */

class UrugwiroChat {
    constructor(opts) {
        this.uid = opts.userId;
        this.cid = opts.contactId;
        this.uAvatar = opts.userAvatar;
        this.cAvatar = opts.contactAvatar;
        this.messagesEl = opts.messagesEl;
        this.inputEl = opts.inputEl;
        this.sendBtn = opts.sendBtn;
        this.statusEl = opts.statusEl;
        this.typingEl = opts.typingEl;
        this.emptyEl = opts.emptyEl;
        this.contactStatusEl = opts.contactStatusEl || null;

        // Room id: sorted pair
        const lo = Math.min(this.uid, this.cid);
        const hi = Math.max(this.uid, this.cid);
        this.roomId = `${lo}_${hi}`;

        this.socket = null;
        this.reconnectDelay = 1000;
        this.maxReconnect = 30000;
        this.typingTimeout = null;
        this.wasTyping = false;
        this.historyLoaded = false;

        this._bindUI();
        this._connect();
    }

    /* ── WebSocket lifecycle ─────────────────────────────── */

    _connect() {
        const proto = location.protocol === 'https:' ? 'wss' : 'ws';
        const url = `${proto}://${location.host}/ws/chat/${this.roomId}/`;
        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
            this.reconnectDelay = 1000;
            this._setStatus('online');
            // Mark existing messages as read
            this._send({ action: 'mark_read' });
        };

        this.socket.onmessage = (e) => {
            const data = JSON.parse(e.data);
            this._handleMessage(data);
        };

        this.socket.onclose = () => {
            this._setStatus('offline');
            setTimeout(() => {
                this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnect);
                this._connect();
            }, this.reconnectDelay);
        };

        this.socket.onerror = () => this.socket.close();
    }

    _send(data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        }
    }

    /* ── Handle incoming events ──────────────────────────── */

    _handleMessage(data) {
        switch (data.type) {
            case 'history':
                this._renderHistory(data.messages);
                break;
            case 'message':
                this._appendBubble(data);
                // Mark as read if it's from the other person
                if (data.sender_id !== this.uid) {
                    this._send({ action: 'mark_read' });
                }
                break;
            case 'typing':
                this._showTyping(data.is_typing, data.sender_name);
                break;
            case 'read_receipt':
                this._markAllRead();
                break;
            case 'deleted':
                this._removeBubble(data.message_id);
                break;
            case 'status':
                this._setContactStatus(data.status);
                break;
        }
    }

    /* ── Render history from WS ──────────────────────────── */

    _renderHistory(messages) {
        if (this.historyLoaded) return;
        this.historyLoaded = true;

        // Clear the server-rendered messages & empty state
        this.messagesEl.innerHTML = '';

        if (!messages || messages.length === 0) {
            if (this.emptyEl) {
                this.emptyEl.style.display = 'flex';
                this.messagesEl.appendChild(this.emptyEl);
            }
            return;
        }

        if (this.emptyEl) this.emptyEl.style.display = 'none';
        messages.forEach(m => this._appendBubble(m, false));
        this._scrollBottom();
    }

    /* ── Create and append a message bubble ──────────────── */

    _appendBubble(data, scroll = true) {
        // Remove empty state if present
        if (this.emptyEl) this.emptyEl.style.display = 'none';
        // Hide typing indicator
        if (this.typingEl) this.typingEl.style.display = 'none';

        const isMine = data.sender_id === this.uid;
        const msgId = data.message_id || data.id;

        // Check if message already exists (avoid duplicates)
        if (document.getElementById(`msg-${msgId}`)) return;

        const row = document.createElement('div');
        row.id = `msg-${msgId}`;
        row.className = `bubble-row ${isMine ? 'mine' : 'theirs'}`;
        row.style.animation = scroll ? 'bubbleIn .3s ease both' : 'none';

        const avatar = document.createElement('div');
        avatar.className = 'bubble-avatar';
        avatar.textContent = isMine ? this.uAvatar : this.cAvatar;
        avatar.style.cssText = isMine
            ? 'background:linear-gradient(135deg,var(--md-sys-color-primary),var(--md-sys-color-tertiary));color:#fff'
            : 'background:linear-gradient(135deg,var(--md-sys-color-secondary),var(--md-sys-color-tertiary));color:#fff';

        const body = document.createElement('div');

        const bubble = document.createElement('div');
        bubble.className = `bubble ${isMine ? 'mine' : 'theirs'}`;

        // Text content (escaped)
        const textNode = document.createElement('span');
        textNode.textContent = data.message;
        bubble.appendChild(textNode);

        // Delete button for own messages
        if (isMine) {
            const delBtn = document.createElement('button');
            delBtn.className = 'delete-btn';
            delBtn.title = 'Delete';
            delBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size:14px">delete</span>';
            delBtn.style.marginLeft = '6px';
            delBtn.onclick = () => this._deleteMessage(msgId);
            bubble.appendChild(delBtn);
        }

        body.appendChild(bubble);

        const time = document.createElement('div');
        time.className = 'bubble-time';
        const displayTime = data.full_timestamp || data.timestamp || '';
        time.textContent = displayTime;
        if (isMine) {
            const readTag = document.createElement('span');
            readTag.className = 'read-tag';
            readTag.textContent = data.is_read ? ' · Read' : ' · Sent';
            time.appendChild(readTag);
        }
        body.appendChild(time);

        row.appendChild(avatar);
        row.appendChild(body);

        this.messagesEl.appendChild(row);
        if (scroll) this._scrollBottom();
    }

    /* ── Delete a message via WS ─────────────────────────── */

    _deleteMessage(msgId) {
        if (!confirm('Delete this message?')) return;
        this._send({ action: 'delete', message_id: msgId });
    }

    _removeBubble(msgId) {
        const el = document.getElementById(`msg-${msgId}`);
        if (el) {
            el.style.animation = 'bubbleOut .25s ease both';
            setTimeout(() => el.remove(), 260);
        }
    }

    /* ── Typing indicator ────────────────────────────────── */

    _onInputChange() {
        if (!this.wasTyping) {
            this.wasTyping = true;
            this._send({ action: 'typing', is_typing: true });
        }
        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
            this.wasTyping = false;
            this._send({ action: 'typing', is_typing: false });
        }, 2000);
    }

    _showTyping(isTyping, name) {
        if (!this.typingEl) return;
        if (isTyping) {
            this.typingEl.style.display = 'flex';
            this.typingEl.querySelector('.typing-name').textContent = name;
            this._scrollBottom();
        } else {
            this.typingEl.style.display = 'none';
        }
    }

    /* ── Read receipts ───────────────────────────────────── */

    _markAllRead() {
        document.querySelectorAll('.read-tag').forEach(el => {
            el.textContent = ' · Read';
        });
    }

    /* ── Status indicators ───────────────────────────────── */

    _setStatus(status) {
        if (!this.statusEl) return;
        this.statusEl.className = `ws-status ${status === 'online' ? 'ws-online' : 'ws-offline'}`;
        this.statusEl.innerHTML = status === 'online'
            ? '<span class="material-symbols-outlined" style="font-size:12px;vertical-align:middle">wifi</span> Connected'
            : '<span class="material-symbols-outlined" style="font-size:12px;vertical-align:middle">wifi_off</span> Reconnecting…';
    }

    _setContactStatus(status) {
        if (!this.contactStatusEl) return;
        if (status === 'online') {
            this.contactStatusEl.textContent = 'Online';
            this.contactStatusEl.style.color = '#2E7D32';
        } else {
            this.contactStatusEl.textContent = '';
        }
    }

    /* ── UI binding ──────────────────────────────────────── */

    _bindUI() {
        // Send on button click
        this.sendBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this._sendMessage();
        });

        // Send on Enter (Shift+Enter for newline)
        this.inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this._sendMessage();
            }
        });

        // Typing indicator
        this.inputEl.addEventListener('input', () => this._onInputChange());
    }

    _sendMessage() {
        const text = this.inputEl.value.trim();
        if (!text) return;
        this._send({ action: 'send', message: text });
        this.inputEl.value = '';
        this.inputEl.focus();
        // Stop typing
        this.wasTyping = false;
        clearTimeout(this.typingTimeout);
    }

    /* ── Helpers ─────────────────────────────────────────── */

    _scrollBottom() {
        requestAnimationFrame(() => {
            this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
        });
    }
}
