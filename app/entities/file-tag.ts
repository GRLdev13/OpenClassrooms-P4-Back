import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { File } from './file';
import { Tag } from './tag';

@Entity('File_Tags')
export class FileTag extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  idTags!: string;

  @Column({ type: 'uuid' })
  idFile!: string;

  // Relationships
  @ManyToOne(() => Tag, (tag) => tag.fileTags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idTags' })
  tag!: Tag;

  @ManyToOne(() => File, (file) => file.fileTags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idFile' })
  file!: File;
}
