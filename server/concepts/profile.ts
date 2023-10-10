import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotAllowedError, NotFoundError } from "./errors";

export interface ProfileDoc extends BaseDoc {
  name: string;
  sex: string;
  dob: string;
  user: ObjectId;
  points: ObjectId;
}

export default class ProfileConcept {
  private readonly profiles = new DocCollection<ProfileDoc>("profiles");

  async initializeProfile(user: ObjectId, name: string, sex: string, dob: string, points: ObjectId) {
    await this.canCreate(user);
    const _id = await this.profiles.createOne({ name, sex, dob, user, points });

    return { msg: "Successfully created a profile", profile: await this.profiles.readOne({ _id }) };
  }

  async update(user: ObjectId, update: Partial<ProfileDoc>) {
    await this.profileExists(user);
    await this.sanitizeUpdate(update);
    const profile = await this.profiles.readOne({ user });
    if (profile) {
      profile.name = update.name ? update.name : profile.name;
      profile.sex = update.sex ? update.sex : profile.sex;
      profile.dob = update.dob ? update.dob : profile.dob;
      await this.profiles.updateOne({ user }, profile);
      return { msg: "Successfully updated the profile" };
    }
  }

  private sanitizeUpdate(update: Partial<ProfileDoc>) {
    // Make sure the update cannot change the author.
    const allowedUpdates = ["name", "sex", "dob"];
    for (const key in update) {
      if (!allowedUpdates.includes(key)) {
        throw new NotAllowedError(`Cannot update '${key}' field!`);
      }
    }
  }

  async deleteProfile(user: ObjectId) {
    await this.profiles.deleteOne({ user });
    return { msg: "Successfully deleted the profile" };
  }

  async getProfile(user: ObjectId) {
    await this.profileExists(user);
    return await this.profiles.readOne({ user });
  }

  /**
   * Checks if we this username has not been created.
   * @param _id the user id
   */
  private async canCreate(_id: ObjectId) {
    if (await this.profiles.readOne({ user: _id })) {
      throw new BadValuesError(`User with id ${_id} has already been created`);
    }
  }

  async profileExists(_id: ObjectId) {
    const maybeUser = await this.profiles.readOne({ user: _id });
    if (maybeUser === null) {
      throw new NotFoundError(`User not found!`);
    }
  }
}
