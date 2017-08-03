import * as parse5 from "parse5";

export type ReducerTransform = (
  acc: parse5.AST.Default.Node[],
  node: parse5.AST.Default.Element
) => parse5.AST.Default.Node[];

export type MapTransform = (node: parse5.AST.Default.Element) => parse5.AST.Default.Node;

export interface ReplaceTag {
  [tagName: string]: string | string[] | MapTransform;
}

export interface TransformOptions {
  replaceTags?: ReplaceTag;
  reduceAll?: ReducerTransform;
  stripContent?: string[];
  stripTags?: string[];
  trimWhitespace?: boolean;
  fragment?: boolean;
}
