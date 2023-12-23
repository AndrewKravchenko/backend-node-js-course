export type CreatePost = {
  title: string,
  shortDescription: string,
  content: string,
  blogId: string,
}

export type ExtendedCreatePost = CreatePost & {
  createdAt: string,
  blogName: string,
}
