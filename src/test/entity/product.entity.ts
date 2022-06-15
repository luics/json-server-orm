/* eslint-disable @typescript-eslint/ban-types */
import { IsObject, IsString } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('simple-array')
  @IsString({ each: true })
  arr: string[];

  @Column('simple-json')
  @IsObject()
  obj: object;
}
