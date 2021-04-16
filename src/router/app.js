import GuardService from '@/services/guard'

const Home = () => import('../pages/Home')
const Monitor = () => import('../pages/Monitor')
const Login = () => import('../pages/Login')

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
      component: Login
    },
    {
      path: '',
      component: Home,
      beforeEnter: (to, from, next) => GuardService.authorized(next)
    },
    {
      path: '/monitor',
      name: 'Monitor',
      component: Monitor,
      beforeEnter: (to, from, next) => GuardService.authorized(next)
    }
  ]
}
