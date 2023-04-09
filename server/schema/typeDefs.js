const typeDefs = `#graphql

type User {
    _id: ID
    username: String
    email: String
    bookCount: Int
    savedBooks: [Book] 
}

type Book {
    bookId: ID!
    authors: [String]
    description: String
    title: String
    image: String
    link: String
}

type Auth {
    token: String
    user: User
  }

  type Query {
    user: User
  }


type Mutation {
    loginUser(email: String!, password: String!): Auth
    addUser(username: String!, email: String!, password: String!): Auth
    saveBook(bookId: ID!): User
    removeBook(bookId: ID!): User
}

















`

module.exports = typeDefs
