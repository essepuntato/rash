import React from 'react'
import { StyleSheet, css } from 'aphrodite'
import { observer } from 'mobx-react'
import CodeEditor from './CodeEditor'

const styles = StyleSheet.create({
  body: {
    display: 'flex',
    flex: 1,
  },
})

const Body = observer(({ state: { code, errors, changeCode, validateCode, handleFile }, ui: { width, height, codeFontSize, isSnackbarOpen } }) =>
  <section className={css(styles.body)}>
    <CodeEditor
      code={code}
      errors={errors.slice()}
      width={width}
      height={height}
      codeFontSize={codeFontSize}
      changeCode={changeCode}
      validateCode={validateCode}
      handleFile={handleFile}
      isSnackbarOpen={isSnackbarOpen}
    />
  </section>
)

Body.propTypes = {
  state: React.PropTypes.object.isRequired,
  ui: React.PropTypes.object.isRequired,
}

export default Body
