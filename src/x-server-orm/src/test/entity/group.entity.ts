import { Length } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from './post.entity';

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20 })
  @Length(1, 20)
  name: string;

  @OneToMany(() => Post, (post) => post.group)
  posts?: Post[];
}
