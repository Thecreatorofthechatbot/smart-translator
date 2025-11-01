console.log('🚀 Умный Переводчик загружен! (Мобильная версия)');

const elements = {
    inputText: document.getElementById('inputText'),
    outputText: document.getElementById('outputText'),
    translateBtn: document.getElementById('translateBtn'),
    clearBtn: document.getElementById('clearBtn'),
    languageSelect: document.getElementById('languageSelect'),
    status: document.getElementById('status'),
    themeBtn: document.getElementById('themeBtn'),
    charCount: document.getElementById('charCount'),
    languageBadge: document.getElementById('languageBadge'),
    copyBtn: document.getElementById('copyBtn'),
    speakBtn: document.getElementById('speakBtn'),
    swapBtn: document.getElementById('swapBtn')
};

// Проверяем мобильное устройство
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
let isOnline = navigator.onLine;
let currentTranslation = '';

if (isMobile) {
    console.log('📱 Мобильное устройство обнаружено');
    document.body.classList.add('mobile');
}

// Слушаем изменения сети
window.addEventListener('online', () => {
    isOnline = true;
    updateStatus('🌐 Онлайн');
    document.body.classList.remove('offline');
});

window.addEventListener('offline', () => {
    isOnline = false;
    updateStatus('📴 Оффлайн');
    document.body.classList.add('offline');
});

// РАСШИРЕННЫЙ СЛОВАРЬ
const dictionary = {
    'en-ru': {
        'hello': 'привет', 'hi': 'привет', 'thanks': 'спасибо', 'thank you': 'спасибо',
        'please': 'пожалуйста', 'sorry': 'извини', 'yes': 'да', 'no': 'нет', 'ok': 'окей',
        'good': 'хороший', 'bad': 'плохой', 'big': 'большой', 'small': 'маленький',
        'how': 'как', 'what': 'что', 'where': 'где', 'when': 'когда', 'why': 'почему',
        'i': 'я', 'you': 'ты', 'he': 'он', 'she': 'она', 'we': 'мы', 'they': 'они',
        'my': 'мой', 'your': 'твой', 'his': 'его', 'her': 'её', 'our': 'наш',
        'have': 'иметь', 'do': 'делать', 'go': 'идти', 'see': 'видеть', 'get': 'получать',
        'make': 'делать', 'know': 'знать', 'think': 'думать', 'say': 'говорить', 'want': 'хотеть',
        'love': 'любовь', 'like': 'нравиться', 'need': 'нуждаться', 'can': 'мочь',
        
        // Сленг и фразы
        'lol': 'лол', 'omg': 'омг', 'wtf': 'что за черт', 'brb': 'скоро вернусь',
        'idk': 'не знаю', 'tbh': 'честно', 'imo': 'по-моему', 'np': 'без проблем',
        'how are you': 'как дела', 'what is your name': 'как тебя зовут',
        'i love you': 'я тебя люблю', 'good morning': 'доброе утро',
        'good night': 'спокойной ночи', 'see you later': 'увидимся позже',
        'i dont know': 'я не знаю', 'what do you think': 'что ты думаешь',
        'where are you': 'где ты', 'how old are you': 'сколько тебе лет',
        
        // Новые слова
        'computer': 'компьютер', 'phone': 'телефон', 'internet': 'интернет',
        'friend': 'друг', 'family': 'семья', 'work': 'работа', 'home': 'дом',
        'food': 'еда', 'water': 'вода', 'time': 'время', 'day': 'день', 'night': 'ночь'
    },
    
    'ru-en': {
        'привет': 'hello', 'здравствуй': 'hello', 'спасибо': 'thank you', 
        'пожалуйста': 'please', 'извини': 'sorry', 'да': 'yes', 'нет': 'no', 
        'окей': 'okay', 'хороший': 'good', 'плохой': 'bad', 'большой': 'big', 
        'маленький': 'small', 'как': 'how', 'что': 'what', 'где': 'where', 
        'когда': 'when', 'почему': 'why', 'я': 'i', 'ты': 'you', 'он': 'he', 
        'она': 'she', 'мы': 'we', 'они': 'they', 'мой': 'my', 'твой': 'your', 
        'его': 'his', 'её': 'her', 'наш': 'our', 'иметь': 'have', 'делать': 'do',
        'идти': 'go', 'видеть': 'see', 'получать': 'get', 'делать': 'make',
        'знать': 'know', 'думать': 'think', 'говорить': 'say', 'хотеть': 'want',
        'любовь': 'love', 'нравиться': 'like', 'нуждаться': 'need', 'мочь': 'can',
        
        // Русский сленг
        'лол': 'lol', 'омг': 'omg', 'кек': 'kek', 'щас': 'now', 'чё': 'what',
        'норм': 'ok', 'агонь': 'fire', 'жесть': 'crazy', 'кринж': 'cringe',
        'спс': 'thanks', 'пж': 'please', 'ок': 'ok',
        
        // Фразы
        'как дела': 'how are you', 'как твои дела': 'how are you',
        'как тебя зовут': 'what is your name', 'как вас зовут': 'what is your name',
        'я тебя люблю': 'i love you', 'доброе утро': 'good morning',
        'добрый день': 'good afternoon', 'добрый вечер': 'good evening',
        'спокойной ночи': 'good night', 'увидимся позже': 'see you later'
    }
};

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded!');
    updateStatus(isOnline ? '🌐 Онлайн' : '📴 Оффлайн');
    if (!isOnline) document.body.classList.add('offline');
    
    // Загружаем тему
    loadTheme();
    
    // Счетчик символов
    elements.inputText.addEventListener('input', updateCharCount);
    updateCharCount();
    
    // Подключаем обработчики
    elements.themeBtn.addEventListener('click', toggleTheme);
    elements.copyBtn.addEventListener('click', copyTranslation);
    elements.speakBtn.addEventListener('click', speakTranslation);
    elements.swapBtn.addEventListener('click', swapLanguages);
    
    // Автоперевод при изменении текста (с задержкой)
    let translateTimeout;
    elements.inputText.addEventListener('input', function() {
        clearTimeout(translateTimeout);
        if (this.value.trim().length > 0) {
            translateTimeout = setTimeout(() => {
                if (this.value.trim().length > 2) {
                    performHybridTranslation();
                }
            }, 1500);
        }
    });
    
    // Оптимизация для мобильных
    if (isMobile) {
        // Увеличиваем область клика для кнопок
        document.querySelectorAll('button').forEach(btn => {
            btn.style.minHeight = '44px'; // Минимальный размер для удобного тапа
        });
    }
});

