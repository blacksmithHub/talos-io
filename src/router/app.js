import GuardService from '@/services/guard'

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
    },
    {
      path: '',
      name: 'Home',
      component: Home,
      redirect: '/',
      beforeEnter: (to, from, next) => GuardService.authorized(next),
      children: [
        {
          path: '/',
          name: 'Task',
          component: Task
        },
        {
          path: '/monitor',
          name: 'Monitor',
          component: Monitor
        },
        {
          path: '/profiles',
          name: 'Profiles',
          component: Profiles
        },
        {
          path: '/settings',
          name: 'Settings',
          component: Settings
        },
        {
          path: '/logs',
          name: 'Logs',
          component: Logs
        }
      ]
    }
  ]
}
