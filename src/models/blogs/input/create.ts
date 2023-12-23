export type CreateBlog = {
  name: string,
  description: string,
  websiteUrl: string,
}

export type ExtendedCreateBlog = CreateBlog & {
  isMembership: boolean;
  createdAt: string;
}

