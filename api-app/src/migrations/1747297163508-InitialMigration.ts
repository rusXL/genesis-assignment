import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1747297163508 implements MigrationInterface {
  name = 'InitialMigration1747297163508';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "subscription" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "city" character varying NOT NULL, "frequency" character varying NOT NULL, "confirmed" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_8c3e00ebd02103caa1174cd5d9d" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "subscription"`);
  }
}
