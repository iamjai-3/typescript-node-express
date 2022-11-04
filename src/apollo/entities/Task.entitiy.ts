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
export class Task extends BaseEntity {
  @ObjectIdColumn()
  @Field(() => ID)
  id: ObjectId;

  @CreateDateColumn({ type: 'timestamp' })
  @Field({ nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  @Field({ nullable: true })
  updatedAt: Date;

  @Column()
  @Field(() => String)
  title: string;

  @Column()
  @Field(() => Boolean)
  isCompleted: boolean;
}
