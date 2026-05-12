import * as fbAdmin  from '../firebase/adminService'
import * as fbCourse from '../firebase/courseService'

export const adminService = {
  getDashboard:   ()             => fbAdmin.getAdminStats(),
  getStats:       ()             => fbAdmin.getAdminStats(),
  getUsers:       (params)       => fbAdmin.getUsers(params),
  updateUser:     (id, data)     => fbAdmin.updateUser(id, data),
  deleteUser:     (id)           => fbAdmin.updateUser(id, { status: 'deleted' }),
  getCourses:     (params)       => fbCourse.getAllCourses(params),
  publishCourse:  (id)           => fbCourse.publishCourse(id),
  rejectCourse:   (id)           => fbCourse.rejectCourse(id),
  deleteCourse:   (id)           => fbCourse.deleteCourse(id),
}
