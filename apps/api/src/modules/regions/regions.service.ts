import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE } from '../../database/database.module';
import type { DrizzleDB } from '../../database/database';
import { regions } from '../../database/schema';

@Injectable()
export class RegionsService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async findAll() {
    return this.db.select().from(regions).all();
  }
}
