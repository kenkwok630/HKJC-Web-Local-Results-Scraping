const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const XLSX = require("xlsx");

// Use axios 
async function getHtml(url){                     
    const {data:html} = await axios.get(url);
    return html;
}

//Get all race data
async function processRace(raceUrl){             
    const html = await getHtml(raceUrl);
    const $ = cheerio.load(html);

    let hkjcRacingResultsData = {};
    let sectionalTimeResult = [];

    $('div.raceMeeting_select').each((i, element) => {
        const date = $(element).find('span.f_fl.f_fs13').text().replace("賽事日期:","").trim().split(/\s+/,1); 
        const venueLocation = $(element).find('span.f_fl.f_fs13').text().replace("賽事日期:","").trim().split(/\s\s+/);

        hkjcRacingResultsData["date"] = date[0]; 
        hkjcRacingResultsData["venueLocation"] = venueLocation[1]; 
    })

    $('.f_fs12.color_blue2').remove();  
    $('div.race_tab').each((i, element) => {
        const race = $(element).find('tr').slice(0,1).text().trim().replace(/\s+/g," ").split(/\s+/);
        const raceIndex = $(element).find('tr').slice(0,1).text().trim().replace(/\s+/g," ").split(/\s+|-/);
        const raceClass = $(element).find('tr').slice(2,3).text().trim().split(/\s\s+|-/);
        const distance = $(element).find('tr').slice(2,3).text().replace("米","").trim().split(/\s\s+|-/);
        const handicap = $(element).find('tr').slice(3,4).text().trim().split(/\s\s+|-/);
        const going = $(element).find('tr').slice(2,3).text().trim().replace(/\s+/g," ").split(/\s\s+|:/);
        const course = $(element).find('tr').slice(3,4).text().trim().split(/\s\s+/);
        const raceTime = $(element).find('tr').slice(4,5).text().trim().replace(/\s+/g," ").split(/\s+:/);
        const raceSectionalTime = $(element).find('tr').slice(5,6).text().trim().replace(/\s+/g," ").split(/\s+:/);

        hkjcRacingResultsData["race"] = race[1];
        hkjcRacingResultsData["raceIndex"] = raceIndex[3];
        hkjcRacingResultsData["raceClass"] = raceClass[0].trim();
        hkjcRacingResultsData["distance"] = distance[1].trim();
        hkjcRacingResultsData["handicap"] = handicap[0];
        hkjcRacingResultsData["going"] = going[1].trim();
        hkjcRacingResultsData["course"] = course[2];
        hkjcRacingResultsData["raceTime"] = raceTime[1].trim().split(/\s+/);
        hkjcRacingResultsData["raceSectionalTime"] = raceSectionalTime[1].trim().split(/\s+/);
    })

      const sectionalTimeHref = $('.sectional_time_btn.f_clear a').attr('href');                 
      if(sectionalTimeHref){
         const sectional_time = await axios.get(`https://racing.hkjc.com${sectionalTimeHref}`);  
         const $$ = cheerio.load(sectional_time.data);                                           
         $$('thead').remove(); $$('.color_blue2').remove(); $$('.f_clear').remove();             
         $$('.table_bd.f_tac.race_table tr').each((i,element) => {                               
            const sectionalTime = $$(element).find('td').slice(3,-1).text().trim().split(/\s+/);
            sectionalTimeResult.push(sectionalTime);
        });
      }              
          
      $("tr.bg_blue.color_w").remove();  
      $('table.f_tac.table_bd.draggable tr').each((i, element) => {
          const placing = $(element).find('td').slice(0,1).text().trim().split();
          const horseNo = $(element).find('td').slice(1,2).text().trim().split();
          const horseId = $(element).find('.f_fs13.f_tal a').attr('href').slice(53).split(); 
          const horseName = $(element).find('.f_fs13.f_tal a').slice(0,1).text().trim().split();
          const jockey = $(element).find('td').slice(3,4).text().trim().split();
          const trainer = $(element).find('td').slice(4,5).text().trim().split();
          const actualWeight = $(element).find('td').slice(5,6).text().split();
          const horseWeight = $(element).find('td').slice(6,7).text().split();
          const draw = $(element).find('td').slice(7,8).text().split();
          const lengthBehindWinner = $(element).find('td').slice(8,9).text().split();
          const runningPosition= $(element).find('td').slice(9,10).text().replace(/\s/g," ").trim().split(/\s+/);
          const finishTime = $(element).find('td').slice(10,11).text().split();
          const lastWinOdds= $(element).find('td').slice(11,12).text().split();
        
          if(placing[0]) {
          hkjcRacingResultsData[`${placing[0]}`] = {
            placing : placing[0],
            horseNo : horseNo[0],
            horseId : horseId[0],                       
            horseName : horseName[0],
            jockey : jockey[0],
            trainer : trainer[0],
            actualWeight: actualWeight[0],
            horseWeight : horseWeight[0],
            draw : draw[0],
            lengthBehindWinner : lengthBehindWinner[0],
            runningPosition : runningPosition,
            finishTime : finishTime[0],
            lastWinOdds : lastWinOdds[0],
            sectionalTime: sectionalTimeResult[i]
          }
        }
      });         
    
    return hkjcRacingResultsData;                                     
}

