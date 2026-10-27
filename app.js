let notes = [
    {
        id: 1,
        date: "Сегодня, 14:30",
        dateISO: new Date().toISOString().split('T')[0],
        title: "Хороший день",
        emoji: "😁",
        text: "Сегодня закончил проект, погулял в парке и встретил старого друга...",
        tags: ["работа", "друзья"],
        fullText: "Сегодня был отличный день! Закончил большой проект на работе, потом погулял в парке и случайно встретил старого друга. Посидели в кофейне, вспомнили старое.",
        image: null
    },
    {
        id: 2,
        date: "Вчера, 09:15",
        dateISO: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        title: "Утро понедельника",
        emoji: "😊",
        text: "Не выспался, но кофе спас ситуацию. Планов на день много...",
        tags: ["работа"],
        fullText: "Не выспался, но кофе спас ситуацию. Планов на день много, надеюсь всё успеть.",
        image: null
    }
];

let currentNoteId = null;
let selectedEmoji = "😁";
let currentFilter = "all";
let dateFilter = null;
let formTags = [];
let formImage = null;
let currentDate = new Date();

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    
    const nav = document.getElementById('main-nav');
    const fab = document.querySelector('.fab');
    
    if(['screen-list', 'screen-calendar', 'screen-search', 'screen-profile'].includes(screenId)) {
        nav.style.display = 'flex';
        if(fab) fab.style.display = (screenId === 'screen-list') ? 'flex' : 'none';
    } else {
        nav.style.display = 'none';
        if(fab) fab.style.display = 'none';
    }

    if(screenId === 'screen-profile') {
        document.getElementById('profile-count').innerText = notes.length;
    }
    if(screenId === 'screen-calendar') {
        renderCalendar();
    }
}

function switchTab(screenId, element) {
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    if(element) element.classList.add('active');
    showScreen(screenId);
}

function setFilter(emoji, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = emoji;
    dateFilter = null;
    renderNotes();
}

function renderNotes() {
    const container = document.getElementById('notes-container');
    const searchQuery = document.getElementById('search-input').value.toLowerCase();
    container.innerHTML = '';
    
    const filtered = notes.filter(n => {
        const matchEmoji = currentFilter === 'all' || n.emoji === currentFilter;
        const matchSearch = n.title.toLowerCase().includes(searchQuery) || n.fullText.toLowerCase().includes(searchQuery) || n.tags.some(t => t.toLowerCase().includes(searchQuery));
        const matchDate = !dateFilter || n.dateISO === dateFilter;
        return matchEmoji && matchSearch && matchDate;
    });

    document.getElementById('list-date').innerText = dateFilter ? `Записи за ${dateFilter}` : "Все записи";
    if(filtered.length === 0) document.getElementById('list-date').innerText = "Записей не найдено";

    filtered.forEach(note => {
        const card = document.createElement('div');
        card.className = 'note-card';
        card.onclick = () => openNote(note.id);
        
        card.innerHTML = `
            <div class="note-time">${note.date}</div>
            <div class="note-title">${note.title}</div>
            <div class="note-preview-text">${note.text}</div>
            <div class="tags-container">${note.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
            <div class="note-emoji">${note.emoji}</div>
        `;
        container.appendChild(card);
    });
}

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
    document.getElementById('calendar-month-year').innerText = `${monthNames[month]} ${year}`;
    
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';
    
    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    days.forEach(d => {
        const el = document.createElement('div');
        el.className = 'calendar-day-name';
        el.innerText = d;
        grid.appendChild(el);
    });

    let firstDay = new Date(year, month, 1).getDay();
    if (firstDay === 0) firstDay = 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 1; i < firstDay; i++) {
        const el = document.createElement('div');
        el.className = 'calendar-day empty';
        grid.appendChild(el);
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const el = document.createElement('div');
        el.className = 'calendar-day';
        el.innerText = i;
        
        const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const hasNote = notes.some(n => n.dateISO === dStr);
        
        if (hasNote) {
            el.classList.add('has-note');
            el.onclick = () => {
                dateFilter = dStr;
                currentFilter = "all";
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                document.querySelector('.filter-btn').classList.add('active');
                renderNotes();
                switchTab('screen-list', document.querySelectorAll('.nav-item')[0]);
            };
        }
        grid.appendChild(el);
    }
}

function changeMonth(offset) {
    currentDate.setMonth(currentDate.getMonth() + offset);
    renderCalendar();
}

function openNewNote() {
    currentNoteId = null;
    formTags = [];
    formImage = null;
    selectedEmoji = "😁";
    
    document.getElementById('form-title').innerText = "Новая запись";
    document.getElementById('input-title').value = '';
    document.getElementById('input-text').value = '';
    document.getElementById('form-photo').style.display = 'none';
    document.getElementById('form-photo').innerHTML = '';
    
    document.querySelectorAll('.emoji-btn').forEach((b, i) => {
        if(i === 0) b.classList.add('selected');
        else b.classList.remove('selected');
    });
    
    renderFormTags();
    showScreen('screen-new');
}

function selectEmoji(btn) {
    document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedEmoji = btn.innerText;
}

function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            formImage = e.target.result;
            const preview = document.getElementById('form-photo');
            preview.style.display = 'flex';
            preview.innerHTML = `<img src="${formImage}" alt="Фото">`;
        }
        reader.readAsDataURL(file);
    }
}

function addTag() {
    const tag = prompt("Введите тег (без #):");
    if(tag && tag.trim() !== '') {
        formTags.push(tag.trim());
        renderFormTags();
    }
}

function removeTag(index) {
    formTags.splice(index, 1);
    renderFormTags();
}

function renderFormTags() {
    const container = document.getElementById('form-tags-container');
    container.innerHTML = '';
    formTags.forEach((tag, i) => {
        const span = document.createElement('span');
        span.className = 'tag';
        span.innerHTML = `# ${tag} <button onclick="removeTag(${i})">×</button>`;
        container.appendChild(span);
    });
    
    const btn = document.createElement('button');
    btn.className = 'add-tag-btn';
    btn.innerText = '+';
    btn.onclick = addTag;
    container.appendChild(btn);
}

function saveNote() {
    const title = document.getElementById('input-title').value || 'Без названия';
    const text = document.getElementById('input-text').value || 'Пустая запись...';
    
    const todayISO = new Date().toISOString().split('T')[0];
    
    if(currentNoteId) {
        const note = notes.find(n => n.id === currentNoteId);
        note.title = title;
        note.fullText = text;
        note.text = text.substring(0, 50) + (text.length > 50 ? '...' : '');
        note.emoji = selectedEmoji;
        note.tags = [...formTags];
        note.image = formImage;
    } else {
        const now = new Date();
        const timeStr = `Сегодня, ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        notes.unshift({
            id: Date.now(),
            date: timeStr,
            dateISO: todayISO,
            title: title,
            emoji: selectedEmoji
