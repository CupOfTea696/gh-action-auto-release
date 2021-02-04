function plugin() {
  let data = this.data()
  const configured = {
    emphasis: false,
    strong: false,
    bullet: false,
    listItemIndent: false,
  }

  const fromMarkdown = {
    enter: {
      emphasis: enterEmphasis,
      emphasisSequence: enterEmphasisSequence,
      listItemMarker: enterListItemMarker,
      listItemPrefixWhitespace: enterListItemPrefixWhitespace,
      strong: enterStrong,
      strongSequence: enterStrongSequence,
    }
  }

  const toMarkdown = {}

  function enterEmphasisSequence(token) {
    if (! configured.emphasis) {
      toMarkdown.emphasis = this.sliceSerialize(token)[0]
      configured.emphasis = true
    }
  }

  function enterEmphasis(token) {
    this.enter({type: 'emphasis', children: [], emphasis: this.sliceSerialize(token)[0]}, token)
  }

  function enterListItemMarker(token) {
    let stack = [...this.stack]
    const listItem = stack.pop()
    const list = stack.pop()

    if (! list.ordered) {
      const bullet = listItem.bullet = this.sliceSerialize(token)[0]

      if (! list.bullet) {
        list.bullet = bullet
      }

      if (! configured.bullet) {
        toMarkdown.bullet = bullet
        configured.bullet = true
      }
    }
  }

  function enterListItemPrefixWhitespace(token) {
    let stack = [...this.stack]
    const listItem = stack.pop()
    const list = stack.pop()
    const indent = listItem.indent = this.sliceSerialize(token).length === 1 ? 'one' : 'tab'

    if (! list.indent) {
      list.indent = indent
    }

    if (! configured.indent) {
      toMarkdown.listItemIndent = indent
      configured.indent = true
    }
  }

  function enterStrongSequence(token) {
    if (! configured.strong) {
      toMarkdown.strong = this.sliceSerialize(token)[0]
      configured.strong = true
    }
  }

  function enterStrong(token) {
    this.enter({type: 'strong', children: [], strong: this.sliceSerialize(token)[0]}, token)
  }

  add('fromMarkdownExtensions', fromMarkdown)
  add('toMarkdownExtensions', toMarkdown)

  function add(field, value) {
    if (data[field]) {
      data[field].push(value)
    } else {
      data[field] = [value]
    }
  }
}

export default plugin
