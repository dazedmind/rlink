-- Allow same block/lot for different house models (e.g. Block 20 Lot 01 for Meadow and Valley)
ALTER TABLE "project_inventory" DROP CONSTRAINT IF EXISTS "project_inventory_project_id_block_lot_unique";
ALTER TABLE "project_inventory" ADD CONSTRAINT "project_inventory_project_id_block_lot_model_id_unique" UNIQUE("project_id", "block", "lot", "model_id");
