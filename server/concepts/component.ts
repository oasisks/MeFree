import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";

export interface ComponentDocs extends BaseDoc {
  componentType: ObjectId;
  width: string;
  height: string;
  fontSize: string;
  font: string;
  fontColor: string;
  xPos: string;
  yPos: string;
}

export default class ComponentConcept {
  public readonly components = new DocCollection<ComponentDocs>("components");

  async createComponent(type);
}
