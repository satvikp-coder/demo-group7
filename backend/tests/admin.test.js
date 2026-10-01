import test from "node:test";
import assert from "node:assert/strict";
import { adminSchemas, updateSchema } from "../middleware/adminSchemas.js";

test("admin updates reject unknown/protected fields and empty objects",()=>{
  for(const schema of Object.values(adminSchemas)) {
    const update=updateSchema(schema);
    for(const input of [{},{id:"x"},{role:"tour_operator"},{created_at:"now"},{provenance_status:"independently_verified"},{source_row_hash:"fake"}])
      assert.equal(update.safeParse(input).success,false);
    assert.equal(update.safeParse({name:"Updated name"}).success,true);
  }
});
test("admin validation rejects invalid prices, accessibility and coordinates",()=>{
  const attraction=updateSchema(adminSchemas.attractions);
  for(const input of [{lat:91},{lng:-181},{wheelchair_accessible:"true"},{entry_fee_numeric:-1},
    {duration_hours:0},{opening_time:"25:00"},{source_date:"2026-02-30"}])
    assert.equal(attraction.safeParse(input).success,false);
  assert.equal(attraction.safeParse({wheelchair_accessible:null,entry_fee_numeric:0}).success,true);
  assert.equal(updateSchema(adminSchemas.hotels).safeParse({price_per_night:10.5}).success,false);
});