// Счетчик символов
function updateCharCount() {
    const count = elements.inputText.value.length;
    elements.charCount.textContent = count;
    
    if (count > 800) {
        elements.charCount.style.color = '#ff6b6b';
    } else if (count > 500) {
        elements.charCount.style.color = '#feca57';
    } else {
        elements.charCount.style.color = '#999';
    }
}

// Кнопка перевода
elements.translateBtn.addEventListener('click', performHybridTranslation);

// ГИБРИДНЫЙ ПЕРЕВОД
async function performHybridTranslation() {
    const text = elements.inputText.value.trim();
    let direction = elements.languageSelect.value;
    
    if (!text) {
        updateStatus('⚠️ Введите текст');
        elements.outputText.textContent = '';
        return;
    }
    
    // Блокируем кнопку на время перевода
    elements.translateBtn.disabled = true;
    elements.translateBtn.textContent = '⏳ Перевожу...';
    
    try {
        // Автоопределение языка
        if (direction === 'auto') {
            direction = detectLanguage(text);
            const directionName = getDirectionName(direction);
            updateStatus(`🌍 ${directionName}`);
            updateLanguageBadge(directionName);
        } else {
            updateLanguageBadge(getDirectionName(direction));
        }
        
        let translation;
        let method = '';
        
        if (!isOnline) {
            // ОФФЛАЙН РЕЖИМ
            method = '📴 Оффлайн';
            updateStatus('⚡ Словарь...');
            translation = dictionaryTranslate(text, direction);
        } else {
            // ОНЛАЙН РЕЖИМ
            updateStatus('🌐 Онлайн...');
            
            try {
                translation = await tryAPITranslation(text, direction);
                method = '🌐 Онлайн';
            } catch (apiError) {
                console.log('API не сработал, использую словарь:', apiError);
                translation = dictionaryTranslate(text, direction);
                method = '⚡ Словарь';
            }
        }
        
        currentTranslation = translation;
        elements.outputText.textContent = translation;
        updateStatus(`✅ Готово | ${method}`);
        
    } catch (error) {
        console.error('Ошибка перевода:', error);
        const direction = elements.languageSelect.value === 'auto' ? detectLanguage(text) : elements.languageSelect.value;
        currentTranslation = dictionaryTranslate(text, direction);
        elements.outputText.textContent = currentTranslation;
        updateStatus('⚠️ Словарь');
    } finally {
        // Разблокируем кнопку
        elements.translateBtn.disabled = false;
        elements.translateBtn.textContent = '🚀 Перевести';
    }
}

