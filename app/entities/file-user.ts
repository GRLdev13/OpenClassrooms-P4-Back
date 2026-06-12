import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { File } from './file';
import { User } from './user';

@Entity('File_User')
export class FileUser extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  idFile!: string;

  @Column({ type: 'uuid' })
  idUser!: string;

  // Relationships
  @ManyToOne(() => File, (file) => file.fileUsers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idFile' })
  file!: File;

  @ManyToOne(() => User, (user) => user.fileUsers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idUser' })
  user!: User;
}
