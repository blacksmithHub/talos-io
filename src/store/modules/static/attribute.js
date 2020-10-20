import productApi from '@/api/magento/titan22/product'
import App from '@/config/app'

export default {
  namespaced: true,
  state () {
    return {
      loading: false,
      items: localStorage.getItem('attributes')
        ? JSON.parse(localStorage.getItem('attributes'))
        : []
    }
  },

  mutations: {
    /**
     * Reset all items.
     *
     * @param {*} state
     */
    RESET (state) {
      state.items = []
    },

    /**
     * Store all items.
     *
     * @param {*} state
     * @param {*} items
     */
    SET_ITEMS (state, items) {
      state.items = items
    }
  },

  actions: {
    /**
     * Trigger reset.
     *
     * @param {*} param
     */
    reset ({ commit }) {
      commit('RESET')
      if (localStorage.getItem('attributes')) localStorage.removeItem('attributes')
    },

    /**
     * Trigger store items.
     *
     * @param {*} param
     * @param {*} items
     */
    setItems ({ commit }, items) {
      commit('SET_ITEMS', items)
      localStorage.setItem('attributes', JSON.stringify(items))
    },

    /**
     * Initialize items.
     *
     * @param {*} param
     */
    async initializeItems ({ dispatch }) {
      dispatch('reset')

      const token = App.services.titan22.token

      const footwears = await dispatch('fetchAttributes', { value: 'm_footwear_size', token: token })

      const apparels = await dispatch('fetchAttributes', { value: 'm_apparel_size', token: token })

      const attributes = [footwears, apparels]

      dispatch('setItems', attributes)
    },

    /**
     * Fetch attributes from API.
     *
     * @param {*} params
     */
    async fetchAttributes ({ commit }, params) {
      const attribute = await productApi.attribute({
        searchCriteria: {
          filterGroups: [
            {
              filters: [
                {
                  field: 'attribute_code',
                  value: params.value
                }
              ]
            }
          ]
        }
      }, params.token)

      if (!attribute) return {}

      const sizes = attribute.items[0].options.filter((data) => data.value).map((item) => {
        item.label = item.label.toLowerCase()

        return item
      })

      const response = {
        attribute_id: attribute.items[0].attribute_id,
        sizes: sizes
      }

      return response
    }
  }
}
