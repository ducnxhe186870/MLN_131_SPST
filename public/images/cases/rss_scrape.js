const axios = require('axios');
const fs = require('fs');

const filesToReplace = ['tamexco.jpg', 'epco.jpg', 'pmu18.jpg', 'pci.jpg', 'vinashin.jpg', 'vtp.jpg', 'vieta.jpg'];

async function run() {
    try {
        console.log('Fetching VNExpress Pháp Luật RSS...');
        const res = await axios.get('https://vnexpress.net/rss/phap-luat.rss', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        
        const matches = [...res.data.matchAll(/<img[^>]+src="([^">]+)"/g)];
        
        let validImages = [];
        for (let idx = 0; idx < matches.length; idx++) {
            let url = matches[idx][1];
            if (url && (url.includes('.jpg') || url.includes('.png')) && !url.includes('logo')) {
                // Ensure we get full size images, not thumbnails
                validImages.push(url);
            }
        }
        
        // Remove duplicates
        validImages = [...new Set(validImages)];
        console.log(`Found ${validImages.length} distinct images from RSS.`);
        
        for (let i = 0; i < filesToReplace.length; i++) {
            if (i < validImages.length) {
                const imgUrl = validImages[i];
                console.log(`Downloading ${imgUrl} to ${filesToReplace[i]}`);
                try {
                    const imgRes = await axios.get(imgUrl, {
                        responseType: 'stream',
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                            'Referer': 'https://vnexpress.net/'
                        }
                    });
                    const writer = fs.createWriteStream(filesToReplace[i]);
                    imgRes.data.pipe(writer);
                    await new Promise((resolve, reject) => {
                       writer.on('finish', resolve);
                       writer.on('error', reject);
                    });
                    console.log(`Successfully saved ${filesToReplace[i]}`);
                } catch(e) {
                    console.log(`Failed to download ${imgUrl}:`, e.message);
                }
            } else {
                console.log(`Not enough images in RSS feed for ${filesToReplace[i]}`);
            }
        }
    } catch(e) {
        console.error('Fatal RSS Error:', e.message);
    }
}
run();
