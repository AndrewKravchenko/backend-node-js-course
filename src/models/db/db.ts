import { Blog } from '../blogs/output'
import { Post } from '../posts/output'
import { Video } from '../videos/output'

export type DB = {
  videos: Video[],
  blogs: Blog[],
  posts: Post[],
}