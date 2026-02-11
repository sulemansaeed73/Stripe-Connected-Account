import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePaymentEventTable1770742230359 implements MigrationInterface {
    name = 'UpdatePaymentEventTable1770742230359'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment_events" ADD "eventId" character varying`);
        await queryRunner.query(`ALTER TABLE "payment_events" ADD CONSTRAINT "UQ_51c5cb44d59cad80f33fdcbc695" UNIQUE ("eventId")`);
        await queryRunner.query(`ALTER TABLE "payment_events" ADD "amount" integer`);
        await queryRunner.query(`ALTER TABLE "payment_events" ADD "currency" character varying`);
        await queryRunner.query(`ALTER TABLE "payment_events" ADD "payload" json`);
        await queryRunner.query(`ALTER TABLE "payment_events" DROP CONSTRAINT "PK_9f1d16fc78b33e676940a32e8b5"`);
        await queryRunner.query(`ALTER TABLE "payment_events" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "payment_events" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "payment_events" ADD CONSTRAINT "PK_9f1d16fc78b33e676940a32e8b5" PRIMARY KEY ("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment_events" DROP CONSTRAINT "PK_9f1d16fc78b33e676940a32e8b5"`);
        await queryRunner.query(`ALTER TABLE "payment_events" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "payment_events" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payment_events" ADD CONSTRAINT "PK_9f1d16fc78b33e676940a32e8b5" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "payment_events" DROP COLUMN "payload"`);
        await queryRunner.query(`ALTER TABLE "payment_events" DROP COLUMN "currency"`);
        await queryRunner.query(`ALTER TABLE "payment_events" DROP COLUMN "amount"`);
        await queryRunner.query(`ALTER TABLE "payment_events" DROP CONSTRAINT "UQ_51c5cb44d59cad80f33fdcbc695"`);
        await queryRunner.query(`ALTER TABLE "payment_events" DROP COLUMN "eventId"`);
    }

}
