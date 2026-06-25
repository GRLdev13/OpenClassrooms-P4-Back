import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Files } from './files';
import { Tag } from './tag';

@Entity('File_Tags')
export class FileTag extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  idTag!: string;

  @Column({ type: 'uuid' })
  idFile!: string;

  // Relationships
  @ManyToOne(() => Tag, (tag) => tag.fileTags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idTag' })
  tag!: Tag;

  @ManyToOne(() => Files, (file) => file.fileTags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idFile' })
  file!: Files;
}