// API ПЕРЕВОД
async function tryAPITranslation(text, direction) {
    const langMap = {
        'en-ru': 'en|ru',
        'ru-en': 'ru|en'
    };
    
    const langpair = langMap[direction];
    if (!langpair) throw new Error('Неизвестное направление');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    try {
        const response = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langpair}`,
            { signal: controller.signal }
        );
        
        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error('API недоступен');
        
        const data = await response.json();
        return data?.responseData?.translatedText || text;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

// СЛОВАРНЫЙ ПЕРЕВОД
function dictionaryTranslate(text, direction) {
    const dict = dictionary[direction];
    if (!dict) return `[Ошибка направления] ${text}`;
    
    let translated = text;
    
    // Сначала фразы, потом отдельные слова
    const phrases = Object.keys(dict).filter(phrase => phrase.includes(' '));
    const words = Object.keys(dict).filter(word => !word.includes(' '));
    const allKeys = [...phrases, ...words].sort((a, b) => b.length - a.length);
    
    allKeys.forEach(key => {
        const regex = new RegExp(`\\b${key}\\b`, 'gi');
        translated = translated.replace(regex, dict[key]);
    });
    
    if (!isOnline) {
        return translated + '\n\n[📴 Оффлайн]';
    }
    
    return translated;
}

// ОПРЕДЕЛЕНИЕ ЯЗЫКА
function detectLanguage(text) {
    const hasRussian = /[а-яА-ЯёЁ]/.test(text);
    return hasRussian ? 'ru-en' : 'en-ru';
}

// Вспомогательные функции
function getDirectionName(direction) {
    const directions = {
        'en-ru': 'EN → RU',
        'ru-en': 'RU → EN'
    };
    return directions[direction] || direction;
}

function updateLanguageBadge(direction) {
    elements.languageBadge.textContent = direction;
}

// ТЕМНАЯ ТЕМА
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Обновляем текст кнопки
    elements.themeBtn.innerHTML = isDark ? 
        '<span class="theme-icon">☀️</span><span>Светлая</span>' : 
        '<span class="theme-icon">🌙</span><span>Тёмная</span>';
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        elements.themeBtn.innerHTML = '<span class="theme-icon">☀️</span><span>Светлая</span>';
    }
}

// НОВЫЕ ФУНКЦИИ

// Копирование перевода
function copyTranslation() {
    if (!currentTranslation) return;
    
    const textToCopy = currentTranslation.replace('\n\n[📴 Оффлайн]', '');
    navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = elements.copyBtn.textContent;
        elements.copyBtn.textContent = '✅ Скопировано!';
        setTimeout(() => {
            elements.copyBtn.textContent = originalText;
        }, 2000);
    });
}

// Озвучивание текста
function speakTranslation() {
    const text = currentTranslation || elements.outputText.textContent;
    if (!text) return;
    
    const cleanText = text.replace('\n\n[📴 Оффлайн]', '');
    if (!cleanText.trim()) return;
    
    // Определяем язык для произношения
    const lang = detectLanguage(cleanText) === 'ru-en' ? 'en-US' : 'ru-RU';
    
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = lang;
        utterance.rate = 0.8;
        utterance.pitch = 1;
        speechSynthesis.speak(utterance);
        
        updateStatus('🔊 Озвучиваю...');
        
        utterance.onend = function() {
            updateStatus('✅ Озвучено');
        };
    } else {
        updateStatus('⚠️ Озвучение не поддерживается');
    }
}

// Обмен языков
function swapLanguages() {
    const currentLang = elements.languageSelect.value;
    
    if (currentLang === 'en-ru') {
        elements.languageSelect.value = 'ru-en';
    } else if (currentLang === 'ru-en') {
        elements.languageSelect.value = 'en-ru';
    }
    
    // Меняем местами текст перевода и исходный текст
    if (currentTranslation && elements.inputText.value.trim()) {
        const temp = elements.inputText.value;
        elements.inputText.value = currentTranslation.replace('\n\n[📴 Оффлайн]', '');
        currentTranslation = temp;
        elements.outputText.textContent = temp;
    }
    
    updateLanguageBadge(getDirectionName(elements.languageSelect.value));
}

// Кнопка очистки
elements.clearBtn.addEventListener('click', function() {
    elements.inputText.value = '';
    elements.outputText.textContent = '';
    currentTranslation = '';
    updateCharCount();
    updateStatus(isOnline ? '🌐 Онлайн' : '📴 Оффлайн');
    updateLanguageBadge('Авто');
});

// Функция обновления статуса
function updateStatus(message) {
    elements.status.textContent = message;
}

// Свайп для очистки (мобильная функция)
let touchStartX = 0;
let touchEndX = 0;

elements.inputText.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
});

elements.inputText.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeLength = touchEndX - touchStartX;
    // Если свайп влево более 100px
    if (swipeLength < -100 && elements.inputText.value.trim().length > 0) {
        elements.clearBtn.click();
    }
}
// Добавь этот код в КОНЕЦ renderer.js файла:

// PWA функциональность
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('./service-worker.js')
            .then(function(registration) {
                console.log('ServiceWorker зарегистрирован для scope: ', registration.scope);
            })
            .catch(function(error) {
                console.log('ServiceWorker регистрация не удалась: ', error);
            });
    });
}

// Автоматическое предложение установки
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('PWA готов к установке');
    
    // Можно показать свою кнопку установки
    // showInstallPromotion();
});

// Функция для показа установки
function showInstallPromotion() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('Пользователь установил PWA');
            }
            deferredPrompt = null;
        });
    }
}