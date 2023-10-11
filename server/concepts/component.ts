import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotAllowedError } from "./errors";

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

  /**
   *
   * @param componentType a unique id for a particular component
   * @param width the width
   * @param height the height
   * @param fontSize the font size
   * @param font the font
   * @param fontColor the font color
   * @param xPos the x pos pixel position
   * @param yPos the y pos pixel position
   */
  async createComponent(componentType: ObjectId, width: string, height: string, fontSize: string, font: string, fontColor: string, xPos: string, yPos: string) {
    await this.uniqueID(componentType);
    const _id = this.components.createOne({ componentType, width, height, fontSize, font, fontColor, xPos, yPos });
    return { msg: "Successfully created a component", component: await this.components.readOne({ _id }) };
  }

  /**
   * Gets rid of the entire component
   * @param componentType the id of the type we want to get rid of
   */
  async deleteComponent(componentType: ObjectId) {
    await this.componentExist(componentType);
    await this.components.deleteOne({ componentType });

    return { msg: "Successfully deleted the component" };
  }

  async updateComponent(componentType: ObjectId, update: Partial<ComponentDocs>) {
    this.sanitizeUpdate(update);
    await this.componentExist(componentType);
    const component = await this.components.readOne({ componentType });
    if (component) {
      this.components.updateOne({ componentType }, update);
    }
    return { msg: "Successfully updated the component" };
  }

  async getAllComponents() {
    return await this.components.readMany({});
  }

  // async moveComponent(componentType: ObjectId, xPos: string, yPos: string) {
  //   await this.componentExist(componentType);
  // }
  private async uniqueID(componentType: ObjectId) {
    const maybeComponent = await this.components.readOne({ componentType });
    if (maybeComponent) {
      throw new NotAllowedError("This component already exists");
    }
  }

  private async componentExist(componentType: ObjectId) {
    const maybeComponent = await this.components.readOne({ componentType });
    if (!maybeComponent) {
      throw new BadValuesError("The component does not exist");
    }
  }
  private sanitizeUpdate(update: Partial<ComponentDocs>) {
    // Make sure the update cannot change the author.
    const allowedUpdates = ["width", "height", "fontSize", "font", "fontColor", "xPos", "yPos"];
    for (const key in update) {
      if (!allowedUpdates.includes(key)) {
        throw new NotAllowedError(`Cannot update '${key}' field!`);
      }
    }
  }
}
