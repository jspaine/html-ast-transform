import * as parse5 from "parse5";

export const nodeTypes = {
  COMMENT: "#comment",
  TEXT: "#text"
};

export function getAttr(node: parse5.DefaultTreeElement, name: string): string | undefined {
  const attr = node.attrs.find((attr) => attr.name === name);
  return attr && attr.value;
}

export function withAttr(node: parse5.DefaultTreeElement, name: string, value: string): parse5.DefaultTreeElement {
  return {
    ...node,
    attrs: node.attrs.filter((attr) => attr.name !== name).concat({name, value})
  };
}

export function hasClass(node: parse5.DefaultTreeElement, className: string): boolean {
  const classes = getAttr(node, "class");
  return classes && Boolean(classes.split(" ").find((name) => name === className));
}

export function withClass(node: parse5.DefaultTreeElement, className: string): parse5.DefaultTreeElement {
  const classList = (getAttr(node, "class") || "").split(" ");
  if (classList.find((cl) => cl === className)) {
    return node;
  }

  return withAttr(node, "class", classList.concat(className).join(" "));
}

export function h(html: string): parse5.Node;
export function h(type: string, value: string): parse5.TextNode | parse5.CommentNode;
export function h(
  tagName: string,
  attrs: parse5.Attribute[],
  childNodes: parse5.Node[]
): parse5.DefaultTreeElement;

export function h(...args: any[]) {
  if (args.length === 1) {
    const [node] = typeof args[0] === "string" ?
      (parse5.parseFragment(args[0]) as parse5.DefaultTreeParentNode).childNodes :
      args;

    return h(node.tagName, node.attrs, node.childNodes);
  }

  if (args.length === 2) {
    const [type, value] = args;

    if (type === nodeTypes.TEXT) {
      return {
        nodeName: type,
        value: value || ""
      };
    } else if (type === nodeTypes.COMMENT) {
      return {
        data: value || "",
        nodeName: type
      };
    }
  }

  const [type, attrs, childNodes] = args;

  return {
    attrs,
    childNodes,
    nodeName: type,
    tagName: type
  };
}
