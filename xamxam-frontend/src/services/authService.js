import { login, logout, register, getUserProfile, updateUserProfile } from '../firebase/authService'
import { auth } from '../firebase/config'

export const authService = {
  login:             (email, password) => login(email, password),
  register:          (data)            => register(data),
  logout:            ()                => logout(),
  me:                ()                => auth.currentUser ? getUserProfile(auth.currentUser.uid) : null,
  updateProfile:     (data)            => auth.currentUser ? updateUserProfile(auth.currentUser.uid, data) : null,
  getCurrentUser:    ()                => auth.currentUser,
}
