// Умный Переводчик - Основная логика приложения
console.log('🚀 Умный Переводчик загружен!');

// Определение мобильного устройства
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
if (isMobile) {
    console.log('📱 Мобильное устройство обнаружено');
    document.body.classList.add('mobile');
}

// Основные элементы DOM
const elements = {
    sourceText: document.getElementById('sourceText'),
    translatedText: document.getElementById('translatedText'),
    translateBtn: document.getElementById('translateBtn'),
    clearBtn: document.getElementById('clearBtn'),
    copyBtn: document.getElementById('copyBtn'),
    speakBtn: document.getElementById('speakBtn'),
    swapBtn: document.getElementById('swapBtn'),
    themeBtn: document.getElementById('themeBtn'),
    languageSelect: document.getElementById('languageSelect'),
    status: document.getElementById('status'),
    languageBadge: document.getElementById('languageBadge'),
    charCount: document.getElementById('charCount')
};

// Проверка наличия всех элементов
let allElementsLoaded = true;
for (const [key, element] of Object.entries(elements)) {
    if (!element) {
        console.error(`❌ Элемент ${key} не найден`);
        allElementsLoaded = false;
    }
}

if (!allElementsLoaded) {
    console.error('⚠️ Не все элементы DOM загружены правильно');
}

// Инициализация приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded!');
    initializeApp();
});

function initializeApp() {
    // Установка начального состояния
    updateCharCount();
    updateLanguageBadge();
    
    // Обработчики событий
    setupEventListeners();
    
    // Восстановление темы из localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        enableDarkTheme();
    }
    
    // Отключение Service Worker чтобы убрать ошибки
    disableServiceWorker();
}

function disableServiceWorker() {
    if ('serviceWorker' in navigator) {
        // Отмена регистрации всех Service Workers
        navigator.serviceWorker.getRegistrations().then(registrations => {
            registrations.forEach(registration => {
                console.log('Unregistering Service Worker:', registration.scope);
                registration.unregister();
            });
        });
        
        // Очистка кэша
        caches.keys().then(cacheNames => {
            cacheNames.forEach(cacheName => {
                caches.delete(cacheName);
            });
        });
        
        console.log('✅ Service Worker отключен');
    }
}

function setupEventListeners() {
    // Обработчик ввода текста
    elements.sourceText.addEventListener('input', function() {
        updateCharCount();
        autoResizeTextarea(this);
    });
    
    // Кнопка перевода
    elements.translateBtn.addEventListener('click', handleTranslation);
    
    // Enter для перевода
    elements.sourceText.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            handleTranslation();
        }
    });
    
    // Очистка
    elements.clearBtn.addEventListener('click', function() {
        elements.sourceText.value = '';
        elements.translatedText.textContent = '';
        updateCharCount();
        updateStatus('✅ Текст очищен', 'success');
    });
    
    // Копирование
    elements.copyBtn.addEventListener('click', function() {
        const textToCopy = elements.translatedText.textContent;
        if (textToCopy && textToCopy !== '') {
            navigator.clipboard.writeText(textToCopy).then(() => {
                updateStatus('📋 Перевод скопирован в буфер', 'success');
                showTempMessage(this, '✅ Скопировано!');
            }).catch(err => {
                console.error('Ошибка копирования:', err);
                updateStatus('❌ Ошибка копирования', 'error');
            });
        } else {
            updateStatus('❌ Нечего копировать', 'error');
        }
    });
    
    // Озвучивание
    elements.speakBtn.addEventListener('click', function() {
        const textToSpeak = elements.translatedText.textContent;
        if (textToSpeak && textToSpeak !== '' && 'speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            utterance.lang = elements.languageSelect.value === 'en-ru' ? 'ru-RU' : 'en-US';
            utterance.rate = 0.8;
            speechSynthesis.speak(utterance);
            updateStatus('🔊 Озвучивание...', 'info');
        } else {
            updateStatus('❌ Текст для озвучивания отсутствует', 'error');
        }
    });
    
    // Смена языка
    elements.swapBtn.addEventListener('click', function() {
        const currentLang = elements.languageSelect.value;
        if (currentLang === 'en-ru') {
            elements.languageSelect.value = 'ru-en';
        } else if (currentLang === 'ru-en') {
            elements.languageSelect.value = 'en-ru';
        }
        updateLanguageBadge();
        updateStatus('🔄 Направление перевода изменено', 'info');
    });
    
    // Выбор языка
    elements.languageSelect.addEventListener('change', function() {
        updateLanguageBadge();
        updateStatus('🌍 Язык перевода изменен', 'info');
    });
    
    // Смена темы
    elements.themeBtn.addEventListener('click', toggleTheme);
}

function updateCharCount() {
    const count = elements.sourceText.value.length;
    elements.charCount.textContent = count;
    
    // Изменение цвета при приближении к лимиту
    if (count > 800) {
        elements.charCount.style.color = '#ff6b6b';
    } else if (count > 500) {
        elements.charCount.style.color = '#feca57';
    } else {
        elements.charCount.style.color = '#999';
    }
}

function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
}

