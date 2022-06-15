import { IsInt, Length } from 'class-validator';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Comment } from './comment.entity';
import { Group } from './group.entity';
import { Tag } from './tag.entity';
import { User } from './user.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ width: 50 })
  @Length(5, 50)
  title: string;

  @Column()
  @IsInt()
  userId: number;

  @Column()
  @IsInt()
  groupId: number;

  @ManyToOne(() => User, (user) => user.posts)
  user: User;

  @ManyToOne(() => Group, (group) => group.posts)
  group: Group;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => Tag, (tag) => tag.post)
  tags: Tag[];
}
