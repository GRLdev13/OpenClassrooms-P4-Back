import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';

@Entity('Type')
export class Type extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  icon!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  extension!: string | null;

  @Column({ type: 'boolean', default: false })
  isAllowed!: boolean;
}
