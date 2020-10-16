import Config from '@/config/constant'

export default {
  namespaced: true,
  state () {
    return {
      items: [
        {
          id: Config.BANK.GCASH.id,
          name: Config.BANK.GCASH.name
        },
        {
          id: Config.BANK.BPI.id,
          name: Config.BANK.BPI.name
        },
        {
          id: Config.BANK.BDO.id,
          name: Config.BANK.BDO.name
        },
        {
          id: Config.BANK.PNB.id,
          name: Config.BANK.PNB.name
        }
      ]
    }
  }
}
