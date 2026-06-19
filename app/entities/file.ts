import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { FileUser } from './file-user';
import { FileTag } from './file-tag';

@Entity('File')
export class File extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'timestamp', nullable: true })
  expirationDate!: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  link!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  uploadDate!: Date | null;

  @Column({ type: 'bytea', nullable: true })
  rawData!: Buffer | null;

  // Relationships
  @OneToMany(() => FileUser, (fileUser) => fileUser.file, { cascade: true })
  fileUsers!: FileUser[];

  @OneToMany(() => FileTag, (fileTag) => fileTag.file, { cascade: true })
  fileTags!: FileTag[];
}
