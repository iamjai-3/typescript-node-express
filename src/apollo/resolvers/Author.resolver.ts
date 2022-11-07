import { Arg, Mutation, Query, Resolver, ID } from 'type-graphql';
// import appDataSource from '../AppDataSource';
import mongoose from 'mongoose';
import { Author } from '../entities/Author.entity';

@Resolver()
export class AuthorResolver {
  @Query(() => String)
  healthCheck(): string {
    return 'Author GraphQL API Testing !!!';
  }

  //? Fetch all Authors
  @Query(() => [Author])
  fetchAuthors(): Promise<Author[]> {
    return Author.find({});
  }

  //? Fetch single Author
  @Query(() => Author, { nullable: true })
  fetchAuthor(@Arg('id') id: string): Promise<Author | undefined | null> {
    //! Another Method of accessing MongoDB
    // return appDataSource.getMongoRepository(Author).findOneBy({
    //   _id: new mongoose.Types.ObjectId(id),
    // });

    return Author.findOne({
      _id: new mongoose.Types.ObjectId(id),
    } as any);
  }

  //? Create New Author
  @Mutation(() => Author)
  createAuthor(@Arg('title') title: string): Promise<Author> {
    return Author.create({ title }).save();
  }

  //? Delete Author
  @Mutation(() => Boolean)
  deleteAuthor(@Arg('id') id: string): boolean {
    try {
      Author.delete({ _id: new mongoose.Types.ObjectId(id) } as any);
      return true;
    } catch (error) {
      return false;
    }
  }

  //? Update a Author
  @Mutation(() => Boolean, { nullable: true })
  updateAuthor(
    @Arg('id') id: string,
    @Arg('title') title: string
  ): boolean | null {
    const author = Author.findOne({
      _id: new mongoose.Types.ObjectId(id),
    } as any);

    if (!author) {
      return null;
    }

    try {
      Author.update({ _id: new mongoose.Types.ObjectId(id) } as any, {
        title,
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}
