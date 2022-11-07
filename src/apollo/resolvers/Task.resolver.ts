import { Arg, Mutation, Query, Resolver, ID } from 'type-graphql';
import { Task } from '../entities/Task.entitiy';
// import appDataSource from '../AppDataSource';
import mongoose from 'mongoose';

@Resolver()
export class TaskResolver {
  @Query(() => String)
  healthCheck(): string {
    return 'Task GraphQL API Testing !!!';
  }

  //? Fetch all Tasks
  @Query(() => [Task])
  fetchTasks(): Promise<Task[]> {
    return Task.find({});
  }

  //? Fetch single Task
  @Query(() => Task, { nullable: true })
  fetchTask(@Arg('id') id: string): Promise<Task | undefined | null> {
    //! Another Method of accessing MongoDB
    // return appDataSource.getMongoRepository(Task).findOneBy({
    //   _id: new mongoose.Types.ObjectId(id),
    // });

    return Task.findOne({
      _id: new mongoose.Types.ObjectId(id),
    } as any);
  }

  //? Create New Task
  @Mutation(() => Task)
  createTask(@Arg('title') title: string): Promise<Task> {
    return Task.create({ title, isCompleted: false }).save();
  }

  //? Delete Task
  @Mutation(() => Boolean)
  deleteTask(@Arg('id') id: string): boolean {
    try {
      Task.delete({ _id: new mongoose.Types.ObjectId(id) } as any);
      return true;
    } catch (error) {
      return false;
    }
  }

  //? Update a Task
  @Mutation(() => Boolean, { nullable: true })
  updateTask(
    @Arg('id') id: string,
    @Arg('isCompleted') isCompleted: boolean
  ): boolean | null {
    const task = Task.findOne({
      _id: new mongoose.Types.ObjectId(id),
    } as any);

    if (!task) {
      return null;
    }

    try {
      Task.update({ _id: new mongoose.Types.ObjectId(id) } as any, {
        isCompleted,
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}
