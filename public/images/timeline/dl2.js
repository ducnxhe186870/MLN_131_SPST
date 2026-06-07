
const https = require('https');
const fs = require('fs');

const downloads = [
  { file: '1975.jpg', url: 'https://vtv1.mediacdn.vn/2016/untitled-3-1461986423984.jpg', host: 'vtv.vn' },
  { file: '1976.jpg', url: 'https://tulieuvankien.dangcongsan.vn/Uploads/2018/1/9/3/daihoi4.jpg', host: 'dangcongsan.vn' },
  { file: '1979.jpg', url: 'https://file3.qdnd.vn/data/images/0/2019/02/13/nguyenminh/13022019%20baovebiengioiphiabac1.jpg', host: 'qdnd.vn' },
  { file: '1981.jpg', url: 'https://vtv1.mediacdn.vn/thumb_w/650/2021/11/4/khoan-100-1-16360064560731422394639-crop-16360064654571995576757.jpg', host: 'vtv.vn' },
  { file: '1982.jpg', url: 'https://tulieuvankien.dangcongsan.vn/Uploads/2018/1/9/3/8-dai-hoi-damg-cs-vn-v-1.jpg', host: 'dangcongsan.vn' },
  { file: '1986.jpg', url: 'https://thanglong.chinhphu.vn/Uploaded/tranthuytien/2014_05_12/thoi%20bao%20cap(1).jpg', host: 'chinhphu.vn' }
];

downloads.forEach(d => {
  const req = https.get(d.url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Referer': 'https://' + d.host + '/'
    }
  }, res => {
    if(res.statusCode === 200) {
      res.pipe(fs.createWriteStream(d.file));
      console.log('Downloaded', d.file);
    } else {
      console.log('Failed', d.file, res.statusCode);
    }
  });
  req.on('error', e => console.error(d.file, e));
});
