import React, { Component } from 'react'
import { css, StyleSheet } from 'aphrodite'
import Header from './Header'
import Toolbar from './Toolbar'
import Body from './Body'
import StateStore from '../stores/StateStore'
import uiStore from '../stores/UiStore'

const stateStore = new StateStore(uiStore)

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  }
})

class App extends Component {

  componentDidMount = () => {
    window.onresize = (e) => {
      uiStore.changeWidth(e.target.innerWidth)
      uiStore.changeHeight(e.target.innerHeight)
    }
  }

  render = () => {
    return (
      <div className={css(styles.container)}>
        <Header handleFile={stateStore.handleFile} />
        <Toolbar state={stateStore} ui={uiStore} />
        <Body state={stateStore} ui={uiStore} />
      </div>
    )
  }
}

export default App
