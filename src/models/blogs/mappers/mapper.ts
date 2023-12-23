import { WithId } from 'mongodb'
import { BlogDB } from '../../db/db'
import { OutputBlog } from '../output/output'

export const blogMapper = (blogDB: WithId<BlogDB>): OutputBlog => {
  return {
    id: blogDB._id.toString(),
    name: blogDB.name,
    description: blogDB.description,
    websiteUrl: blogDB.websiteUrl,
    createdAt: blogDB.createdAt,
    isMembership: blogDB.isMembership,
  }
}