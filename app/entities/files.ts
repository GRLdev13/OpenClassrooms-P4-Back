import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { FileTag } from './file-tag';
import { User } from './users';

@Entity('Files')
export class Files extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'timestamp', nullable: false })
  expirationDate!: Date;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  physicalName!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  link!: string;

  @Column({ type: 'timestamp', nullable: false })
  uploadDate!: Date;

  @ManyToOne(() => User, (user) => user.files)
  user!: User;

  @OneToMany(() => FileTag, (fileTag) => fileTag.file, { cascade: true })
  fileTags!: FileTag[];
}
