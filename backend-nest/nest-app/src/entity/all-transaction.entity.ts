import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('payment')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  paymentIntentId: string;

  @Column({
    type: 'enum',
    enum: ['FR-trial-Acc', 'FR-recurr-Acc'],
    default: 'FR-trial-Acc',
  })
  accountName: 'FR-trial-Acc' | 'FR-recurr-Acc';

  @Column({ type: 'bigint' })
  amount: number;

  @Column({ type: 'varchar', length: 10 })
  currency: string;

  @Column({ type: 'varchar', length: 50 })
  status: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  customer: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  connectedAccount: string | null;

  @Column({ type: 'bigint' })
  stripeCreatedAt: number;

  @CreateDateColumn()
  createdAt: Date;
}
