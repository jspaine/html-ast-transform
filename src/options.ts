import * as parse5 from "parse5";

export type ReducerTransform = (
  acc: parse5.Node[],
  node: parse5.Element
) => parse5.Node[];

export type MapTransform = (node: parse5.Element) => parse5.Node;

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
