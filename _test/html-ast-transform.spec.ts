import {expect} from "chai";
import "mocha";
import * as parse5 from "parse5";

import {getAttr, h, hasClass, transform} from "../src";

describe("Html transform", function() {
  it("does nothing", function() {
    const html = "<p>Something</p>";

    const res = transform(html);
    expect(res).to.equal(html);
  });

  it("strips tags and contents", function() {
    const input = "<div><h1>Title</h1><p>Text</p></div>";
    const output = "<div><p>Text</p></div>";

    const res = transform(input, {stripContent: ["h1"]});
    expect(res).to.equal(output);
  });

  it("strips tags", function() {
    const input = "<div><h1>Title</h1><p>Text</p></div>";
    const output = "<div>Title<p>Text</p></div>";

    const res = transform(input, {stripTags: ["h1"]});
    expect(res).to.equal(output);
  });

  it("replaces tags with a string", function() {
    const input = "<div><p>A paragraph<span>Nested span</span></p></div>";
    const output = "<div>\nA paragraph<span>Nested span</span></div>";
    const replaceTags = {p: "\n"};

    const res = transform(input, {replaceTags});
    expect(res).to.equal(output);
  });

  it("replaces tags with an array", function() {
    const input = "<div><p>A paragraph<span>Nested span</span></p></div>";
    const output = "<div>\nA paragraph<span>Nested span</span>\n</div>";
    const replaceTags = {p: ["\n", "\n"]};

    const res = transform(input, {replaceTags});
    expect(res).to.equal(output);
  });

  it("replaces tags with a function", function() {
    const input = "<div><p>A paragraph<span>Nested span</span></p></div>";
    const output = "<div><div>A paragraph<span>Nested span</span></div></div>";
    const replaceTags = {
      p: (node: parse5.AST.Default.Element) => h("div", [], node.childNodes)
    };

    const res = transform(input, {replaceTags});
    expect(res).to.equal(output);
  });

  it("runs a custom reducer on all tags", function() {
    const input = "<div><a href='foo.com'><b>Link</b></a></div>";
    const output = "<div>[foo.com] <b>Link</b></div>";
    const reduceAll = stringifyLinks;

    const res = transform(input, {reduceAll});
    expect(res).to.equal(output);
  });

  it("strips whitespace", function() {
    const input = `
<div>
  <p>Some text</p>
  <p>
    Some more
  </p>
</div>
    `;

    const output = "<div><p>Some text</p><p> Some more </p></div>";
    const res = transform(input);

    expect(res).to.equal(output);
  });

  it("whole document", function() {
    const input = "<!DOCTYPE html><html><head><title>foo</title></head><body><div>foo</div></body></html>";

    const res = transform(input, {fragment: false});
    expect(res).to.equal(input);
  });

  it("example 1", function() {
    const input = "<div><p class=\"text-center\">Some text</p></div>";
    const output = "<div><tr><td class=\"text-center\">Some text</td></tr></div>";
    const res = transform(input, {
      replaceTags: {
        p: (node) => h("tr", [], [
          h("td", node.attrs, node.childNodes)
        ])
      }
    });

    expect(res).to.equal(output);
  });

  it("example 2", function() {
    const input = "<p>Text with <a href='example.com'>a link</a><img alt='and an image' /></p>";
    const output = "\nText with a link [example.com] [and an image]";

    const stringify = (acc: parse5.AST.Default.Node[], node: parse5.AST.Default.Element) => {
      if (node.nodeName !== "a") {
        return acc.concat(node);
      }

      const href = getAttr(node, "href");
      return acc.concat(
        node.childNodes,
        h("#text", ` [${href}]`)
      );
    };

    const getAltText = (node: parse5.AST.Default.Element) => {
      const alt = getAttr(node, "alt");
      return h("#text", alt ? ` [${alt}]` : "");
    };

    const res = transform(input, {
      reduceAll: stringify,
      replaceTags: {
        img: getAltText,
        p: "\n"
      }
    });

    expect(res).to.equal(output);
  });
});

function stringifyLinks(acc: parse5.AST.Default.Node[], node: parse5.AST.Default.Element) {
  if (node.nodeName !== "a") {
    return acc.concat(node);
  }

  return acc.concat([
    h("#text", `[${getAttr(node, "href")}] `),
    ...node.childNodes
  ]);
}
