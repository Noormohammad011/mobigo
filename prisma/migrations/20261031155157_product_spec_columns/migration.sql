-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "mainCameraMp" INTEGER,
ADD COLUMN     "refreshRateHz" INTEGER;

ALTER TABLE "Product" ADD CONSTRAINT product_main_camera_mp_range
  CHECK ("mainCameraMp" IS NULL OR ("mainCameraMp" BETWEEN 1 AND 200));
ALTER TABLE "Product" ADD CONSTRAINT product_refresh_rate_hz_range
  CHECK ("refreshRateHz" IS NULL OR ("refreshRateHz" BETWEEN 60 AND 240));
