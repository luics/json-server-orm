import { IsString, Length } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from './post.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20 })
  @Length(1, 20)
  name: string;

  @Column()
  @IsString()
  token: string;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];
}
