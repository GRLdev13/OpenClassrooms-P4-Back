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

  @Column({type:'uuid', nullable:true}) //can be null for anonymous uploader
  id_user!:string

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
 @ManyToOne(() => User, (user) => user.files)
  user!: User

  @OneToMany(() => FileTag, (fileTag) => fileTag.file, { cascade: true })
  fileTags!: FileTag[];
}
