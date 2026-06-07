const axios = require('axios');
const fs = require('fs');
const path = require('path');

const feeds = [
    'https://vnexpress.net/rss/phap-luat.rss',
    'https://vnexpress.net/rss/thoi-su.rss',
    'https://tuoitre.vn/rss/phap-luat.rss'
];

async function run() {
    let validImages = [];
    
    for (let feedUrl of feeds) {
        console.log('Fetching', feedUrl);
        try {
            const res = await axios.get(feedUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
                }
            });
            const matches = [...res.data.matchAll(/<img[^>]+src="([^">]+)"/g)];
            
            for (let idx = 0; idx < matches.length; idx++) {
                let url = matches[idx][1];
                if (url && (url.includes('.jpg') || url.includes('.png')) && !url.includes('logo')) {
                    if (url.includes('vnexpress')) url = url.replace(/_m_120x80/g, ''); // get full size
                    if(!validImages.includes(url)) validImages.push(url);
                }
            }
        } catch(e) {
            console.log('Error fetching feed', e.message);
        }
    }
    
    // Remove duplicates
    validImages = [...new Set(validImages)];
    console.log(`Found ${validImages.length} distinct images from RSS.`);
    
    // Download first 40 images max
    const maxImages = Math.min(validImages.length, 40);
    const saveDir = path.join(__dirname, 'gallery');
    
    for (let i = 0; i < maxImages; i++) {
        const imgUrl = validImages[i];
        const filename = `img_${i + 1}.jpg`;
        const filepath = path.join(saveDir, filename);
        
        console.log(`Downloading ${imgUrl} to ${filename}`);
        try {
            const imgRes = await axios.get(imgUrl, {
                responseType: 'stream',
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                    'Referer': imgUrl.includes('vnexpress') ? 'https://vnexpress.net/' : 'https://tuoitre.vn/'
                }
            });
            const writer = fs.createWriteStream(filepath);
            imgRes.data.pipe(writer);
            await new Promise((resolve, reject) => {
               writer.on('finish', resolve);
               writer.on('error', reject);
            });
        } catch(e) {
            console.log(`Failed to download ${imgUrl}:`, e.message);
        }
    }
}
run();
