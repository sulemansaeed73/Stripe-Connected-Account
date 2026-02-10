import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('payment_events')
export class PaymentEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  eventType: string;

  @Column()
  stripeObjectId: string;

  @Column({ nullable: true })
  paymentIntentId: string;

  @Column({ nullable: true })
  chargeId: string;

  @Column({ type: 'bigint' })
  stripeCreatedAt: number;

  @CreateDateColumn()
  createdAt: Date;
}
