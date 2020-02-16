import gql from 'graphql-tag';

export const getLoginSalt = gql`
  query getLoginSalt($email: String!) {
    loginSalt(email: $email) {
      salt
    }
  }
`;

export const login = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password, hashed: true) {
      code
      success
      message
      token
    }
  }
`;

export const getUser = gql`
  query getUser {
    user {
      id
      email
      phone
      firstName
      lastName
    }
  }
`;

export const getSite = gql`
  query getSite($domain: String!) {
    site(domain: $domain) {
      id
      domain
      title
    }
  }
`;

export const getSiteUsers = gql`
  query getSiteUsers(
    $domain: String!
    $roles: [String!]
    $cursor: ID
    $limit: Int
  ) {
    site(domain: $domain) {
      id
      users(roles: $roles, cursor: $cursor, limit: $limit) {
        cursor
        users {
          id
          email
          firstName
          lastName
          siteName
          role
        }
      }
    }
  }
`;

export const getAuthor = gql`
  query getAuthor(
    $domain: String!
    $author: ID!
  ) {
    site(domain: $domain) {
      id
      author(author: $author) {
        id
        name
      }
    }
  }
`;

export const getPost = gql`
  query getPost($domain: String!, $path: String!) {
    site(domain: $domain) {
      id
      domain
      title
      post(path: $path) {
        id
        path
        type
        template
        title
        author
        publishedDate
        modifiedDate
        blocks {
          id
          slug
          rendered
          private
        }
      }
    }
  }
`;

export const getPosts = gql`
  query getPosts(
    $domain: String!
    $types: [String!]
    $categories: [ID!]
    $cursor: ID
    $limit: Int
  ) {
    site(domain: $domain) {
      id
      posts(
        types: $types
        categories: $categories
        cursor: $cursor
        limit: $limit
      ) {
        cursor
        posts {
          id
          path
          type
          template
          title
          author
          categories
          publishedDate
          modifiedDate
        }
      }
    }
  }
`;

export const getPostsWithBlocks = gql`
  query getPosts(
    $domain: String!
    $types: [String!]
    $categories: [ID!]
    $cursor: ID
    $limit: Int
  ) {
    site(domain: $domain) {
      id
      posts(
        types: $types
        categories: $categories
        cursor: $cursor
        limit: $limit
      ) {
        cursor
        posts {
          id
          path
          type
          template
          title
          author
          publishedDate
          modifiedDate
          blocks {
            id
            slug
            rendered
            private
          }
        }
      }
    }
  }
`;

export const getPostsWithExcerpts = gql`
  query getPosts(
    $domain: String!
    $types: [String!]
    $categories: [ID!]
    $cursor: ID
    $limit: Int
  ) {
    site(domain: $domain) {
      id
      posts(
        types: $types
        categories: $categories
        cursor: $cursor
        limit: $limit
      ) {
        cursor
        posts {
          id
          path
          type
          template
          title
          author
          publishedDate
          modifiedDate
          blocks {
            id
            slug
            excerpt
            private
          }
        }
      }
    }
  }
`;

export const getNextPost = gql`
  query getNextPost($domain: String!, $post: ID!) {
    site(domain: $domain) {
      id
      nextPost(post: $post) {
        id
        path
        title
      }
    }
  }
`;

export const getPrevPost = gql`
  query getPrevPost($domain: String!, $post: ID!) {
    site(domain: $domain) {
      id
      prevPost(post: $post) {
        id
        path
        title
      }
    }
  }
`;

export const getCategory = gql`
  query getCategory($domain: String!, $category: ID!) {
    site(domain: $domain) {
      id
      category(category: $category) {
        id
        slug
        name
        parent
        content
      }
    }
  }
`;

export const getCategoryBySlug = gql`
  query getCategoryBySlug($domain: String!, $slug: String!) {
    site(domain: $domain) {
      id
      categoryBySlug(slug: $slug) {
        id
        slug
        name
        parent
        content
      }
    }
  }
`;

export const getCategories = gql`
  query getCategories($domain: String!) {
    site(domain: $domain) {
      id
      categories {
        id
        slug
        name
        parent
      }
    }
  }
`;

export const getCategoriesWithContent = gql`
  query getCategoriesWithContent($domain: String!) {
    site(domain: $domain) {
      id
      categories {
        id
        slug
        name
        parent
        content
      }
    }
  }
`;

export const createPost = gql`
  mutation createPost(
    $site: ID!
    $path: String!
    $type: String!
    $template: String!
    $title: String!
    $categories: [ID!]
    $author: ID
    $publishedDate: String!
    $blocks: [BlockInput!]!) {
    createPost(
      site: $site
      path: $path
      type: $type
      template: $template
      title: $title
      author: $author
      categories: $categories
      publishedDate: $publishedDate
      blocks: $blocks
    ) {
      code
      success
      message
      post {
        id
        path
        type
        template
        title
        categories
        author
        publishedDate
        modifiedDate
        blocks {
          id
          rendered
          private
        }
      }
    }
  }
`;

export const updatePost = gql`
  mutation updatePost(
    $site: ID!
    $post: ID!
    $path: String
    $type: String
    $template: String
    $title: String
    $author: ID
    $publishedDate: String
    $categories: [ID!]
    $blocks: [BlockInput!]) {
    updatePost(
      site: $site
      post: $post
      path: $path
      type: $type
      template: $template
      title: $title
      author: $author
      publishedDate: $publishedDate
      categories: $categories
      blocks: $blocks
    ) {
      code
      success
      message
      post {
        id
        path
        type
        template
        title
        author
        categories
        publishedDate
        modifiedDate
        blocks {
          id
          rendered
          private
        }
      }
    }
  }
`;

export const createCategory = gql`
  mutation createCategory(
    $site: ID!
    $slug: String!
    $name: String!
    $parent: ID
    $content: String!
  ) {
    createCategory(
      site: $site
      slug: $slug
      name: $name
      parent: $parent
      content: $content
    ) {
      code
      success
      message
      category {
        id
        slug
        name
        parent
        content
      }
    }
  }
`;

export const updateCategory = gql`
  mutation updateCategory(
    $site: ID!
    $category: ID!
    $slug: String
    $name: String
    $parent: ID
    $content: String
  ) {
    updateCategory(
      site: $site
      category: $category
      slug: $slug
      name: $name
      parent: $parent
      content: $content
    ) {
      code
      success
      message
      category {
        id
        slug
        name
        parent
        content
      }
    }
  }
`;
