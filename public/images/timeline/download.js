
const https = require('https');
const fs = require('fs');
const path = require('path');

const urls = {
    '1975.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Reunification_Palace_Saigon.jpg/800px-Reunification_Palace_Saigon.jpg',
    '1976.png': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Vietnam.svg/800px-Flag_of_Vietnam.svg.png',
    '1979.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Vietnamese_troops_in_Cambodia.jpg/800px-Vietnamese_troops_in_Cambodia.jpg',
    '1981.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Rice_field_Vietnam.jpg/800px-Rice_field_Vietnam.jpg',
    '1982.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/President_Ho_Chi_Minh_Mausoleum.jpg/800px-President_Ho_Chi_Minh_Mausoleum.jpg',
    '1986.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Dong_Xuan_Market_Hanoi.jpg/800px-Dong_Xuan_Market_Hanoi.jpg'
};

const dir = path.join(__dirname);
console.log('Downloading to', dir);

Object.entries(urls).forEach(([name, url]) => {
    console.log('Downloading', name);
    https.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    }, (res) => {
        if(res.statusCode >= 300 && res.statusCode < 400) {
            console.log(name, 'redirected to', res.headers.location);
            https.get(res.headers.location, {headers:{'User-Agent':'Mozilla/5.0'}}, (res2) => {
                res2.pipe(fs.createWriteStream(path.join(dir, name)));
            });
        } else {
            res.pipe(fs.createWriteStream(path.join(dir, name)));
        }
    }).on('error', (err) => console.log(name, err));
});
