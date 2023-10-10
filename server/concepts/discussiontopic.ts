import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";

export interface DiscussionTopicDoc extends BaseDoc {
  title: string;
  posts: Array<ObjectId>;
  archived: boolean;
  creator: ObjectId;
  censoredWordList: ObjectId;
  category: string;
}

export default class DiscussionTopicConcept {
  public readonly topics = new DocCollection<DiscussionTopicDoc>("topics");

  /**
   *
   * @param title the title of the topic
   * @param posts the posts within the topic
   * @param archived if its archived or not
   * @param creator the creator of the topic
   * @param censoredWordList the list to contain all the bad words
   * @param category the category this topic is in (note that category is unique)
   * @returns success message and the topic
   */
  async createTopic(title: string, posts: Array<ObjectId>, archived: boolean = false, creator: ObjectId, censoredWordList: ObjectId, category: string) {
    const _id = await this.topics.createOne({ title, posts, archived, creator, censoredWordList, category });
    return { msg: "Successfully created a discussion topic", topic: this.topics.readOne({ _id }) };
  }

  /**
   * Adds a post to a topic
   * @param _id the id of the topic
   * @param post the post we want to add to the topic
   */
  async add(_id: ObjectId, post: ObjectId) {
    await this.topicExist(_id);
    const topic = await this.topics.readOne({ _id });
    if (topic) {
      topic.posts.push(post);
      await this.topics.updateOne({ _id }, topic);
      return { msg: "Successfully added a post" };
    }
  }

  async changeArchive(_id: ObjectId, archived: boolean) {
    await this.topicExist(_id);
    const topic = await this.topics.readOne({ _id });
    if (topic) {
      topic.archived = archived;
      await this.topics.updateOne({ _id }, topic);
      return { msg: "Successfully modified the archive state" };
    }
  }

  /**
   * Returns a list of spotlights given categories
   * @param categories an array of categories that we are interested for spotlights
   */
  async getSpotLights(categories: Array<string>) {
    const spotLights: Array<DiscussionTopicDoc> = [];
    categories.forEach(async (category) => {
      const topics = await this.topics.readMany({ category });
      const index = Math.floor(Math.random() * topics.length);
      spotLights.push(topics[index]);
    });

    return spotLights;
  }

  async getTopic(_id: ObjectId) {
    await this.topicExist(_id);
    return await this.topics.readOne({ _id });
  }

  private async topicExist(_id: ObjectId) {
    const maybeTopic = await this.topics.readOne({ _id });
    if (!maybeTopic) {
      throw new NotFoundError("Can't find the topic with this id");
    }
  }
}
