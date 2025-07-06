import knex, { migrate } from "#postgres/knex.js";
import { Command } from "commander";
const program = new Command();

export async function addSpreadsheet(spreadsheetId: string): Promise<void> {
    try {
        // Проверяем, существует ли уже такая таблица
        const existing = await knex("spreadsheets")
            .where("spreadsheet_id", spreadsheetId)
            .first();

        if (existing) {
            console.log(`Spreadsheet ${spreadsheetId} already exists in database`);
            return;
        }

        // Добавляем в базу данных
        await knex("spreadsheets").insert({ spreadsheet_id: spreadsheetId });
        console.log(`Successfully added spreadsheet ${spreadsheetId} to database`);
    } catch (error) {
        console.error(`Failed to add spreadsheet ${spreadsheetId}:`, error);
        throw error;
    }
}


program
    .command("default [action] [id]", { isDefault: true })
    .action(async (action, arg) => {
        if (!action) return;
        if (action === "add" && arg) {
            await addSpreadsheet(arg);
        } else {
            console.error("Invalid command. Use 'spreadsheet add <id>' to add a spreadsheet.");
        }
        process.exit(0);
    });

program.parse();
