import { ObjectId } from "mongodb";
import { BaseDoc } from "../framework/doc";

export interface DiscussionTopicDoc extends BaseDoc {
  title: string;
  posts: Array<ObjectId>;
  archived: boolean;
  creator: ObjectId;
  censoredWordList: ObjectId;
  category: ObjectId;
}
