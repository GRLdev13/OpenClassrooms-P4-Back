import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { FileUser } from './file-user';
import { FileTag } from './file-tag';
import { FileType } from './file-type';

@Entity('File')
export class File extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  url!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  hosting!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  expirationDate!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  uploadDate!: Date | null;

  @Column({ type: 'bytea', nullable: true })
  rawData!: Buffer | null;

  // Relationships
  @OneToMany(() => FileUser, (fileUser) => fileUser.file, { cascade: true })
  fileUsers!: FileUser[];

  @OneToMany(() => FileTag, (fileTag) => fileTag.file, { cascade: true })
  fileTags!: FileTag[];

  @OneToMany(() => FileType, (fileType) => fileType.file, { cascade: true })
  fileTypes!: FileType[];
}
