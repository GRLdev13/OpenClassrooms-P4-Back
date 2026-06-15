import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { FileUser } from './file-user';

@Entity('Users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({ type: 'varchar', length: 255 })
  firstname!: string;

  @Column({ type: 'varchar', length: 255 })
  lastname!: string;

  @Column({ type: 'bytea', nullable: true })
  picture!: Buffer;

  @Column({ type: 'boolean', default: false })
  hasVerifiedEmail!: boolean;

  // Relationships
  @OneToMany(() => FileUser, (fileUser) => fileUser.user, { cascade: true })
  fileUsers!: FileUser[];

  static findByName(email: string) {
    return this.createQueryBuilder('user')
      .where('user.email = :email', { email })
      .getOne();
  }

  static findById(id: string) {
    return this.createQueryBuilder('user')
      .where('user.id = :id', { id })
      .getOne();
  }
}
