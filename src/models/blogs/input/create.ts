export type CreateBlog = {
  name: string,
  description: string,
  websiteUrl: string,
}

export type ExtendedCreateBlog = CreateBlog & {
  isMembership: boolean;
  createdAt: string;
}

export type CreatePostToBlog = {
  title: string,
  shortDescription: string,
  content: string,
}
