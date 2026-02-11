import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('payment_events')
export class PaymentEvent {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  eventId: string;

  @Column()
  eventType: string;

  @Column()
  stripeObjectId: string;

  @Column({ nullable: true })
  paymentIntentId: string;

  @Column({ nullable: true })
  chargeId: string;

  @Column({ nullable: true })
  amount: number;

  @Column({ nullable: true })
  currency: string;

  @Column({ type: 'bigint' })
  stripeCreatedAt: number;

  @Column({ type: 'json', nullable: true })
  payload: any;

  @CreateDateColumn()
  createdAt: Date;
}
