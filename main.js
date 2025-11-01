// Регистрация Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('./sw.js')
      .then(function(registration) {
        console.log('Service Worker registered with scope:', registration.scope);
        
        // Проверяем есть ли новая версия SW
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('New Service Worker found!');
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New content available - please refresh!');
              // Можно показать кнопку "Обновить" пользователю
            }
          });
        });
      })
      .catch(function(error) {
        console.log('Service Worker registration failed:', error);
      });
  });
  
  // Проверка обновлений при фокусе на странице
  window.addEventListener('focus', () => {
    navigator.serviceWorker.getRegistration().then(registration => {
      if (registration) {
        registration.update();
      }
    });
  });
}