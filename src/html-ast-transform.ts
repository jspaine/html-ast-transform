import * as parse5 from "parse5";
import trim = require("lodash.trim");

import {getAttr, h, hasClass, nodeTypes, withAttr, withClass} from "./helpers";
import {TransformOptions} from "./options";

export default function transform(html: string, options: TransformOptions = {}) {
  if (typeof options.fragment === "undefined") {
    options.fragment = true;
  }

  if (typeof options.trimWhitespace === "undefined") {
    options.trimWhitespace = true;
  }

  options.replaceTags = options.replaceTags || {};

  const node = (options.fragment ?
    parse5.parseFragment(html) :
    parse5.parse(html)
  ) as parse5.AST.Default.DocumentFragment | parse5.AST.Default.Document;

  const transformed = transformRoot(node, options);

  return parse5.serialize(transformed);
}

function transformRoot(node: parse5.AST.Default.Node, options: TransformOptions): parse5.AST.Default.Node {
  if (!isParentNode(node)) {
    return node;
  }

  return Object.assign({}, node, {
    childNodes: node.childNodes.reduce(reduceChildren(options), [])
  });
}

function reduceChildren(options: TransformOptions) {
  function reducer(acc: parse5.AST.Default.Node[], node: parse5.AST.Default.Node) {
    const stripNode = options.stripContent && options.stripContent.find((tag) =>
      tag === node.nodeName);
    const empty = options.trimWhitespace && isTextNode(node) && !trim(node.value);

    if (stripNode || empty) {
      return acc;
    }

    if (!isElementNode(node)) {
      if (isTextNode(node) && options.trimWhitespace) {
        return acc.concat(Object.assign({}, node, {
          value: node.value.replace(/^\s+/, " ").replace(/\s+$/, " ")
        }));
      }
      return acc.concat(node);
    }

    return acc.concat(replace(node));
  }

  function replace(node: parse5.AST.Default.Element): parse5.AST.Default.Node[] {
    const replacement = options.replaceTags[node.nodeName];

    let childNodes = isParentNode(node) && node.childNodes;
    if (childNodes) {
      if (options.reduceAll) {
        childNodes = childNodes.reduce(options.reduceAll, []);
      }
      childNodes = childNodes.reduce(reducer, []);
    }

    const stripTag = options.stripTags && options.stripTags.find((tag) =>
      tag === node.nodeName);

    if (stripTag) {
      return childNodes;
    }

    if (typeof replacement === "string") {
      return [].concat(h(nodeTypes.TEXT, replacement), childNodes);
    }

    if (Array.isArray(replacement)) {
      const leading = replacement[0];
      const trailing = replacement[1] || "";
      return [].concat(h(nodeTypes.TEXT, leading), childNodes, h(nodeTypes.TEXT, trailing));
    }

    if (typeof replacement === "function") {
      return [replacement(Object.assign({}, node, {childNodes}))];
    }

    return [Object.assign({}, node, {childNodes})];
  }

  return reducer;
}

function isTextNode(arg: any): arg is parse5.AST.Default.TextNode {
  return arg.value !== undefined;
}

function isParentNode(arg: any): arg is parse5.AST.Default.ParentNode {
  return arg.childNodes !== undefined;
}

function isElementNode(arg: any): arg is parse5.AST.Default.Element {
  return arg.attrs !== undefined;
}
