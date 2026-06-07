import urllib.request
import os
import time

urls = {
  'cpv-flag.png': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Communist_Party_of_Vietnam_logo.svg/800px-Communist_Party_of_Vietnam_logo.svg.png',
  'cambodia.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Vietnamese_troops_in_Cambodia.jpg/800px-Vietnamese_troops_in_Cambodia.jpg',
  'vietnam-china.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Vietnam_china.jpg/800px-Vietnam_china.jpg',
  'rice-field.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Rice_field_Vietnam.jpg/800px-Rice_field_Vietnam.jpg',
  'mausoleum.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/President_Ho_Chi_Minh_Mausoleum.jpg/800px-President_Ho_Chi_Minh_Mausoleum.jpg',
  '100-dong.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/100_Dong_1985.jpg/800px-100_Dong_1985.jpg',
  'dong-xuan.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Dong_Xuan_Market_Hanoi.jpg/800px-Dong_Xuan_Market_Hanoi.jpg',
  'ba-dinh.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/The_Ba_Dinh_meeting-hall.jpg/800px-The_Ba_Dinh_meeting-hall.jpg',
  'le-duan.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Le_Duan.jpg/800px-Le_Duan.jpg'
}

req = urllib.request.build_opener()
req.addheaders = [('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36')]
urllib.request.install_opener(req)

os.makedirs('public/images/wiki', exist_ok=True)

for name, url in urls.items():
    print(f'Downloading {name}...')
    try:
        urllib.request.urlretrieve(url, 'public/images/wiki/' + name)
        print('Success!')
    except Exception as e:
        print(f'Error {name}: {e}')
    time.sleep(1)

