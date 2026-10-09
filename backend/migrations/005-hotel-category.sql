ALTER TABLE trips ADD COLUMN hotel_category TEXT CHECK (hotel_category IN ('Low Cost','Budget','Premium'));
