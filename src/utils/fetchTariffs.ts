import knex from "#postgres/knex.js";
import axios from "#config/axios/axios.js";

const parseNum = (val: string) =>
    val === '-' ? null : parseFloat(val.replace(',', '.'));

export async function fetchAndSaveTariffs() {
    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const hour = now.getHours();

    try {
        const res = await axios.get(`/tariffs/box?date=${date}`);
        const list = res.data.response.data.warehouseList;

        for (const w of list) {
            await knex('wb_box_tariffs')
                .insert({
                    date,
                    hour,
                    warehouse_name: w.warehouseName,
                    box_delivery_and_storage_expr: parseNum(w.boxDeliveryAndStorageExpr),
                    box_delivery_base: parseNum(w.boxDeliveryBase),
                    box_delivery_liter: parseNum(w.boxDeliveryLiter),
                    box_storage_base: parseNum(w.boxStorageBase),
                    box_storage_liter: parseNum(w.boxStorageLiter),
                })
                .onConflict(['date', 'hour', 'warehouse_name'])
                .merge();
        }
    }catch (e) {
        console.log("Error fetching tariffs:", e);
    }
}
