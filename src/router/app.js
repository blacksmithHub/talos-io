import GuardService from '@/services/guard'

const CheckUpdate = () => import('../pages/CheckUpdate')
const Login = () => import('../pages/Login')

const Home = () => import('../pages/Home')

const Task = () => import('../pages/Task')
const Monitor = () => import('../pages/Monitor')
const Profiles = () => import('../pages/Profiles')
const Settings = () => import('../pages/Settings')

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
      path: '/check-update',
      name: 'CheckUpdate',
      component: CheckUpdate
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
        }
      ]
    }
  ]
}
