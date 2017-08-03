# html-ast-transform

A set of helpers around [parse5](https://github.com/inikulin/parse5) for transforming HTML via an AST. Allows for flexible transformations useful for eg. processing rich text editor output for email.

### Features
- Strip tags or nodes
- Replace nodes with string(s) or a function
- Reduce child nodes for adding/removing/modifying sibling nodes
- Utility functions to simplify creating nodes, adding and checking for attributes

## Install
```
npm install --save html-ast-transform parse5
```

## Usage

```js
import {transform, h, getAttr, hasClass} from 'html-ast-transform'
// or es5:
var transform = require('html-ast-transform').transform
// umd:
const {transform, h, hasClass, getAttr} = HtmlAstTransform


const result = transform(html, options)
```

## Examples
### Replace paragraph tags with table rows
```js
const input = '<div><p class="text-center">Some text</p></div>'

const output = transform(input, {
  replaceTags: {
    p: node => h('tr', [], [
      h('td', node.attrs, node.childNodes)
    ])
  }
})

// output = '<div><tr><td class="text-center">Some text</td></tr></div>'
```

### Generate plain text version retaining links and image alt text
```js
const input = '<p>Text with <a href="example.com">a link</a><img alt="and an image" /></p>'

const stringifyLinks = (acc, node) => {
  if (node.nodeName !== 'a') return acc.concat(node)

  const href = getAttr(node, 'href')
  return acc.concat(
    node.childNodes,
    h('#text', ` [${href}]`)
  )
}

const getAltText = node => {
  const alt = getAttr(node, 'alt')
  return h('#text', alt ? ` [${alt}]` : '')
}

const output = transform(input, {
  replaceTags: {
    p: '\n',
    img: getAltText
  },
  reduceAll: stringifyLinks
})

// output = '\nText with a link [example.com] [and an image]'
```

## API
### transform
```ts
transform(input: string, {
  replaceTags?: {
    [tagName: string]: string | string[] | (node: Element) => Node
  },
  reduceAll?: (acc: Node[], node: Element, index: number, nodes: Node[]) => Node[],
  stripContent?: string[],
  stripTags?: string[],
  trimWhitespace?: boolean,
  fragment?: boolean
})
```

**replaceTags**: A mapping of tag names to their replacements. Replacements can be a string that will replace the opening tag, an array of strings that will replace opening and closing tags or a function that receives the node and returns a replacement node.

**reduceAll**: A reducer to run over the children of all nodes. Receives the accumulated childNodes, the current childNode, the current index and the list of childNodes.

**stripContent**: An array of tag names that will be removed along with their contents

**stripTags** An array of tag names to be removed while retaining their contents

**trimWhitespace**: Handle indentation and newlines by removing whitespace only text nodes and trimming text nodes with multiple leading/trailing whitespace to a single space. *default = true*

**fragment**: Parse the input as an html fragment rather than a full document. *default = true*

### Helpers
#### node factory
```ts
h(html: string): Node

h(type: string, value: string): TextNode | CommentNode

h(
  tagName: string,
  attrs: Attribute[],
  childNodes: Node[]
): Element
```
#### attribute helpers
```ts
// get the value of the named attribute, if present
getAttr(node: Element, name: string): string | undefined

// add an attribute to an element or update if it already exists
withAttr(node: Element, name: string, value: string): Element

// check if the element has a class
hasClass(node: Element, name: string): boolean

// add a class to an element if not already present
withClass(node: Element, name: string): Element
```
