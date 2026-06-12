import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { FileTag } from './file-tag';

@Entity('Tags')
export class Tag extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  // Relationships
  @OneToMany(() => FileTag, (fileTag) => fileTag.tag, { cascade: true })
  fileTags!: FileTag[];
}
