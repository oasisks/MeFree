import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";

export interface GroupDoc extends BaseDoc {
  owner: ObjectId;
  residents: Array<ObjectId>;
  status: boolean;
  censoredWordList: ObjectId;
  posts: Array<ObjectId>;
  votes: Array<ObjectId>;
}

export default class GroupConcept {
  public readonly groups = new DocCollection<GroupDoc>("groups");

  /**
   * Groups don't have to be unique owner, as we can make as many groups as we want
   */
  async createGroup(owner: ObjectId, residents: Array<ObjectId>, status: boolean = false, censoredWordList: ObjectId, posts: Array<ObjectId>) {
    const votes = new Array<ObjectId>();
    const _id = await this.groups.createOne({ owner, residents, status, censoredWordList, posts, votes });
    return { msg: "Successfully created a group", id: await this.groups.readOne({ _id }) };
  }

  async invite(_id: ObjectId, inviter: ObjectId, invitee: ObjectId) {
    await this.groupExists(_id);
    const group = await this.groups.readOne({ _id });
    if (group && (await this.inGroup(_id, inviter))) {
      if (await this.inGroup(_id, invitee)) {
        return { msg: "The user is already in the group" };
      }
      group.residents.push(invitee);
      await this.groups.updateOne({ _id }, group);
      return { msg: "Successfully added the user" };
    }
    return { msg: "Didn't add the user" };
  }

  async addVote(_id: ObjectId, vote: ObjectId) {
    await this.groupExists(_id);
    const group = await this.groups.readOne({ _id });
    if (group) {
      group.votes.push(vote);
      await this.groups.updateOne({ _id }, group);
      return { msg: "Successfully added the vote" };
    }
  }

  async deleteVote(_id: ObjectId, vote: ObjectId) {
    await this.groupExists(_id);
    const group = await this.groups.readOne({ _id });
    if (group) {
      group.votes = group.votes.filter((vote) => !vote.equals(vote));
      await this.groups.updateOne({ _id }, group);
      return { msg: "Successfully deleted the vote" };
    }
  }

  async deleteUser(_id: ObjectId, initiator: ObjectId, resident: ObjectId) {
    await this.groupExists(_id);
    const group = await this.groups.readOne({ _id });
    if (group && (await this.inGroup(_id, initiator))) {
      group.residents = group.residents.filter((elt) => !elt.equals(resident));
      await this.groups.updateOne({ _id }, group);
      return { msg: "Successfully deleted the user" };
    }
    return { msg: "Didn't delete the user" };
  }

  async deleteGroup(_id: ObjectId, initiator: ObjectId) {
    await this.groupExists(_id);
    const group = await this.groups.readOne({ _id });
    console.log(await this.inGroup(_id, initiator));
    console.log(_id, initiator);
    if (group && (await this.inGroup(_id, initiator))) {
      await this.groups.deleteOne({ _id });
      return { msg: "Group successfully deleted" };
    }
    return { msg: "Didn't delete the Group" };
  }

  async giveOwnerShip(_id: ObjectId, owner: ObjectId, newOwner: ObjectId) {
    await this.groupExists(_id);
    const group = await this.groups.readOne({ _id });
    if (group && group.owner.equals(owner)) {
      group.owner = newOwner;
      await this.groups.updateOne({ _id }, group);
      return { msg: "Group owner successfully changed" };
    }
    return { msg: "Didn't change group owner" };
  }

  async changePrivacy(_id: ObjectId, owner: ObjectId, privacy: boolean) {
    await this.groupExists(_id);
    const group = await this.groups.readOne({ _id });
    if (group && (await this.inGroup(_id, owner))) {
      group.status = privacy;
      await this.groups.updateOne({ _id }, group);
      return { msg: "Group privacy successfully changed" };
    }
    return { msg: "Didn't change group privacy" };
  }

  async addPosts(_id: ObjectId, post: ObjectId) {
    await this.groupExists(_id);
    const group = await this.groups.readOne({ _id });
    if (group) {
      group.posts.push(post);
      await this.groups.updateOne({ _id }, group);
      return { msg: "Successfully added in a post" };
    }
  }

  async getGroup(_id: ObjectId) {
    await this.groupExists(_id);
    return await this.groups.readOne({ _id });
  }

  async getAllGroups() {
    return await this.groups.readMany({});
  }

  async kickFromAllGroups(user: ObjectId) {
    const groups = await this.getAllGroups();
    const deleted_group_word_list = new Array<ObjectId>();
    groups.forEach((group) => {
      // get rid of the user
      group.residents = group.residents.filter((resident) => {
        !resident.equals(user);
      });

      // if the user was the owner
      if (group.owner.equals(user))
        if (group.residents.length >= 1) {
          // set the first one to be owner
          group.owner = group.residents[0];
        } else {
          // no one is in here, so we delete it
          this.groups.deleteOne({ _id: group._id });
          deleted_group_word_list.push(group.censoredWordList);
        }
      // update the new group data
      this.groups.updateOne({ _id: group._id }, group);
    });
    return { msg: "Successfully kicked out everyone", wordList: deleted_group_word_list };
  }

  async getGroupsByResidentId(_id: ObjectId) {
    return await this.groups.readMany({ residents: { $elemMatch: { $eq: _id } } });
  }

  private async inGroup(_id: ObjectId, user: ObjectId) {
    await this.groupExists(_id);
    const group = await this.groups.readOne({ _id });
    if (group) {
      return group.residents.some((elt) => elt.equals(user));
    }
    return false;
  }
  private async groupExists(_id: ObjectId) {
    const maybeGroup = this.groups.readOne({ _id });
    if (!maybeGroup) {
      throw new NotFoundError("Can't find the group");
    } else {
      return maybeGroup;
    }
  }
}
