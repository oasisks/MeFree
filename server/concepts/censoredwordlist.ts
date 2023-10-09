import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";

export interface CensoredWordListDoc extends BaseDoc {
  words: Set<string>;
}

export default class CensoredWordListConcept {
  public readonly lists = new DocCollection<CensoredWordListDoc>("censoredWordList");

  /**
   * This just creates a word list
   */
  async create() {
    const words = new Set<string>();
    const _id = await this.lists.createOne({ words });
    return { msg: "Successfully created a censored word list!", list: await this.lists.readOne({ _id }) };
  }

  /**
   * This deletes a list given an id
   */
  async delete(_id: ObjectId) {
    await this.validId(_id);
    await this.lists.deleteOne({ _id });
    return { msg: `Successfully deleted the censored word list with id ${_id}` };
  }

  /**
   * Adds in a word to the list
   * @param _id the id of the word list
   * @param word the word we want to add in
   */
  async addWord(_id: ObjectId, word: string) {
    await this.validId(_id);
    const list = await this.lists.readOne({ _id });
    if (list) {
      console.log(list);
      list.words.add(word);
      console.log(list);
      await this.lists.updateOne({ _id }, list);
      return { msg: `Successfully added the word ${word}.` };
    }
  }

  /**
   * Deletes a word from the list
   * @param _id the list id
   * @param word the word we want to delete
   * @returns
   */
  async deleteWord(_id: ObjectId, word: string) {
    await this.validId(_id);
    const list = await this.lists.readOne({ _id });
    if (list) {
      list.words.delete(word);
      await this.lists.updateOne({ _id }, list);
      return { msg: `Successfully deleted the word ${word}.` };
    }
  }

  /**
   * Checks if the list exists
   * Returns an error otherwise
   * @param _id an id for the word list
   */
  private async validId(_id: ObjectId) {
    const maybeList = await this.lists.readOne({ _id });
    if (!maybeList) {
      throw new NotFoundError(`There exists no list with id ${_id}`);
    }
  }
}
