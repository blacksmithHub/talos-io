const Home = () => import('../pages/Home')
const Monitor = () => import('../pages/Monitor')
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
      path: '',
      name: 'Home',
      component: Home
    },
    {
      path: '/monitor',
      name: 'Monitor',
      component: Monitor
    },
    {
      path: '/settings',
      name: 'Settings',
      component: Settings
    }
  ]
}
