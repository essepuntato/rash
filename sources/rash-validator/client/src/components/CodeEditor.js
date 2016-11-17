import React from 'react'
import { StyleSheet, css } from 'aphrodite'
import AceEditor from 'react-ace'
import Snackbar from 'material-ui/Snackbar'

import 'brace/mode/html'
import 'brace/theme/tomorrow'

const styles = StyleSheet.create({
  rashErrorMarker: {
    position: 'absolute',
    borderBottom: '1px',
    borderBottomStyle: 'dashed',
    borderBottomColor: 'red',
  },
  xmlErrorMarker: {
    position: 'absolute',
    borderBottom: '1px',
    borderBottomStyle: 'dashed',
    borderBottomColor: 'blue',
  },
})

class CodeEditor extends React.Component {

  componentDidMount = () => {
    this.editor.addEventListener('dragover', this.handleDragOver)
    this.editor.addEventListener('drop', this.dispatchFile)
  }

  componentWillUnmount = () => {
    this.editor.removeEventListener('dragover', this.handleDragOver)
    this.editor.removeEventListener('drop', this.dispatchFile)
  }

  handleDragOver = (e) => {
    e.stopPropagation()
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  dispatchFile = (e) => {
    e.stopPropagation()
    e.preventDefault()
    this.props.handleFile(e.dataTransfer.files[0])
  }

  render = () => {
    const annotations = this.props.errors.map((error) => ({
      row: error.row,
      column: error.column,
      type: 'error',
      text: error.message.replace(/(.{80})/g, "$1\n"),
    }))
    const markers = this.props.errors.map((error) => ({
      startRow: error.row, endRow: error.row+1, type: 'text',
      className: error.type === 'RASH' ? css(styles.rashErrorMarker) : css(styles.xmlErrorMarker),
    }))
    return (
      <div ref={(editor) => this.editor = editor}>
        <AceEditor
          theme="tomorrow"
          mode="html"
          name="rash_editor"
          editorProps={{$blockScrolling: Infinity}}
          setOptions={{useWorker: false}}
          value={this.props.code}
          tabSize={2}
          onChange={(newCode) => {
            this.props.changeCode(newCode)
            this.props.validateCode()
          }}
          width={`${this.props.width}px`}
          height={`${this.props.height - 116}px`}
          fontSize={this.props.codeFontSize}
          annotations={annotations}
          markers={markers}
        />
        <Snackbar
          open={this.props.isSnackbarOpen}
          message="Your file has been converted to XHTML."
        />
      </div>
    )
  }

}

CodeEditor.propTypes = {
  code: React.PropTypes.string.isRequired,
  errors: React.PropTypes.array,
  width: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,
  codeFontSize: React.PropTypes.number.isRequired,
  changeCode: React.PropTypes.func.isRequired,
  validateCode: React.PropTypes.func.isRequired,
  handleFile: React.PropTypes.func.isRequired,
  isSnackbarOpen: React.PropTypes.bool.isRequired,
}

export default CodeEditor
