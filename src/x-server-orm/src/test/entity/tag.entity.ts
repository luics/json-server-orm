import { IsInt, Length } from 'class-validator';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from './post.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20 })
  @Length(1, 20)
  name: string;

  @Column()
  @IsInt()
  postId: number;

  @ManyToOne(() => Post, (post) => post.tags)
  post?: Post;
}
