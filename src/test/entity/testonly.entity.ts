/* eslint-disable @typescript-eslint/ban-types */
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('testonlys')
export class Testonly {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('simple-array')
  tags: string[];

  @Column('simple-json')
  metadata: object;

  @Column()
  private: boolean;

  @Column()
  private1: boolean;

  @Column()
  weight: number;
}
