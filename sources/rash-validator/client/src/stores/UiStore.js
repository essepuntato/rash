import { extendObservable, action } from 'mobx'

class UiStore {
  constructor() {
    extendObservable(this, {
      width: window.innerWidth,
      height: window.innerHeight,
      codeFontSize: 12,
      isSnackbarOpen: false,
      openSnackBar: action(() => {
        this.isSnackbarOpen = true
        setTimeout(() => this.isSnackbarOpen = false, 4000)
      }),
      changeWidth: action((width) => this.width = width),
      changeHeight: action((height) => this.height = height),
      decreaseFontSize: action(() => this.codeFontSize > 1 ? this.codeFontSize-- : this.codeFontSize),
      increaseFontSize: action(() => this.codeFontSize++),
    })
  }
}

export default new UiStore()
