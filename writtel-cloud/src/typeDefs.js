import { gql } from 'apollo-server-express';

const typeDefs = gql`
  type Block {
    id: ID!
    slug: String!
    rendered: String!
    excerpt: String!
    private: Boolean!
  }

  type Post {
    id: ID!
    path: String!
    type: String!
    template: String!
    title: String!
    author: ID!
    publishedDate: String!
    modifiedDate: String!
    categories: [String!]!
    blocks: [Block!]!
  }

  type Category {
    id: ID!
    slug: String!
    parent: ID
    name: String!
    content: String!
  }

  type Author {
    id: ID!
    name: String!
  }

  type Site {
    id: ID!
    domain: String!
    title: String!
    posts(types: [String!], categories: [ID!], order: String, cursor: ID, limit: Int): PostsPaginated!
    post(path: String!): Post
    nextPost(post: ID!): Post
    prevPost(post: ID!): Post
    categories: [Category!]!
    category(category: ID!): Category
    categoryBySlug(slug: String!): Category
    users(roles: [String!], cursor: ID, limit: Int): SiteUsersPaginated!
    author(author: ID!): Author
  }

  type PostsPaginated {
    cursor: ID
    posts: [Post!]
  }

  type SiteUsersPaginated {
    cursor: ID
    users: [SiteUser!]
  }

  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    phone: String!
  }

  type SiteUser {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    siteName: String!
    role: String!
  }

  type LoginSalt {
    salt: String!
  }

  type Query {
    user: User
    loginSalt(email: String!): LoginSalt!
    sites: [Site!]!
    site(domain: String!): Site
  }

  input BlockInput {
    slug: String!
    rendered: String!
    excerpt: String
    private: Boolean!
  }

  type Mutation {
    login(
      email: String!
      password: String!
      hashed: Boolean
    ): LoginMutationResponse!

    createSite(
      domain: String!
      title: String!
    ): CreateSiteMutationResponse!

    createUser(
      email: String!
      firstName: String!
      lastName: String!
      phone: String!
      password: String!
      hashed: Boolean
    ): CreateUserMutationResponse!

    createPost(
      site: ID!
      path: String!
      type: String!
      template: String!
      title: String!
      author: ID
      publishedDate: String!
      categories: [ID!]
      blocks: [BlockInput!]
    ): CreatePostMutationResponse!

    updatePost(
      site: ID!
      post: ID!
      path: String
      type: String
      template: String
      title: String
      author: ID
      publishedDate: String
      categories: [ID!]
      blocks: [BlockInput!]
    ): UpdatePostMutationResponse!

    deletePost(
      site: ID!
      post: ID!
    ): DeletePostMutationResponse!

    createCategory(
      site: ID!
      slug: String!
      parent: ID
      name: String!
      content: String
    ): CreateCategoryMutationResponse!

    updateCategory(
      site: ID!
      category: ID!
      slug: String
      parent: ID
      name: String
      content: String
    ): UpdateCategoryMutationResponse!

    deleteCategory(
      site: ID!
      category: ID!
    ): DeleteCategoryMutationResponse!
  }

  interface MutationResponse {
    code: String!
    success: Boolean!
    message: String!
  }

  type LoginMutationResponse implements MutationResponse {
    code: String!
    success: Boolean!
    message: String!
    token: String
  }

  type UpdatePostMutationResponse implements MutationResponse {
    code: String!
    success: Boolean!
    message: String!
    post: Post
  }

  type CreatePostMutationResponse implements MutationResponse {
    code: String!
    success: Boolean!
    message: String!
    post: Post
  }

  type DeletePostMutationResponse implements MutationResponse {
    code: String!
    success: Boolean!
    message: String!
  }

  type UpdateCategoryMutationResponse implements MutationResponse {
    code: String!
    success: Boolean!
    message: String!
    category: Category
  }

  type CreateCategoryMutationResponse implements MutationResponse {
    code: String!
    success: Boolean!
    message: String!
    category: Category
  }

  type DeleteCategoryMutationResponse implements MutationResponse {
    code: String!
    success: Boolean!
    message: String!
  }

  type CreateSiteMutationResponse implements MutationResponse {
    code: String!
    success: Boolean!
    message: String!
    site: Site
  }

  type CreateUserMutationResponse implements MutationResponse {
    code: String!
    success: Boolean!
    message: String!
    user: User
  }
`;

module.exports = typeDefs;
