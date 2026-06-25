import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';

import { Files } from './files';

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

  @Column({ type: 'boolean', default: false })
  hasVerifiedEmail!: boolean;
  @OneToMany(() => Files, (file) => file.user, { cascade: true })
  files!: Files[];

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
