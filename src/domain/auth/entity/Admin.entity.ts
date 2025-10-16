import { Entity, PrimaryColumn, Column } from 'typeorm';
import * as crypto from 'crypto';

@Entity('tbl_admins')
export class Admin {
  @PrimaryColumn({ name: 'admin_id', type: 'varchar', length: 36 })
  id: string;

  @Column({ name: 'username', type: 'varchar', length: 50, nullable: false, unique: true })
  username: string;

  @Column({ name: 'password', type: 'varchar', length: 255, nullable: false })
  password: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  static create(username: string, hashedPassword: string): Admin {
    const admin = new Admin();
    admin.id = crypto.randomUUID();
    admin.username = username;
    admin.password = hashedPassword;
    return admin;
  }
}
