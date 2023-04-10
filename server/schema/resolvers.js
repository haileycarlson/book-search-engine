const { AuthenticationError } = require('apollo-server-express')
const { User } = require('../models/User')
const { signToken } = require('../utils/auth')

const resolvers = {
  Query: {
    // get a single user by either their id or their username
    me: async (parent, args,context) => {
      if (context.user) {
        const user = await User.findOne({ _id: context.user._id }).select('-__v -password');
        return user;
      }
      throw new AuthenticationError('You need to be logged in!');
  },
 },

  Mutation: {
    addUser: async (parent, args) => {
      const user = await User.create(args)
      const token = signToken(user)
      return { token, user }
    },
    // login a user, sign a token, and send it back (to client/src/components/LoginForm.js)
    // {body} is destructured req.body
    loginUser: async (parent, { email, password }) => {
      const user = await User.findOne({ email })

      if (!user) {
        throw new AuthenticationError('No user found with this email address')
      }

      const correctPw = await user.isCorrectPassword(password)

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials')
      }
      const token = signToken(user)
      return { token, user }
    },
    // save a book to a user's `savedBooks` field by adding it to the set (to prevent duplicates)
    // user comes from `req.user` created in the auth middleware function
    saveBook: async (parent, { newBook }, context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $push: { savedBooks: newBook } },
          { new: true },
        )
        return updatedUser
      }
      throw new AuthenticationError('You need to be logged in!')
    },
    // remove a book from `savedBooks`
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true },
        )
        return updatedUser
      }
      throw new AuthenticationError('You need to be logged in!')
    },
  },
}

module.exports = resolvers
