import {expect} from "chai";
import "mocha";
import * as parse5 from "parse5";

import {getAttr, h, hasClass, withAttr, withClass} from "../src/helpers";

describe("helpers", function() {
  describe("node factory", function() {
    it("parses html", function() {
      const result = h("<div></div>");

      expect(result).to.be.an("object");
      expect(result).to.have.property("tagName", "div");
    });

    it("generates text nodes", function() {
      const result = h("#text", "foo");
      expect(result).to.be.an("object");
      expect(result).to.have.property("value", "foo");
    });

    it("generates comment nodes", function() {
      const result = h("#comment", "foo");
      expect(result).to.be.an("object");
      expect(result).to.have.property("data", "foo");
    });

    it("generates nodes", function() {
      const result = h("p", [{name: "class", value: "foo"}], []);
      expect(result).to.be.an("object");
      expect(result).to.have.property("tagName", "p");
      expect(result.attrs).to.have.eql([{name: "class", value: "foo"}]);
    });
  });

  it("getAttr existing attribute", function() {
    const node = h("p", [{name: "class", value: "foo"}], []);
    const result = getAttr(node, "class");
    expect(result).to.equal("foo");
  });

  it("getAttr undefined attribute", function() {
    const node = h("p", [{name: "class", value: "foo"}], []);
    const result = getAttr(node, "id");
    expect(result).to.be.a("undefined");
  });

  it("withAttr existing attribute", function() {
    const node = h("p", [{name: "class", value: "foo"}], []);
    const result = withAttr(node, "class", "bar");
    expect(result.attrs).to.eql([
      {name: "class", value: "bar"}
    ]);
  });

  it("withAttr new attribute", function() {
    const node = h("p", [{name: "class", value: "foo"}], []);
    const result = withAttr(node, "id", "bar");
    expect(result.attrs).to.eql([
      {name: "class", value: "foo"},
      {name: "id", value: "bar"}
    ]);
  });

  it("hasClass true", function() {
    const node = h("p", [{name: "class", value: "foo bar"}], []);
    const result = hasClass(node, "foo");
    return expect(result).to.be.true;
  });

  it("hasClass false", function() {
    const node = h("p", [{name: "class", value: "foo bar"}], []);
    const result = hasClass(node, "baz");
    return expect(result).to.be.false;
  });

  it("withClass existing class", function() {
    const node = h("p", [{name: "class", value: "foo bar"}], []);
    const result = withClass(node, "bar");
    expect(result.attrs).to.eql([
      {name: "class", value: "foo bar"}
    ]);
  });

  it("withClass new class", function() {
    const node = h("p", [{name: "class", value: "foo bar"}], []);
    const result = withClass(node, "baz");
    expect(result.attrs).to.eql([
      {name: "class", value: "foo bar baz"}
    ]);
  });
});
