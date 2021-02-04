import visit from "unist-util-visit"
import { root } from "mdast-builder"
import definitions from "mdast-util-definitions"

function end(arr) {
  return arr[arr.length - 1]
}

function split(tree, depth = null) {
  const definition = definitions(tree)
  let sections = []
  let open = []
  let section

  for (const node of tree.children) {
    if (node.type === 'definition') {
      continue
    }

    if (node.type === 'heading' && (depth === null || node.depth === depth)) {
      if (section) {
        if (section.depth === node.depth) {
          let closed = open.pop()
          let parent = end(open)

          if (parent) {
            parent.content.push(...closed.content)
            parent.definitions.push(...closed.definitions)
          }
        } else if (section.depth > node.depth) {
          let closed = open.pop()

          while (open.length && end(open).depth >= node.depth) {
            let parent = open.pop()

            parent.content.push(...closed.content)
            parent.definitions.push(...closed.definitions)

            closed = parent
          }
        }
      }

      section = {
        depth: node.depth,
        content: [],
        definitions: [],
      }

      sections.push(section)
      open.push(section)
    }

    if (section) {
      const reference = child => child.type === 'linkReference' || child.type === 'imageReference'

      visit(node, reference, child => {
        section.definitions.push(definition(child.identifier))
      })

      section.content.push(node)
    }
  }

  while (open.length > 1) {
    let closed = open.pop()
    let parent = end(open)

    parent.content.push(...closed.content)
    parent.definitions.push(...closed.definitions)
  }

  return sections.map(section => {
    return root(section.content.concat(section.definitions))
  })
}

export default split
