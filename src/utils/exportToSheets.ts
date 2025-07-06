import { google } from "googleapis";
import knex from "#postgres/knex.js";
import env from "#config/env/env.js";

export async function exportToGoogleSheets() {
    try {
        const today = new Date().toISOString().slice(0, 10);

        const rows = await knex.raw(
            `
                SELECT warehouse_name,
                       date,
                       hour,
                       box_delivery_and_storage_expr,
                       box_delivery_base,
                       box_delivery_liter,
                       box_storage_base,
                       box_storage_liter
                FROM wb_box_tariffs
                WHERE date = ?
                ORDER BY box_delivery_and_storage_expr, warehouse_name DESC
            `,
            [today],
        );

        if (!rows || !rows.rows || rows.rows.length === 0) {
            console.log("No data to export for today:", today);
            return;
        }

        const values = [
            ["Склад", "Дата", "Коэффициент тарифа", "Доставка (1 литра)", "Доставка дополнительного литра", "Хранение (1 литра)", "Хранение дополнительного литра"],
            ...rows.rows.map((r: any) => [
                r.warehouse_name,
                r.date.toISOString().substring(0, 10), // Форматируем дату как YYYY-MM-DD для Google Sheets

                parseFloat(r.box_delivery_and_storage_expr)??0,
                parseFloat(r.box_delivery_base)??0,
                parseFloat(r.box_delivery_liter)??0,
                parseFloat(r.box_storage_base)??0,
                parseFloat(r.box_storage_liter)??0,
            ]),
        ];

        console.log(`Exporting ${values.length - 1} rows to Google Sheets for date: ${today}`);
        // console.log("Values to export:", values);

        const auth = new google.auth.GoogleAuth({
            keyFile: env.GOOGLE_SHEETS_KEY_FILE,
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });

        const sheets = google.sheets({ version: "v4", auth });
        const spreadsheetIds = (await knex("spreadsheets").select("spreadsheet_id")).map((spreadsheet) => spreadsheet.spreadsheet_id);

        console.log(`Exporting ${values.length - 1} rows to Google Sheets...`);
        if (spreadsheetIds.length === 0) {
            console.log("No spreadsheet IDs found in the database.");
            return;
        }
        console.log(`Found ${spreadsheetIds.length} spreadsheet IDs:`, spreadsheetIds);

        for (const id of spreadsheetIds) {
            console.log(`Updating spreadsheet with ID: ${id}`);
            try {
                const sheetName = `stocks_coefs`;

                // Проверяем, существует ли лист с нужным именем
                const spreadsheet = await sheets.spreadsheets.get({
                    spreadsheetId: id,
                });

                const existingSheet = spreadsheet.data.sheets?.find(
                    sheet => sheet.properties?.title === sheetName
                );

                // Если лист не существует, создаем его
                if (!existingSheet) {
                    console.log(`Creating new sheet: ${sheetName}`);
                    await sheets.spreadsheets.batchUpdate({
                        spreadsheetId: id,
                        requestBody: {
                            requests: [{
                                addSheet: {
                                    properties: {
                                        title: sheetName,
                                    }
                                }
                            }]
                        }
                    });
                }

                // Обновляем данные в листе
                await sheets.spreadsheets.values.update({
                    spreadsheetId: id,
                    range: `${sheetName}!A1`,
                    valueInputOption: "USER_ENTERED",
                    requestBody: { values },
                });

                const currentSheet = existingSheet ||
                    (await sheets.spreadsheets.get({ spreadsheetId: id }))
                    .data.sheets?.find(s => s.properties?.title === sheetName);
                const sheetId = currentSheet?.properties?.sheetId;

                if (!sheetId) {
                    throw new Error(`Could not find sheet ID for ${sheetName}`);
                }

                // Делаем заголовки жирными и форматируем столбец даты
                await sheets.spreadsheets.batchUpdate({
                    spreadsheetId: id,
                    requestBody: {
                        requests: [
                            // Делаем заголовки жирными
                            {
                                repeatCell: {
                                    range: {
                                        sheetId: sheetId,
                                        startRowIndex: 0,
                                        endRowIndex: 1,
                                        startColumnIndex: 0,
                                        endColumnIndex: values[0].length
                                    },
                                    cell: {
                                        userEnteredFormat: {
                                            textFormat: {
                                                bold: true
                                            }
                                        }
                                    },
                                    fields: "userEnteredFormat.textFormat.bold"
                                }
                            },
                            // Форматируем столбец даты (столбец B)
                            {
                                repeatCell: {
                                    range: {
                                        sheetId: sheetId,
                                        startRowIndex: 1,
                                        endRowIndex: values.length,
                                        startColumnIndex: 1,
                                        endColumnIndex: 2
                                    },
                                    cell: {
                                        userEnteredFormat: {
                                            numberFormat: {
                                                type: "DATE",
                                                pattern: "dd.mm.yyyy"
                                            }
                                        }
                                    },
                                    fields: "userEnteredFormat.numberFormat"
                                }
                            },
                            // Автоматическая ширина всех столбцов
                            {
                                autoResizeDimensions: {
                                    dimensions: {
                                        sheetId: sheetId,
                                        dimension: "COLUMNS",
                                        startIndex: 0,
                                        endIndex: values[0].length
                                    }
                                }
                            }
                        ]
                    }
                });

                console.log(`Successfully updated spreadsheet ${id} with sheet ${sheetName}`);
            } catch (e: any) {
                console.error(`Error updating spreadsheet with ID ${id}:`, e.message);
            }
        }
    } catch (e: any) {
        console.error("Error exporting to Google Sheets:", e.message);
    }
}
