// import GuardService from '@/services/guard'

const Home = () => import('../pages/Home')
// const Login = () => import('../pages/Login')

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
      path: '',
      name: 'Home',
      component: Home
      // beforeEnter: (to, from, next) => GuardService.authorized(next)
    }
    // {
    //     name: 'Login',
    //     path: '/login',
    //     component: Login,
    //     beforeEnter: (to, from, next) => GuardService.registration(from, next)
    //   }
  ]
}
