const https = require('https');
const fs = require('fs');
const path = require('path');

const dest = path.join(__dirname, 'public', 'notification.mp3');
const file = fs.createWriteStream(dest);

const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
};

// CDNJS Ion-Sound Bell Ring MP3
https.get('https://cdnjs.cloudflare.com/ajax/libs/ion-sound/3.0.7/sounds/bell_ring.mp3', options, function(response) {
  response.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('Download complete!');
  });
}).on('error', function(err) {
  fs.unlink(dest, () => {});
  console.error('Download failed:', err);
});
