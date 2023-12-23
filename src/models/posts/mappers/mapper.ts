import { WithId } from 'mongodb'
import { PostDB } from '../../db/db'
import { OutputPost } from '../output/output'

export const postMapper = (postDB: WithId<PostDB>): OutputPost => {
  return {
    id: postDB._id.toString(),
    title: postDB.title,
    shortDescription: postDB.shortDescription,
    content: postDB.content,
    blogId: postDB.blogId,
    blogName: postDB.blogName,
    createdAt: postDB.createdAt,
  }
}