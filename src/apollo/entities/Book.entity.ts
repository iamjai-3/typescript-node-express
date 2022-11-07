import { ObjectId } from 'mongoose';
import { Field, ID, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class Book extends BaseEntity {
  @ObjectIdColumn()
  @Field(() => ID)
  _id: ObjectId;

  @Column()
  @Field(() => String)
  title: string;

  @Column()
  @Field(() => ID)
  author: string;

  @CreateDateColumn({ type: 'timestamp' })
  @Field({ nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  @Field({ nullable: true })
  updatedAt: Date;
}
