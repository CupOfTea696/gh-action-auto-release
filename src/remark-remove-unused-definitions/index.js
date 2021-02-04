import visit from "unist-util-visit"
import remove from "unist-util-remove"

function plugin() {
  function transform(tree) {
    const references = []

    visit(tree, ['imageReference', 'linkReference', 'footnoteReference'], node => {
      references.push(node.identifier.toUpperCase())
    })

    return remove(tree, node => {
      if (! ['definition', 'footnoteDefinition'].includes(node.type)) {
        return false
      }

      return ! references.includes(node.identifier.toUpperCase())
    })
  }

  return transform
}

export default plugin
