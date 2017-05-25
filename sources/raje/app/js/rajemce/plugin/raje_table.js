tinymce.PluginManager.add('raje_table', function (editor, url) {

  // Add a button that handle the inline element
  editor.addButton('raje_table', {
    text: 'raje_table',
    icon: false,
    tooltip: 'Add table',

    // Button behaviour
    onclick: function () {

      let selectedElement = $(tinymce.activeEditor.selection.getNode())

      selectedElement.append(`<figure id="table_1">
    <table class="mce-item-table" >
        <tr>
            <th>Heading cell 1</th>
            <th>Heading cell 2</th>
        </tr>
        <tr>
            <td><p>Data cell 1</p></td>
            <td><p>Data cell 2</p></td>
        </tr>
        <tr>
            <td>
                <p>Data cell 3</p>
                <p>With multiple paragraphs</p>
            </td>
            <td><p>Data cell 4</p></td>
        </tr>
    </table>
    <figcaption>Caption of the table.</figcaption>
</figure>`)
    }
  })
})