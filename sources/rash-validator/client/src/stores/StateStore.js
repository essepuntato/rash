import { extendObservable, action } from 'mobx'
import throttle from 'lodash/throttle'
import fetch from 'isomorphic-fetch'
import v4 from 'node-uuid'

// Check for the various File API support.
if (!(window.File && window.FileReader && window.FileList && window.Blob && document.createEvent)) {
  alert('The File APIs are not fully supported in this browser.');
}

const validateUrl = 'http://localhost:8080/validate'

const codePrompt =
`<html>
  <h1>Hey! Welcome to RASH Verifier!</h1>
  <p>In order to validate a file you can:</p>
  <ul>
    <li>Start writing or copy-paste in the editor</li>
    <li>Upload a file using the top-right button</li>
    <li>Drag-n-drop a file here</li>
  </ul>
  <p>Happy coding!</p>
</html>`

class StateStore {
  constructor(ui) {
    extendObservable(this, {
      ui: ui,
      code: codePrompt,
      errors: [],
      isValidatingCode: false,
      conversionEnabled: false,
      handleFile: action((file) => {
        const reader = new FileReader()
        reader.onload = () => {
          this.changeCode(reader.result)
          this.validateCode()
        }
        reader.readAsText(file)
      }),
      onConversionToggle: action(() => {
        this.conversionEnabled = !this.conversionEnabled
        this.validateCode()
      }),
      changeCode: action((code) => this.code = code),
      validateCode: action(throttle(
        () => {
          this.isValidatingCode = true
          const data = new FormData()
          const file = new File(this.code.split('\n').map((line) => line + '\n'), `rashcode-${v4()}.html`)
          data.append('rash_file', file)
          data.append('conversion_enabled', this.conversionEnabled)
          fetch(validateUrl, {
            method: 'POST',
            body: data
          })
          .then(result => result.json())
          .then(result => {
            if (result.has_converted) {
              this.code = result.converted_xml
              ui.openSnackBar()
            }
            this.errors = result.errors
            setTimeout(() => this.isValidatingCode = false, 500)
          })
        }, 3000
      )),
      get userBeganToWrite() {
        return this.code !== codePrompt
      },
    })
  }
}

export default StateStore
