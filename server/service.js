module.exports = {
  status: {
    stopped: 1,
    running: 2
  },
  api: {
    customer_login: `${process.env.VUE_APP_TITAN_URL}/rest/default/V1/integration/customer/token`,
    customer_account: `${process.env.VUE_APP_TITAN_URL}/rest/default/V1/customers/me`,
    cart: `${process.env.VUE_APP_TITAN_URL}/rest/V1/carts/mine`,
    delete_cart: `${process.env.VUE_APP_TITAN_URL}/rest/V1/carts/mine/items`,
    add_to_cart: `${process.env.VUE_APP_TITAN_URL}/rest/V1/carts/mine/items`,
    estimate_shipping: `${process.env.VUE_APP_TITAN_URL}/rest/V1/carts/mine/estimate-shipping-methods-by-address-id`,
    set_shipping: `${process.env.VUE_APP_TITAN_URL}/rest/V1/carts/mine/shipping-information`,
    place_order: `${process.env.VUE_APP_TITAN_URL}/rest/V1/carts/mine/payment-information`,
    paymaya: `${process.env.VUE_APP_TITAN_URL}/paymaya/checkout/start`,
    get_transaction: `${process.env.VUE_APP_TITAN_URL}/ccpp/htmlredirect/gettransactiondata`,
    credit_card_checkout: `${process.env.VUE_APP_2C2P_URL}/RedirectV3/Payment`,
    search_product: `${process.env.VUE_APP_TITAN_URL}/rest/V2/products`,
    product_attributes: `${process.env.VUE_APP_TITAN_URL}/rest/V2/products/attributes`
  },
  site: process.env.VUE_APP_TITAN_URL,
  token: process.env.VUE_APP_TITAN_ADMIN_TOKEN,
  tasks: []
}
