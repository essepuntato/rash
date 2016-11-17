import React, { PropTypes } from 'react'
import { css, StyleSheet } from 'aphrodite'
import AppBar from 'material-ui/AppBar'
import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'
import IconButton from 'material-ui/IconButton'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'

const styles = StyleSheet.create({
  iconButton: {
    color: 'white',
  }
})

const Menu = () =>
  <IconMenu
    iconButtonElement={<IconButton><MoreVertIcon className={css(styles.iconButton)} /></IconButton>}
    anchorOrigin={{horizontal: 'right', vertical: 'top'}}
    targetOrigin={{horizontal: 'right', vertical: 'top'}}
  >
    <MenuItem primaryText="What is RASH" href="https://github.com/essepuntato/rash" />
  </IconMenu>

const Header = () =>
  <AppBar
    title={<span>RASH Validator</span>}
    iconElementRight={<Menu />}
    showMenuIconButton={false}
  />

Header.propTypes = {
  handleFile: PropTypes.func.isRequired,
}

export default Header
