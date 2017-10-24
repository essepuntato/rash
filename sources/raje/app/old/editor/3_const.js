const INLINE = {
  CODE: 'code',
  QUOTE: 'q',
};

const TABLE = {
  DATA: '<td><p><br/></p></td>',
  HEAD: '<th>heading</th>'
};

const TAB = '  '

const ZERO_SPACE = '&#8203;';
const ONE_SPACE = '&nbsp;';

const messageDealer = 'div#messageDealer';

Array.prototype.indexOfContent = function (searchTerm) {
  let index = -1;
  for (var i = 0, len = this.length; i < len; i++) {
    if (this[i].content == searchTerm) {
      index = i;
      break;
    }
  }
  return index
}
