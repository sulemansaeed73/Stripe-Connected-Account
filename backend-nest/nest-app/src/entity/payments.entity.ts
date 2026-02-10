import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('connected_accounts')
export class ConnectedAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  accountId: string;

  @Column({
    type: 'enum',
    enum: ['FR-trial-Acc', 'FR-recurr-Acc'],
    default: 'FR-trial-Acc',
  })
  accountName: 'FR-trial-Acc' | 'FR-recurr-Account';

  @Column({ type: 'varchar', length: 50 })
  type: string; // standard | express | custom

  @Column({ type: 'varchar', length: 10 })
  country: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ type: 'boolean', default: false })
  chargesEnabled: boolean;

  @Column({ type: 'boolean', default: false })
  payoutsEnabled: boolean;

  @Column({ type: 'boolean', default: false })
  detailsSubmitted: boolean;

  @Column({ type: 'bigint' })
  stripeCreatedAt: number;

  @CreateDateColumn()
  createdAt: Date;
}
