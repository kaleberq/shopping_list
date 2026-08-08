import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('email_verification_code')
export class EmailVerificationCodeOrmEntity {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ name: 'code_hash', type: 'varchar', length: 255 })
  codeHash!: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
