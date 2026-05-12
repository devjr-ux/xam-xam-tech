import * as fb from '../firebase/courseService'
import { auth } from '../firebase/config'
import { getUserProfile } from '../firebase/authService'

export const courseService = {
  getAll:          (params)      => fb.getPublishedCourses(params),
  getById:         (id)          => fb.getCourse(id),
  getCategories:   ()            => fb.getCategories(),

  create: async (data) => {
    const user = auth.currentUser
    const profile = await getUserProfile(user.uid)
    return fb.createCourse(user.uid, profile.name, data)
  },

  update:          (id, data)    => fb.updateCourse(id, data),
  delete:          (id)          => fb.deleteCourse(id),
  submit:          (id)          => fb.submitCourse(id),
  publish:         (id)          => fb.publishCourse(id),
  reject:          (id)          => fb.rejectCourse(id),
  uploadThumbnail: (id, file)    => fb.uploadThumbnail(id, file),
  getAllAdmin:      (filters)     => fb.getAllCourses(filters),
}