function updateLanguageBadge() {
    const langMap = {
        'auto': 'Авто',
        'en-ru': 'EN→RU', 
        'ru-en': 'RU→EN'
    };
    elements.languageBadge.textContent = langMap[elements.languageSelect.value] || 'Авто';
}

async function handleTranslation() {
    const text = elements.sourceText.value.trim();
    
    if (!text) {
        updateStatus('❌ Введите текст для перевода', 'error');
        return;
    }
    
    if (text.length > 1000) {
        updateStatus('❌ Текст слишком длинный (макс. 1000 символов)', 'error');
        return;
    }
    
    // Показ загрузки
    elements.translateBtn.disabled = true;
    elements.translateBtn.innerHTML = '⏳ Перевод...';
    updateStatus('🔄 Перевод выполняется...', 'loading');
    
    try {
        const translation = await translateText(text, elements.languageSelect.value);
        elements.translatedText.textContent = translation;
        updateStatus('✅ Перевод завершен', 'success');
    } catch (error) {
        console.error('Ошибка перевода:', error);
        elements.translatedText.textContent = '❌ Ошибка перевода. Проверьте подключение к интернету.';
        updateStatus('❌ Ошибка перевода', 'error');
    } finally {
        // Восстановление кнопки
        elements.translateBtn.disabled = false;
        elements.translateBtn.innerHTML = '🚀 Перевести';
    }
}

async function translateText(text, language) {
    // Простая заглушка для перевода
    // В реальном приложении здесь будет вызов API перевода
    
    if (language === 'en-ru') {
        // Английский → Русский (заглушка)
        const translations = {
            'hello': 'привет',
            'world': 'мир', 
            'translate': 'перевод',
            'text': 'текст',
            'good': 'хороший',
            'morning': 'утро',
            'evening': 'вечер',
            'night': 'ночь'
        };
        
        return text.toLowerCase().split(' ').map(word => 
            translations[word] || `[${word}]`
        ).join(' ');
        
    } else if (language === 'ru-en') {
        // Русский → Английский (заглушка)
        const translations = {
            'привет': 'hello',
            'мир': 'world',
            'перевод': 'translate', 
            'текст': 'text',
            'хороший': 'good',
            'утро': 'morning',
            'вечер': 'evening',
            'ночь': 'night'
        };
        
        return text.toLowerCase().split(' ').map(word => 
            translations[word] || `[${word}]`
        ).join(' ');
    }
    
    return `Перевод: ${text}`;
}

function updateStatus(message, type = 'info') {
    elements.status.textContent = message;
    
    // Сброс классов
    elements.status.className = 'status-bar';
    
    // Добавление класса в зависимости от типа
    const statusClass = {
        'success': 'status-success',
        'error': 'status-error', 
        'loading': 'status-loading',
        'info': 'status-info'
    }[type];
    
    if (statusClass) {
        elements.status.classList.add(statusClass);
    }
}

function showTempMessage(button, message) {
    const originalText = button.innerHTML;
    button.innerHTML = message;
    button.disabled = true;
    
    setTimeout(() => {
        button.innerHTML = originalText;
        button.disabled = false;
    }, 2000);
}

function toggleTheme() {
    if (document.body.classList.contains('dark-theme')) {
        disableDarkTheme();
    } else {
        enableDarkTheme();
    }
}

function enableDarkTheme() {
    document.body.classList.add('dark-theme');
    elements.themeBtn.innerHTML = '<span class="theme-icon">☀️</span><span>Светлая</span>';
    localStorage.setItem('theme', 'dark');
    updateStatus('🌙 Тёмная тема включена', 'info');
}

function disableDarkTheme() {
    document.body.classList.remove('dark-theme');
    elements.themeBtn.innerHTML = '<span class="theme-icon">🌙</span><span>Тёмная</span>';
    localStorage.setItem('theme', 'light');
    updateStatus('☀️ Светлая тема включена', 'info');
}

// Стили для статусов
const statusStyles = `
<style>
.status-success {
    background: #e8f5e8 !important;
    color: #2d5016 !important;
}
.status-error {
    background: #ffeaa7 !important;
    color: #e17055 !important;
}
.status-loading {
    background: #e3f2fd !important;
    color: #1565c0 !important;
}
.status-info {
    background: #f3e5f5 !important;
    color: #7b1fa2 !important;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', statusStyles);

// Service Worker регистрация ЗАКОММЕНТИРОВАНА чтобы убрать ошибки 404
/*
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('./service-worker.js')
            .then(function(registration) {
                console.log('ServiceWorker зарегистрирован для scope:', registration.scope);
            })
            .catch(function(error) {
                console.log('ServiceWorker ошибка:', error);
            });
    });
}
*/

// Обработчики онлайн/оффлайн статуса
window.addEventListener('online', function() {
    updateStatus('🌐 Онлайн - перевод доступен', 'success');
});

window.addEventListener('offline', function() {
    updateStatus('📴 Оффлайн - перевод недоступен', 'error');
});

// Инициализация при загрузке
console.log('🎯 Умный Переводчик инициализирован!');