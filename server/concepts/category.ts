import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotAllowedError } from "./errors";

export interface CategoryDoc extends BaseDoc {
  label: string;
  items: Set<Object>;
}

export default class CategoryConcept {
  public readonly categories = new DocCollection<CategoryDoc>("categories");

  /**
   * Creates a new category
   * @param label the title of the category
   * @param items the elements within this category
   * @returns returns a message
   */
  async createCategory(label: string, items: Set<ObjectId>) {
    await this.canCreate(label);
    const _id = await this.categories.createOne({ label, items });
    return { msg: "Category successfully created", category: await this.categories.readOne({ _id }) };
  }

  /**
   * Deletes the category
   * @param _id the category that I want to delete
   * @returns returns a message
   */
  async deleteCategory(_id: ObjectId) {
    await this.categories.deleteOne({ _id });
    return { msg: "Category successfully deleted" };
  }

  /**
   * Deletes the element within the category
   * @param _id the category that I want to be in
   * @param elt the element I want to delete
   */
  async deleteElement(_id: ObjectId, elt: ObjectId) {}

  /**
   * Adds the element to the category
   * @param _id the category that I want to be in
   * @param elt the element I want to delete
   */
  async addElement(_id: ObjectId, elt: ObjectId) {}

  /**
   * Checks whether if the category can be created
   * @param label the label of the category
   */
  private async canCreate(label: string) {
    if (!label) {
      throw new BadValuesError("Label must be non-empty");
    }
    await this.isLabelUnique(label);
  }

  /**
   * If the label exists, it returns an error
   * @param label the label of the category
   */
  private async isLabelUnique(label: string) {
    if (await this.categories.readOne({ label })) {
      throw new NotAllowedError(`Category with label ${label} already exists`);
    }
  }
}