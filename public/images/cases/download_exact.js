const axios = require('axios');
const fs = require('fs');
const path = require('path');

const targets = [
    { name: 'vtp.jpg', url: 'https://vcdn1-vnexpress.vnecdn.net/2024/04/11/truong-my-lan-toa-tuyen-an-3-5755-1712822760.jpg' },
    { name: 'flc.jpg', url: 'https://i2-vnexpress.vnecdn.net/2025/03/24/f56ea4ca5cd9f987a0c819-1742810-7771-1833-1742811127.jpg' },
    { name: 'tanhoangminh.jpg', url: 'https://vcdn1-vnexpress.vnecdn.net/2022/04/05/do-anh-dung-1649163286-9387-1649163351.jpg' },
    { name: 'vieta.jpg', url: 'https://vcdn1-vnexpress.vnecdn.net/2024/01/12/viet-a-1-4509-1704987042.jpg' },
    { name: 'aic.jpg', url: 'https://i2-vnexpress.vnecdn.net/2022/11/24/baNhanAIC17191668398667-166925-9023-3509-1669261749.jpg' },
    { name: 'pmu18.jpg', url: 'https://vcdn1-vnexpress.vnecdn.net/2016/10/20/ongdung-1476936359.jpg' }
];

async function run() {
    const saveDir = path.join(__dirname);
    
    for (let target of targets) {
        const filepath = path.join(saveDir, target.name);
        console.log(`Downloading exact image for ${target.name} from ${target.url}`);
        
        try {
            const imgRes = await axios.get(target.url, {
                responseType: 'stream',
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Referer': 'https://vnexpress.net/',
                    'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
                }
            });
            const writer = fs.createWriteStream(filepath);
            imgRes.data.pipe(writer);
            await new Promise((resolve, reject) => {
               writer.on('finish', resolve);
               writer.on('error', reject);
            });
            console.log(`Successfully saved ${target.name}`);
        } catch(e) {
            console.log(`Failed to download ${target.name}:`, e.message);
        }
    }
}
run();
