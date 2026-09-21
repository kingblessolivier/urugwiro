/**
 * PropBot AI Chatbot Widget
 * Communicates with POST /chatbot/chat/ (Django async view -> Claude API)
 * Config injected by base.html via window.PROPBOT_CONFIG
 */
(function () {
    'use strict';

    var CFG              = window.PROPBOT_CONFIG || {};
    var CHAT_URL         = CFG.chatUrl         || '/chatbot/chat/';
    var HISTORY_URL      = CFG.historyUrl      || '/chatbot/history/';
    var HISTORY_BASE_URL = CFG.historyDetailUrl || '/chatbot/history/';
    var CSRF_TOKEN       = CFG.csrfToken       || '';
    var USER_INIT        = CFG.userInitial     || '?';
    var BOT_INIT         = 'P'; // PropBot

    var fab          = document.getElementById('ai-chatbot-fab');
    var win          = document.getElementById('ai-chatbot-window');
    var msgs         = document.getElementById('aiChatMessages');
    var input        = document.getElementById('aiChatInput');
    var sendBtn      = document.getElementById('aiChatSendBtn');
    var clearBtn     = document.getElementById('aiChatClearBtn');
    var historyBtn   = document.getElementById('aiHistoryBtn');
    var historyPanel = document.getElementById('aiHistoryPanel');
    var historyList  = document.getElementById('aiHistoryList');
    var historyBack  = document.getElementById('aiHistoryBackBtn');
    var newChatBtn   = document.getElementById('aiNewChatBtn');
    var welcome      = document.getElementById('aiChatWelcome');

    if (!fab || !win) return;

    var isOpen          = false;
    var isBusy          = false;
    var msgCount        = 0;
    var currentConvId   = null;  // active conversation ID
    var historyVisible  = false;

    /* ── Draggable FAB ────────────────────────────────────────── */
    var dragging = false;
    var dragMoved = false;
    var dragStartX, dragStartY, fabStartX, fabStartY;

    function getFabPos() {
        var r = fab.getBoundingClientRect();
        return { x: r.left, y: r.top };
    }

    function applyFabPos(x, y) {
        // clamp inside viewport
        x = Math.max(0, Math.min(window.innerWidth  - fab.offsetWidth,  x));
        y = Math.max(0, Math.min(window.innerHeight - fab.offsetHeight, y));
        fab.style.right  = 'auto';
        fab.style.bottom = 'auto';
        fab.style.left   = x + 'px';
        fab.style.top    = y + 'px';
        positionWindow(x, y);
        try { localStorage.setItem('propbot_fab_pos', JSON.stringify({x:x,y:y})); } catch(e){}
    }

    function positionWindow(fabX, fabY) {
        if(!win) return;
        var ww = window.innerWidth, wh = window.innerHeight;
        var winW = win.offsetWidth  || 380;
        var winH = win.offsetHeight || 520;
        var gap  = 12;
        // try above first
        var wx = Math.max(gap, Math.min(ww - winW - gap, fabX - winW + fab.offsetWidth));
        var wy = fabY - winH - gap;
        if(wy < gap){ wy = fabY + fab.offsetHeight + gap; } // place below if no space above
        if(wy + winH > wh - gap){ wy = wh - winH - gap; }
        win.style.right  = 'auto';
        win.style.bottom = 'auto';
        win.style.left   = wx + 'px';
        win.style.top    = wy + 'px';
    }

    // Restore saved position
    try {
        var saved = JSON.parse(localStorage.getItem('propbot_fab_pos') || 'null');
        if(saved){ applyFabPos(saved.x, saved.y); }
    } catch(e){}

    fab.addEventListener('mousedown', function(e) {
        if(e.button !== 0) return;
        dragging  = true;
        dragMoved = false;
        var pos   = getFabPos();
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        fabStartX  = pos.x;
        fabStartY  = pos.y;
        fab.style.transition = 'none';
        e.preventDefault();
    });

    document.addEventListener('mousemove', function(e) {
        if(!dragging) return;
        var dx = e.clientX - dragStartX;
        var dy = e.clientY - dragStartY;
        if(Math.abs(dx) > 4 || Math.abs(dy) > 4) dragMoved = true;
        if(dragMoved) applyFabPos(fabStartX + dx, fabStartY + dy);
    });

    document.addEventListener('mouseup', function() {
        if(!dragging) return;
        dragging = false;
        fab.style.transition = '';
    });

    // Touch support
    fab.addEventListener('touchstart', function(e) {
        var t = e.touches[0];
        dragging  = true;
        dragMoved = false;
        var pos   = getFabPos();
        dragStartX = t.clientX;
        dragStartY = t.clientY;
        fabStartX  = pos.x;
        fabStartY  = pos.y;
        fab.style.transition = 'none';
    }, {passive:true});

    document.addEventListener('touchmove', function(e) {
        if(!dragging) return;
        var t  = e.touches[0];
        var dx = t.clientX - dragStartX;
        var dy = t.clientY - dragStartY;
        if(Math.abs(dx) > 4 || Math.abs(dy) > 4) dragMoved = true;
        if(dragMoved){ applyFabPos(fabStartX + dx, fabStartY + dy); e.preventDefault(); }
    }, {passive:false});

    document.addEventListener('touchend', function() {
        dragging = false;
        fab.style.transition = '';
    });

    /* ── Toggle open/close ────────────────────────────────────── */
    fab.addEventListener('click', function () {
        if(dragMoved) return; // ignore click after drag
        isOpen = !isOpen;
        fab.classList.toggle('open', isOpen);
        win.classList.toggle('hidden', !isOpen);
        if(isOpen){
            var pos = getFabPos();
            positionWindow(pos.x, pos.y);
            if(input) setTimeout(function(){ input.focus(); }, 200);
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && isOpen) {
            if (historyVisible) {
                hideHistory();
            } else {
                isOpen = false;
                fab.classList.remove('open');
                win.classList.add('hidden');
            }
        }
    });

    /* ── Auto-resize textarea ─────────────────────────────────── */
    if (input) {
        input.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 100) + 'px';
        });
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!isBusy) sendMessage();
            }
        });
    }

    if (sendBtn)  sendBtn.addEventListener('click',  function () { if (!isBusy) sendMessage(); });
    if (clearBtn) clearBtn.addEventListener('click', function () { clearConversation(); });

    /* ── History panel controls ───────────────────────────────── */
    if (historyBtn) historyBtn.addEventListener('click', function () { showHistory(); });
    if (historyBack) historyBack.addEventListener('click', function () { hideHistory(); });
    if (newChatBtn)  newChatBtn.addEventListener('click',  function () { startNewChat(); });

    function showHistory() {
        historyVisible = true;
        if (historyPanel) historyPanel.classList.remove('hidden');
        loadHistoryList();
    }

    function hideHistory() {
        historyVisible = false;
        if (historyPanel) historyPanel.classList.add('hidden');
    }

    function startNewChat() {
        hideHistory();
        // Clear session on server
        fetch(CHAT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': CSRF_TOKEN },
            body: JSON.stringify({ clear: true })
        }).catch(function () {});
        // Reset UI
        msgs.querySelectorAll('.ai-msg-row, .ai-prop-wrap').forEach(function (el) { el.remove(); });
        msgs.querySelectorAll('div[style]').forEach(function (el) {
            // Remove property card wraps injected by appendPropertyCards
            if (el.style.flexDirection === 'column' && el.style.gap) el.remove();
        });
        if (welcome) welcome.style.display = '';
        msgCount = 0;
        currentConvId = null;
        if (input) { input.value = ''; input.style.height = 'auto'; input.focus(); }
    }

    function loadHistoryList() {
        if (!historyList) return;
        historyList.innerHTML = '<p class="ai-history-empty">Loading...</p>';
        fetch(HISTORY_URL)
            .then(function (r) { return r.json(); })
            .then(function (data) {
                var convs = data.conversations || [];
                if (convs.length === 0) {
                    historyList.innerHTML = '<p class="ai-history-empty">No previous conversations yet.</p>';
                    return;
                }
                historyList.innerHTML = '';
                convs.forEach(function (c) {
                    var item = document.createElement('div');
                    item.className = 'ai-history-item' + (c.id === currentConvId ? ' active' : '');
                    item.innerHTML =
                        '<div class="ai-history-item-title">' + escapeHtml(c.title) + '</div>' +
                        '<div class="ai-history-item-meta">' +
                            '<span>' + c.date + ' ' + c.time + '</span>' +
                            '<span>' + c.message_count + ' msg' + (c.message_count !== 1 ? 's' : '') + '</span>' +
                        '</div>';
                    item.addEventListener('click', function () { loadConversation(c.id, c.title); });
                    historyList.appendChild(item);
                });
            })
            .catch(function () {
                historyList.innerHTML = '<p class="ai-history-empty">Could not load history.</p>';
            });
    }

    function loadConversation(convId, title) {
        hideHistory();
        fetch(HISTORY_BASE_URL + convId + '/')
            .then(function (r) { return r.json(); })
            .then(function (data) {
                if (data.error) { appendMessage('bot', 'Could not load conversation.'); return; }
                // Clear current chat
                msgs.querySelectorAll('.ai-msg-row').forEach(function (el) { el.remove(); });
                // Remove property card wraps
                Array.from(msgs.children).forEach(function (el) {
                    if (el !== welcome) el.remove();
                });
                if (welcome) welcome.style.display = 'none';
                msgCount = 0;
                currentConvId = convId;
                // Restore session on server so Claude has context
                // (we set conversation_id on next message)
                var serverHistory = [];
                (data.messages || []).forEach(function (m) {
                    appendMessage(m.role, m.content);
                    serverHistory.push({ role: m.role === 'bot' ? 'bot' : 'user', content: m.content });
                    msgCount++;
                });
            })
            .catch(function () {
                appendMessage('bot', 'Failed to load conversation.');
            });
    }

    /* ── Send message ─────────────────────────────────────────── */
    function sendMessage() {
        var text = input ? input.value.trim() : '';
        if (!text) return;

        if (welcome && msgCount === 0) welcome.style.display = 'none';

        appendMessage('user', text);
        input.value = '';
        input.style.height = 'auto';
        msgCount++;

        var typingEl = appendTyping();
        setLoading(true);

        var body = { message: text };
        if (currentConvId) body.conversation_id = currentConvId;

        fetch(CHAT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': CSRF_TOKEN },
            body: JSON.stringify(body)
        })
        .then(function (r) {
            if (!r.ok) {
                return r.text().then(function (b) {
                    throw new Error('HTTP ' + r.status + ': ' + b.substring(0, 200));
                });
            }
            return r.json();
        })
        .then(function (data) {
            removeTyping(typingEl);
            setLoading(false);
            appendMessage('bot', data.error ? ('Error: ' + data.error) : (data.reply || '...'));
            if (!data.error) {
                msgCount++;
                if (data.conversation_id) currentConvId = data.conversation_id;
                var propCount = (data.properties && data.properties.length) || 0;
                if (propCount > 0) {
                    try { appendPropertyCards(data.properties); }
                    catch (e) { console.error('PropBot card render error:', e); }
                }
            }
        })
        .catch(function (err) {
            removeTyping(typingEl);
            setLoading(false);
            appendMessage('bot', 'Error: ' + err.message);
            console.error('PropBot:', err);
        });
    }

    /* ── Clear conversation ───────────────────────────────────── */
    function clearConversation() {
        fetch(CHAT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': CSRF_TOKEN },
            body: JSON.stringify({ clear: true })
        })
        .then(function (r) { return r.json(); })
        .then(function () {
            msgs.querySelectorAll('.ai-msg-row').forEach(function (r) { r.remove(); });
            Array.from(msgs.children).forEach(function (el) {
                if (el !== welcome) el.remove();
            });
            if (welcome) welcome.style.display = '';
            msgCount = 0;
            currentConvId = null;
        })
        .catch(function (err) { console.error('PropBot clear error:', err.message); });
    }

    /* ── DOM helpers ──────────────────────────────────────────── */
    function appendMessage(role, text) {
        var row    = document.createElement('div');
        row.className = 'ai-msg-row ' + role;

        var avatar = document.createElement('div');
        avatar.className = 'ai-msg-avatar';
        avatar.textContent = role === 'user' ? USER_INIT : BOT_INIT;

        var bubble = document.createElement('div');
        bubble.className = 'ai-msg-bubble';
        bubble.textContent = text;

        if (role === 'user') { row.appendChild(bubble); row.appendChild(avatar); }
        else                 { row.appendChild(avatar); row.appendChild(bubble); }

        msgs.appendChild(row);
        msgs.scrollTop = msgs.scrollHeight;
        return row;
    }

    function appendTyping() {
        var row    = document.createElement('div');
        row.className = 'ai-msg-row bot';

        var avatar = document.createElement('div');
        avatar.className = 'ai-msg-avatar';
        avatar.textContent = BOT_INIT;

        var bubble = document.createElement('div');
        bubble.className = 'ai-msg-bubble ai-typing-indicator';
        bubble.innerHTML = '<div class="ai-typing-dot"></div><div class="ai-typing-dot"></div><div class="ai-typing-dot"></div>';

        row.appendChild(avatar);
        row.appendChild(bubble);
        msgs.appendChild(row);
        msgs.scrollTop = msgs.scrollHeight;
        return row;
    }

    function appendPropertyCards(properties) {
        var wrap = document.createElement('div');
        wrap.style.cssText = 'width:100%;display:flex;flex-direction:column;gap:10px;margin:6px 0;';

        properties.forEach(function (p) {
            var card = document.createElement('div');
            card.style.cssText = 'background:#fff;border:1px solid #ddd;border-radius:14px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1);font-family:Inter,sans-serif;';

            var imgBox = document.createElement('div');
            imgBox.style.cssText = 'width:100%;height:130px;background:#e8e8e8;overflow:hidden;position:relative;';
            if (p.image) {
                var img = document.createElement('img');
                img.src = p.image; img.alt = p.name;
                img.style.cssText = 'width:100%;height:130px;object-fit:cover;display:block;';
                img.onerror = function () { imgBox.style.background = '#ddd'; imgBox.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:130px;font-size:13px;color:#888;">No image</div>'; };
                imgBox.appendChild(img);
            } else {
                imgBox.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:130px;font-size:13px;color:#888;">No image</div>';
            }

            var badgeColor = p.listing_type === 'rent' ? '#e8f5e9;color:#2e7d32' : '#e3f2fd;color:#1565c0';
            var badgeLabel = p.listing_type === 'rent' ? 'For Rent' : 'For Sale';

            var body = document.createElement('div');
            body.style.cssText = 'padding:10px 12px;';
            body.innerHTML =
                '<span style="background:' + badgeColor + ';font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;text-transform:uppercase;letter-spacing:.5px;">' + badgeLabel + '</span>' +
                '<p style="margin:5px 0 2px;font-weight:600;font-size:.88rem;color:#1a1a1a;">' + escapeHtml(p.name || '') + '</p>' +
                '<p style="margin:0 0 4px;font-size:.75rem;color:#666;">&#128205; ' + escapeHtml(p.address || '') + '</p>' +
                '<p style="margin:0 0 6px;font-weight:700;font-size:.95rem;color:#2e7d32;">' + escapeHtml(p.price_label || '') + '</p>' +
                '<p style="margin:0 0 8px;font-size:.73rem;color:#555;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">' + escapeHtml(p.description || '') + '</p>' +
                '<a href="' + (p.url || '#') + '" style="display:block;text-align:center;padding:8px;background:#2e7d32;color:#fff;border-radius:8px;font-size:.8rem;font-weight:500;text-decoration:none;">View Listings &#8594;</a>';

            card.appendChild(imgBox);
            card.appendChild(body);
            wrap.appendChild(card);
        });

        msgs.appendChild(wrap);
        msgs.scrollTop = msgs.scrollHeight;
    }

    function removeTyping(el) {
        if (el && el.parentNode) el.parentNode.removeChild(el);
    }

    function setLoading(busy) {
        isBusy = busy;
        if (sendBtn) sendBtn.disabled = busy;
        if (input)   input.disabled   = busy;
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

}());
