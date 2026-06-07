
import urllib.request
import os

urls = {
    '1975.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Reunification_Palace_Saigon.jpg/800px-Reunification_Palace_Saigon.jpg',
    '1976.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Vietnam.svg/800px-Flag_of_Vietnam.svg.png',
    '1979.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Vietnamese_troops_in_Cambodia.jpg/800px-Vietnamese_troops_in_Cambodia.jpg',
    '1981.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Rice_field_Vietnam.jpg/800px-Rice_field_Vietnam.jpg',
    '1982.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/President_Ho_Chi_Minh_Mausoleum.jpg/800px-President_Ho_Chi_Minh_Mausoleum.jpg',
    '1986.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Dong_Xuan_Market_Hanoi.jpg/800px-Dong_Xuan_Market_Hanoi.jpg'
}

req = urllib.request.build_opener()
req.addheaders = [('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')]
urllib.request.install_opener(req)

os.makedirs('public/images/timeline', exist_ok=True)

for name, url in urls.items():
    print(f'Downloading {name}...')
    try:
        urllib.request.urlretrieve(url, 'public/images/timeline/' + name)
        print('Success!')
    except Exception as e:
        print(f'Error {name}: {e}')
