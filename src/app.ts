import { migrate, seed } from "#postgres/knex.js";

import cron from 'node-cron';
import { fetchAndSaveTariffs } from "#utils/fetchTariffs.js";
import { exportToGoogleSheets } from "#utils/exportToSheets.js";

await migrate.latest();
await seed.run();

console.log("All migrations and seeds have been run");

cron.schedule('0 * * * *', async () => {
    try {
        console.log('⏳ Fetching tariffs from WB...');
        await fetchAndSaveTariffs();
        console.log('✅ Tariffs saved to DB.');

        console.log('📤 Exporting to Google Sheets...');
        await exportToGoogleSheets();
        console.log('✅ Export completed.');
    } catch (err) {
        console.error('❌ Error in hourly sync:', err);
    }
});


// Uncomment the following lines to run the fetch and export immediately

// (async () => {
//     await fetchAndSaveTariffs();
//     await exportToGoogleSheets();
// })();