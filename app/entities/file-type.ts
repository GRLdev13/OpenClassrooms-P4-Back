import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { File } from './file';
import { Type } from './type';

@Entity('File_Type')
export class FileType extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  idType!: string;

  @Column({ type: 'uuid' })
  idFile!: string;

  // Relationships
  @ManyToOne(() => Type, (type) => type.fileTypes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idType' })
  type!: Type;

  @ManyToOne(() => File, (file) => file.fileTypes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idFile' })
  file!: File;
}
