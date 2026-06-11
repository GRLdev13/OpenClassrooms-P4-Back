import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string = '';

  @Column()
  email: string = '';

  @Column()
  hasVerifiedEmail: boolean = false;

  static findByName(email: string) {
    return this.createQueryBuilder('user')
      .where('user.email = :email', { email })
      .getOne();
  }

  static findById(id: string) {
    return this.createQueryBuilder('user')
      .where('user.guid = :id', { id })
      .getOne();
  }
}
