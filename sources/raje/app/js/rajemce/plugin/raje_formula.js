/**
 * 
 */
tinymce.PluginManager.add('raje_formula', function (editor, url) {

  // Add a button that handle the inline element
  editor.addButton('raje_formula', {
    text: 'raje_formula',
    icon: false,
    tooltip: 'Formula',

    // Button behaviour
    onclick: function () {

      editor.windowManager.open({
        title: 'Formula dialog',
        url: 'js/rajemce/plugin/raje_formula.html',
        width: 700,
        height: 600
      });
    }
  })

  formula = {}
})