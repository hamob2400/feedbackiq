import jwt from 'jsonwebtoken'
import { config } from './config.js'

export function signToken(user) {
  return jwt.sign(
    { uid: user.id, email: user.email },
    config.jwtSecret,
    { expiresIn: '30d' }
  )
}

export function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret)
}
