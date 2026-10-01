# Data access

Nine model modules target the canonical PostgreSQL schema. SQL statements are fixed literals with bound values. User creation accepts only tourist or tour_operator; controllers hash passwords before calling it. Internal credential lookup returns hashes only for password comparison, never API serialization. Trip/budget/stop lookups require the owning user ID. CSV seeding preserves external IDs and separately handles approved reference data.
