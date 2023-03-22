const { AuthenticationError } = require('apollo-server-express')
const { User } = require('../models/User')
const { signToken } = require('../utils/auth')

const resolvers = {
  Query: {
    // get a single user by either their id or their username
    user: async (parent, { username }) => {
      return User.findOne({ username }).populate('savedBooks')
    },
  },

  Mutation: {
    createUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password })
      const token = signToken(user)
      return { token, user }
    },
    // login a user, sign a token, and send it back (to client/src/components/LoginForm.js)
    // {body} is destructured req.body
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email })

      if (!user) {
        throw new AuthenticationError('No user found with this email address')
      }

      const correctPw = await user.isCorrectPassword(password)

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials')
      }
      const token = signToken(user)
      res.json({ token, user })
    },
    // save a book to a user's `savedBooks` field by adding it to the set (to prevent duplicates)
    // user comes from `req.user` created in the auth middleware function
    saveBook: async (parent, { user, body }, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          { $addToSet: { savedBooks: body } },
          { new: true, runValidators: true },
        )
        return updatedUser
      }
      throw new AuthenticationError('You need to be logged in!')
    },
    // remove a book from `savedBooks`
    removeBook: async (parent, { user, params }, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          { $pull: { savedBooks: { bookId: params.bookId } } },
          { new: true },
        )
        return res.json(updatedUser)
      }
      throw new AuthenticationError('You need to be logged in!')
    },
  },
}

module.exports = resolvers
