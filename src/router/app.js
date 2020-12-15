import GuardService from '@/services/guard'

const CheckUpdate = () => import('../pages/CheckUpdate')
const Login = () => import('../pages/Login')

const Home = () => import('../pages/Home')

const Task = () => import('../pages/Task')
const Monitor = () => import('../pages/Monitor')
const Profiles = () => import('../pages/Profiles')
const Proxies = () => import('../pages/Proxies')
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
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/check-update',
      name: 'CheckUpdate',
      component: CheckUpdate,
      beforeEnter: (to, from, next) => GuardService.authorized(next)
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
          path: '/proxies',
          name: 'Proxies',
          component: Proxies
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
