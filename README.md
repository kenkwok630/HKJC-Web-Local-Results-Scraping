# HKJC Web Local Results Scraping
這個是使用node.js，爬取HKJC網頁最新的馬匹賽果資料，最終輸出JSON 和 Excel XLSX 檔案。 \
This project uses Node.js to scrape the latest horse racing results from the HKJC website, outputting the data in JSON and Excel XLSX formats. 

## Data Dictionary 數據字典
| English Title 英文標題 | Chinese Title 中文標題 |
|---|---|
| date | 比賽日期 |
| venueLocation | 比賽地點 | 
| race |賽事場次 |
|raceIndex | 年度賽事場次 |
|raceClass | 賽事班次 |
|distance | 賽事途程 |
|handicap | 讓步賽 |
|going | 場地狀況 |
|course | 跑道 |
|raceTime | 賽事時間 |
|raceSectionalTime | 賽事分段時間 |
|placing | 比賽名次 |
|horseNo | 比賽馬號 |
|horseId | 馬匹編號 |
|horseName | 馬匹名稱 |
|jockey | 騎師 |
|trainer | 練馬師 |
|actualWeight | 實際負磅 |
|horseWeight | 排位體重 |
|draw | 檔位 |
|lengthBehindWinner | 頭馬距離 |
|runningPosition | 馬匹沿途走位 |
|lastWinOdds | 最後獨贏賠率 |
|sectionalTime | 馬匹分段時間 |

## Usage Instructions 使用教學
1. 首先安裝node.js (https://nodejs.org/) \
   Install Node.js from https://nodejs.org/. 
   
2. 在終端機輸入 ```npm install``` \
   Run ```npm install``` in the terminal to install dependencies. 
   
3. 在終端機輸入 ```node index``` (獲取英文數據) 或 ```node indexHK``` (獲取中文數據)  \
   Run ```node index``` to scrape data in English or ```node indexHK``` to scrape data in Chinese. 
   
4. 最終在資料夾輸出JSON 和 Excel XLSX 檔案 \
   The scraped data will be output as JSON and Excel XLSX files in the project folder. 
