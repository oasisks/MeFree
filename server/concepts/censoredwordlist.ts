import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotFoundError } from "./errors";

export interface CensoredWordListDoc extends BaseDoc {
  words: Array<string>;
}

export default class CensoredWordListConcept {
  public readonly lists = new DocCollection<CensoredWordListDoc>("censoredWordList");

  /**
   * This just creates a word list
   */
  async create() {
    const words = new Array<string>();
    const _id = await this.lists.createOne({ words });
    return { msg: "Successfully created a censored word list!", list: await this.lists.readOne({ _id }) };
  }

  /**
   * Gets the list given a particular id
   */
  async getList(_id: ObjectId) {
    await this.validId(_id);
    return await this.lists.readOne({ _id });
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
    await this.isNewWord(_id, word);
    const list = await this.lists.readOne({ _id });
    if (list) {
      list.words.push(word);
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
      await this.lists.updateOne({ _id }, { words: list.words.filter((value) => value != word) });
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

  private async isNewWord(_id: ObjectId, word: string) {
    const list = await this.lists.readOne({ _id });
    if (list?.words.includes(word)) {
      throw new BadValuesError("Word already exists");
    }
  }
}
