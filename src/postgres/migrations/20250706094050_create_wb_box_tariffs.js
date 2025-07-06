/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
    return knex.schema.createTable('wb_box_tariffs', (table) => {
        table.increments('id').primary();
        table.date('date').notNullable();
        table.integer('hour').notNullable();
        table.string('warehouse_name').notNullable();
        table.decimal('box_delivery_and_storage_expr');
        table.decimal('box_delivery_base');
        table.decimal('box_delivery_liter');
        table.decimal('box_storage_base');
        table.decimal('box_storage_liter');
        table.unique(['date', 'hour', 'warehouse_name']);
    });
}

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
    return knex.schema.dropTableIfExists('wb_box_tariffs');
}
