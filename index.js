const puppeteer = require('puppeteer');
const fs = require('fs').promises;





async function getMostVisitedPalaces() {


    const browser = await puppeteer.launch({   //first launch browser with puppeteer
        headless: "new",
        defaultViewport: { width: 1920, height: 1080 }
    });

    try {
        const page = await browser.newPage();  //then open newpage with this browser
        
        
        await page.goto('https://en.wikipedia.org/wiki/List_of_most_visited_palaces_and_monuments', {    // Navigate to url
            waitUntil: 'networkidle0'
        });





        const palaceData = await page.evaluate(() => {                            // Extract data from the page

            const tables = document.querySelectorAll('.wikitable');                 // and get tables in html

            const allPalaces = [];

            tables.forEach((table, tableIndex) => {                                 //lets look at the rows of table with for loop
                const rows = table.querySelectorAll('tr');
                const category = tableIndex === 0 ? 'Current' : 'Historical';
                
                
                for (let i = 1; i < rows.length; i++) {                         // i = 1 because we want to Skip the header row
                    const row = rows[i];
                    const cells = row.querySelectorAll('td');
                    
                    
                    if (cells.length < 4) continue;         // Skip rows that don't have enough cells

                    
                    const imageElement = row.querySelector('img');      // Extract image URL if available
                    const imageUrl = imageElement ? imageElement.src : null;



                    
                    const linkElement = cells[0].querySelector('a');        // Extract link URL if available
                    const wikiUrl = linkElement ? 'https://en.wikipedia.org' + linkElement.getAttribute('href') : null;

                    const palace = {                            // create palace object and write all data in it
                        category,
                        name: cells[0].textContent.trim(),
                        location: cells[1].textContent.trim(),
                        country: cells[2].textContent.trim(),
                        visitors: cells[3].textContent.trim(),
                        year: cells[4] ? cells[4].textContent.trim() : 'N/A',
                        wikiUrl,
                        imageUrl
                    };

                   


                    allPalaces.push(palace);   // add palace object to array
                }
            });

            return allPalaces;  //and return the array
        });

       
        await fs.writeFile(                      // Save data to JSON file if you want
            'mostVisitedPalaces.json',
            JSON.stringify(palaceData, null, 2)
        );




        return palaceData;         

    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        await browser.close();  // don't forget to close browser
    }
}




async function main() {
    try {
        await getMostVisitedPalaces().then(res=>console.log(res));   //execute function
    } catch (error) {
        console.error(error);
    }
}

main();
