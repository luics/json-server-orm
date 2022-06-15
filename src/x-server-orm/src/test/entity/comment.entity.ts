import { IsInt, Length } from 'class-validator';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from './post.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ width: 140 })
  @Length(5, 140)
  body: string;

  @Column()
  @IsInt()
  postId: number;

  @ManyToOne(() => Post, (post: Post) => post.comments)
  post: Post;
}
