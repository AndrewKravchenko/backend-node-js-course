import { postCollection } from '../db/db'
import { OutputPost, OutputPosts } from '../models/posts/output/output'
import { UpdatePost } from '../models/posts/input/update'
import { postMapper } from '../models/posts/mappers/mapper'
import { ExtendedCreatePost } from '../models/posts/input/create'
import { ObjectId } from 'mongodb'
import { QueryPost } from '../models/posts/input/query'
import { paginationSkip } from '../utils/queryParams'

export class PostRepository {
  static async getAllPosts(sortData: QueryPost): Promise<OutputPosts> {
    const sortBy = sortData.sortBy || 'createdAt'
    const sortDirection = sortData.sortDirection || 'desc'
    const pageNumber = Number(sortData.pageNumber || 1)
    const pageSize = Number(sortData.pageSize || 10)

    const posts = await postCollection
      .find({})
      .sort(sortBy, sortDirection)
      .skip(paginationSkip(pageNumber, pageSize))
      .limit(pageSize)
      .toArray()

    const totalCount = await postCollection.countDocuments({})
    const pagesCount = Math.ceil(totalCount / pageSize)

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: posts.map(postMapper)
    }
  }

  static async getPostById(id: string): Promise<OutputPost | null> {
    const post = await postCollection.findOne({ _id: new ObjectId(id) })

    if (!post) {
      return null
    }

    return postMapper(post)
  }

  static async createPost(newPost: ExtendedCreatePost): Promise<string> {
    const { insertedId } = await postCollection.insertOne(newPost)

    return insertedId.toString()
  }

  static async updatePost(id: string, updatedPostData: UpdatePost): Promise<boolean> {
    const result = await postCollection.updateOne({ _id: new ObjectId(id) }, {
      $set: updatedPostData
    })

    return !!result.matchedCount
  }

  static async deletePost(id: string): Promise<boolean> {
    const result = await postCollection.deleteOne({ _id: new ObjectId(id) })

    return !!result.deletedCount
  }
}