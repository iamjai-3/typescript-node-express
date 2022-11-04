import { Arg, Mutation, Query, Resolver } from 'type-graphql';
import { Task } from '../entities/Task.entitiy';

@Resolver()
export class TaskResolver {
  @Query(() => String)
  test(): string {
    return 'GraphQL Testing !!!';
  }

  @Mutation(() => Task)
  createTask(@Arg('title', () => String) title: string): Promise<Task> {
    return Task.create({ title, isCompleted: false }).save();
  }
}
