export type CreatePost = {
  title: string,
  shortDescription: string,
  content: string,
  blogId: string,
}

export type ExtendedCreatePost = CreatePost & {
  blogName: string,
  createdAt: string,
}

export type CreateCommentToPost = {
  content: string,
}
