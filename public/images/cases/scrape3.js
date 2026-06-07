const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const cases = [
  { term: 'phạm huy phước tamexco', file: 'tamexco.jpg' },
  { term: 'tăng minh phụng epco', file: 'epco.jpg' },
  { term: 'huỳnh ngọc sĩ pci', file: 'pci.jpg' },
  { term: 'phạm thanh bình vinashin', file: 'vinashin.jpg' },
  { term: 'xét xử phan quốc việt việt á', file: 'vieta.jpg' }
];

async function run() {
  for (let c of cases) {
    try {
      console.log('Searching Dantri for:', c.term);
      const searchUrl = `https://dantri.com.vn/tim-kiem/${encodeURIComponent(c.term)}.htm`;
      const res = await axios.get(searchUrl, { timeout: 10000, headers: {'User-Agent': 'Mozilla/5.0'} });
      const $ = cheerio.load(res.data);
      
      const articleUrls = [];
      $('h3.article-title a').each((i, el) => {
         const path = $(el).attr('href');
         if(path) articleUrls.push('https://dantri.com.vn' + path);
      });
      
      let downloaded = false;
      for (let articleUrl of articleUrls) {
         if (downloaded) break;
         console.log('  Checking article:', articleUrl);
         try {
           const res2 = await axios.get(articleUrl, { timeout: 10000, headers: {'User-Agent': 'Mozilla/5.0'} });
           const $2 = cheerio.load(res2.data);
           let imageUrl = $2('meta[property="og:image"]').attr('content');
           
           if (imageUrl && !imageUrl.includes('logo') && !imageUrl.includes('avatar') && !imageUrl.includes('default')) {
             console.log('  Downloading image:', imageUrl);
             const imgRes = await axios.get(imageUrl, { responseType: 'stream', timeout: 10000, headers: {'User-Agent': 'Mozilla/5.0'} });
             const writer = fs.createWriteStream(c.file);
             imgRes.data.pipe(writer);
             await new Promise(r => writer.on('finish', r));
             downloaded = true;
             console.log('    --> Success:', c.file);
           }
         } catch(e2) {
           console.log('  Article error:', e2.message);
         }
      }
      
      // Fallback search to tuoitre if dantri fails
      if (!downloaded) {
          console.log('Searching TuoiTre for:', c.term);
          const tturl = `https://tuoitre.vn/tim-kiem.htm?keywords=${encodeURIComponent(c.term)}`;
          const ttres = await axios.get(tturl, { timeout: 10000, headers: {'User-Agent': 'Mozilla/5.0'} });
          const $tt = cheerio.load(ttres.data);
          const ttUrls = [];
          $tt('.box-category-item .box-category-link-title').each((i, el) => {
             const path = $tt(el).attr('href');
             if(path && path.startsWith('/')) ttUrls.push('https://tuoitre.vn' + path);
          });
          
          for (let articleUrl of ttUrls) {
             if (downloaded) break;
             console.log('  Checking article:', articleUrl);
             try {
               const res2 = await axios.get(articleUrl, { timeout: 10000, headers: {'User-Agent': 'Mozilla/5.0'} });
               const $2 = cheerio.load(res2.data);
               let imageUrl = $2('meta[property="og:image"]').attr('content');
               
               if (imageUrl && !imageUrl.includes('logo') && !imageUrl.includes('avatar') && !imageUrl.includes('default')) {
                 console.log('  Downloading image:', imageUrl);
                 const imgRes = await axios.get(imageUrl, { responseType: 'stream', timeout: 10000, headers: {'User-Agent': 'Mozilla/5.0'} });
                 const writer = fs.createWriteStream(c.file);
                 imgRes.data.pipe(writer);
                 await new Promise(r => writer.on('finish', r));
                 downloaded = true;
                 console.log('    --> Success:', c.file);
               }
             } catch(e2) {
               console.log('  Article error:', e2.message);
             }
          }
      }
      
      if (!downloaded) console.log('FAILED to find image for', c.term);
    } catch(e) {
      console.log('Error', c.term, e.message);
    }
  }
}
run();
