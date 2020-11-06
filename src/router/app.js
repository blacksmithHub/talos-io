// import GuardService from '@/services/guard'

const Update = () => import('../pages/Update')
const Login = () => import('../pages/Login')

const Home = () => import('../pages/Home')

const Task = () => import('../pages/Task')
const Monitor = () => import('../pages/Monitor')
const Profiles = () => import('../pages/Profiles')
const Settings = () => import('../pages/Settings')
const Logs = () => import('../pages/Logs')

/**
 * =======================================================================
 * App routes
 * =======================================================================
 *
 * Lazy loads component to initial page load improve performance.
 * Lazy load components are only loaded when a user is entering the route.
 * Access to this routes require user to be authenticated.
 *
 * =======================================================================
 */
export default {
  routes: [
    {
      path: '/update',
      name: 'Update',
      component: Update
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
      // beforeEnter: (to, from, next) => GuardService.registration(from, next)
    },
    {
      path: '',
      name: 'Home',
      component: Home,
      redirect: '/',
      children: [
        {
          path: '/',
          name: 'Task',
          component: Task
          // beforeEnter: (to, from, next) => GuardService.authorized(next)
        },
        {
          path: '/monitor',
          name: 'Monitor',
          component: Monitor
          // beforeEnter: (to, from, next) => GuardService.authorized(next)
        },
        {
          path: '/profiles',
          name: 'Profiles',
          component: Profiles
          // beforeEnter: (to, from, next) => GuardService.authorized(next)
        },
        {
          path: '/settings',
          name: 'Settings',
          component: Settings
          // beforeEnter: (to, from, next) => GuardService.authorized(next)
        },
        {
          path: '/logs',
          name: 'Logs',
          component: Logs
          // beforeEnter: (to, from, next) => GuardService.authorized(next)
        }
      ]
    }
  ]
}
