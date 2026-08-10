importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Initialize Firebase inside Service Worker
firebase.initializeApp({
  apiKey: "AIzaSyAepVfQvipm6CPOGFFS_y_9gDtTGZu4H8c",
  authDomain: "seraj-bedding-house.firebaseapp.com",
  databaseURL: "https://seraj-bedding-house-default-rtdb.firebaseio.com",
  projectId: "seraj-bedding-house",
  storageBucket: "seraj-bedding-house.firebasestorage.app",
  messagingSenderId: "417365079620",
  appId: "1:417365079620:web:24700bb03b9be795b3ee11"
});

const messaging = firebase.messaging();

// Background Push listener
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || payload.data?.title || 'Siraj Bedding House';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || '',
    icon: '/logo.jpg',
    badge: '/logo.jpg',
    tag: 'siraj-notification',
    sound: '/notification.mp3', // Supported in some mobile/desktop OS
    data: {
      url: payload.data?.link || '/'
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Click action - Open site link
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a tab is already open, focus it
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      // If no tab is open, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