async function main(){
    const url = "https://racing.hkjc.com/racing/information/Chinese/Racing/LocalResults.aspx";  //The HKJC latest local race results link
    const urlHtml = await getHtml(url);                                                         
    const $ = cheerio.load(urlHtml);  //Loading HTML 

    $('.font_w7.f_tar').remove();
    const newRaceLinks = [];     //Create a new array to save all the race links
    $('div .f_clear.top_races td').each(async (i, element) => {
          // Collect all the race links
          const href = $(element).find('a').attr('href');        
          //Push all the race link into the newRaceLinks array
          if(href) newRaceLinks.push(`https://racing.hkjc.com${href}`)  
    });
    
    newRaceLinks.pop();  //Delete the last array data
    
    const allRaceUrls = [url, ...newRaceLinks]
    const result =  {};

    //Use a for loop to display all data
    for(const raceUrl of allRaceUrls){                    
      const raceData = await processRace(raceUrl);
      const racerRound = `R${raceData.race}`;
      result[racerRound] = raceData;
    }

    fs.writeFile('hkjcResultHK.json', JSON.stringify(result),(error)=>{          //Save the JSON file
          if(error){
            console.log("❌ Unable to save JSON!");
            console.log(error);
          }else{
            console.log("✅ JSON saved successfully!");
          }
    });
    
  (async() => {                                                             // Save the Excel XLSX file 
    const allData = [result];
    for(const data of allData){
        const raceHorseData = [];
        const races = Object.values(data);
            for(const race of races){
              const raceInfo = {
                date: race.date,
                venueLocation: race.venueLocation,
                race: race.race,
                raceIndex: race.raceIndex,
                raceClass: race.raceClass,
                distance: race.distance,
                handicap: race.handicap,
                going: race.going,
                course: race.course,
                raceTime: race.raceTime.toString(),
                raceSectionalTime: race.raceSectionalTime.toString()
            }
            
              const horseKeys = Object.keys(race).filter(i =>!isNaN(Number(i)))
              const horseData = horseKeys.map(i=> race[i])
                for(const horse of horseData){
                  const combined = {
                    ...raceInfo,
                    placing: horse.placing,
                    horseNo: horse.horseNo,
                    horseId: horse.horseId,
                    horseName: horse.horseName,
                    jockey: horse.jockey,
                    trainer: horse.trainer,
                    actualWeight: horse.actualWeight,
                    horseWeight: horse.horseWeight,
                    draw: horse.draw,
                    lengthBehindWinner: horse.lengthBehindWinner,
                    runningPosition: horse.runningPosition.toString(),
                    lastWinOdds: horse.lastWinOdds,
                    sectionalTime: horse.sectionalTime.toString()
                  };
                  raceHorseData.push(combined)
                }
            }  
          
          /* generate worksheet and workbook */
          const worksheet = XLSX.utils.json_to_sheet(raceHorseData);
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, "HKJC Result");
          XLSX.writeFileAsync("hkjcResultHK.xlsx", workbook, { compression: true }, (error)=>{
            if(error){
              console.log("❌ Unable to save Excel XLSX!");
              console.log(error)
            }else{
               console.log("✅ Excel XLSX saved successfully!");
            }
          });
    }
  })();
}
  
main();