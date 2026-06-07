const https = require('https');
const fs = require('fs');
const path = require('path');

const images = [
  { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Bai_Chay_Bridge.jpg/800px-Bai_Chay_Bridge.jpg', filename: 'pmu18.jpg' },
  { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Container_ship_building.jpg/800px-Container_ship_building.jpg', filename: 'vinashin.jpg' },
  { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Ngan_hang_Nha_nuoc_Viet_Nam.jpg/800px-Ngan_hang_Nha_nuoc_Viet_Nam.jpg', filename: 'vtp.jpg' },
  { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/COVID-19_Rapid_Antigen_Test.jpg/800px-COVID-19_Rapid_Antigen_Test.jpg', filename: 'vieta.jpg' },
  { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Vo_Van_Kiet_street%2C_Saigon.jpg/800px-Vo_Van_Kiet_street%2C_Saigon.jpg', filename: 'pci.jpg' },
  { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Ho_Chi_Minh_City_skyline.jpg/800px-Ho_Chi_Minh_City_skyline.jpg', filename: 'epco.jpg' },
  { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/State_Bank_of_Vietnam_HCM_Branch.jpg/800px-State_Bank_of_Vietnam_HCM_Branch.jpg', filename: 'tamexco.jpg' }
];

const dir = path.join(__dirname, 'public', 'images', 'cases');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

images.forEach(img => {
  const options = {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) width/1.0 MLN131-SPST/1.0' }
  };
  https.get(img.url, options, (res) => {
    const file = fs.createWriteStream(path.join(dir, img.filename));
    res.pipe(file);
    console.log(`Downloaded ${img.filename}`);
  }).on('error', (e) => console.error(e));
});
