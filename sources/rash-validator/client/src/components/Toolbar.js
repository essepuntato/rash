import React from 'react'
import { observer } from 'mobx-react'
import { css, StyleSheet } from 'aphrodite'
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from 'material-ui/Toolbar'
import LinearProgress from 'material-ui/LinearProgress'
import RaisedButton from 'material-ui/RaisedButton'
import IconButton from 'material-ui/IconButton'
import Toggle from 'material-ui/Toggle'
import AddIcon from 'material-ui/svg-icons/content/add'
import RemoveIcon from 'material-ui/svg-icons/content/remove'

const styles = StyleSheet.create({
  toolbar: {
    padding: '0px 6px 0px 24px'
  },
  fakeLinear: {
    position: 'relative',
    height: '4px',
    display: 'block',
    width: '100%',
    backgroundColor: 'rgb(189, 189, 189)',
    borderRadius: '2px',
    margin: '0px',
    overflow: 'hidden',
  },
  toolbarTitle: {
    padding: '0px 24px 0px 24px',
    transition: 'color 1s ease',
  },
  toolbarFont: {
    padding: '0',
    fontSize: '16px',
  },
  fileValidHint: {
    color: '#43A047',
  },
  fileInvalidHint: {
    color: '#E53935',
  },
  toolbarIconButton: {
    width: '56px',
    height: '56px',
  },
  toolbarIcon: {
    color: '#424242',
  },
  inputFile: {
    width: '0px',
    height: '0px',
  	opacity: 0,
  	overflow: 'hidden',
  	position: 'absolute',
  	zIndex: -1,
  },
  toggle: {
    width: '180px',
    padding: '17px',
    display: 'block',
  },
})

const inlineStyles = {
  toggleLabel: {
    fontSize: '16px',
  },
}

const FakeLinear = () =>
  <div className={css(styles.fakeLinear)}></div>

const MyToolbar = observer(class MyToolbar extends React.Component {

  selectFile = (e) => {
    if (this.fileinput) {
      var evt = document.createEvent("MouseEvents")
      evt.initEvent("click", true, false)
      this.fileinput.dispatchEvent(evt)
    }
  }

  dispatchFile = (e) => {
    this.props.handleFile(e.target.files[0])
  }

  componentDidMount = () => {
    this.fileinput.addEventListener('change', this.dispatchFile, false)
  }

  componentWillUnmount = () => {
    this.fileinput.removeEventListener('change', this.dispatchFile, false)
  }

  render = () => {
    const errorsNumber = this.props.errors.length
    let titleText = ''
    let hintClass = ''
    if (!this.props.userBeganToWrite) {
      titleText = 'Open a file or start editing'
    } else {
      if (errorsNumber) {
        titleText = `Errors: ${errorsNumber}`
        hintClass = styles.fileInvalidHint
      } else {
        titleText = 'Valid'
        hintClass = styles.fileValidHint
      }
    }
    return (
      <div>
        <Toolbar className={css(styles.toolbar)}>
          <ToolbarGroup firstChild={true}>
            <ToolbarTitle text={titleText} className={css(styles.toolbarTitle, hintClass)} />
            <ToolbarSeparator />
            <Toggle
              label="Convert to XHTML"
              labelStyle={inlineStyles.toggleLabel}
              labelPosition="right"
              className={css(styles.toggle)}
              onToggle={this.props.onConversionToggle}
            />
          </ToolbarGroup>
          <ToolbarGroup>
            {/* <ToolbarTitle text={'Font size'} className={css(styles.toolbarFont)} /> */}
            <IconButton
              onTouchTap={this.props.decreaseFontSize}
              className={css(styles.toolbarIconButton)}
            >
              <RemoveIcon className={css(styles.toolbarIcon)} />
            </IconButton>
            <IconButton
              onTouchTap={this.props.increaseFontSize}
              className={css(styles.toolbarIconButton)}
            >
              <AddIcon className={css(styles.toolbarIcon)} />
            </IconButton>
            <RaisedButton label="Upload File" primary={true} onTouchTap={this.selectFile} />
          </ToolbarGroup>
        </Toolbar>
        {this.props.isValidatingCode ? <LinearProgress mode="indeterminate" /> : <FakeLinear />}
        <input className={css(styles.inputFile)} type="file" ref={(input) => this.fileinput = input} />
      </div>
    )
  }

})

MyToolbar.propTypes = {
  errors: React.PropTypes.object,
  handleFile: React.PropTypes.func.isRequired,
  isValidatingCode: React.PropTypes.bool.isRequired,
  userBeganToWrite: React.PropTypes.bool.isRequired,
  increaseFontSize: React.PropTypes.func.isRequired,
  decreaseFontSize: React.PropTypes.func.isRequired,
  onConversionToggle: React.PropTypes.func.isRequired,
}

const ToolbarContainer = observer(
  ({
    state: { errors, handleFile, isValidatingCode, userBeganToWrite, onConversionToggle },
    ui: { increaseFontSize, decreaseFontSize }
  }) =>
    <MyToolbar
      errors={errors}
      handleFile={handleFile}
      isValidatingCode={isValidatingCode}
      increaseFontSize={increaseFontSize}
      decreaseFontSize={decreaseFontSize}
      userBeganToWrite={userBeganToWrite}
      onConversionToggle={onConversionToggle}
    />
)

ToolbarContainer.propTypes = {
  state: React.PropTypes.object.isRequired,
  ui: React.PropTypes.object.isRequired,
}

export default ToolbarContainer
