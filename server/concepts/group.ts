import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";

export interface GroupDoc extends BaseDoc {
  owner: ObjectId;
  residents: Array<ObjectId>;
  status: boolean;
  censoredWordList: ObjectId;
  posts: Array<ObjectId>;
}

export default class GroupConcept {
  public readonly groups = new DocCollection<GroupDoc>("groups");

  /**
   * Groups don't have to be unique owner, as we can make as many groups as we want
   */
  async createGroup(owner: ObjectId, residents: Array<ObjectId>, status: boolean = false, censoredWordList: ObjectId, posts: Array<ObjectId>) {
    const _id = await this.groups.createOne({ owner, residents, status, censoredWordList, posts });
    return { msg: "Successfully created a group", id: this.groups.readOne({ _id }) };
  }

  async invite(_id: ObjectId, inviter: ObjectId, invitee: ObjectId) {
    await this.groupExists(_id);
    const group = await this.groups.readOne({ _id });
    if (group && group.residents.includes(inviter)) {
      group.residents.push(invitee);
      await this.groups.updateOne({ _id }, group);
      return { msg: "Successfully added the user" };
    }
    return { msg: "Didn't add the user" };
  }

  async deleteUser(_id: ObjectId, initiator: ObjectId, resident: ObjectId) {
    await this.groupExists(_id);
    const group = await this.groups.readOne({ _id });
    if (group && group.residents.includes(initiator)) {
      group.residents = group.residents.filter((elt) => elt != resident);
      await this.groups.updateOne({ _id }, group);
      return { msg: "Successfully deleted the user" };
    }
    return { msg: "Didn't delete the user" };
  }

  async deleteGroup(_id: ObjectId, initiator: ObjectId) {
    await this.groupExists(_id);
    const group = await this.groups.readOne({ _id });
    if (group && group.residents.includes(initiator)) {
      await this.groups.deleteOne({ _id });
      return { msg: "Group successfully deleted" };
    }
    return { msg: "Didn't delete the Group" };
  }

  async giveOwnerShip(_id: ObjectId, owner: ObjectId, newOwner: ObjectId) {
    await this.groupExists(_id);
    const group = await this.groups.readOne({ _id });
    if (group && group.residents.includes(owner)) {
      group.owner = newOwner;
      await this.groups.updateOne({ _id }, group);
      return { msg: "Group owner successfully changed" };
    }
    return { msg: "Didn't change group owner" };
  }

  async changePrivacy(_id: ObjectId, owner: ObjectId, privacy: boolean) {
    await this.groupExists(_id);
    const group = await this.groups.readOne({ _id });
    if (group && group.residents.includes(owner)) {
      group.status = privacy;
      await this.groups.updateOne({ _id }, group);
      return { msg: "Group privacy successfully changed" };
    }
    return { msg: "Didn't change group privacy" };
  }

  async getGroup(_id: ObjectId) {
    await this.groupExists(_id);
    return this.groups.readOne({ _id });
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
