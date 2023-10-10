import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotFoundError } from "./errors";

export interface PointsDoc extends BaseDoc {
  user: ObjectId;
  amount: number;
  streak: number;
}

export default class PointsConcept {
  public readonly points = new DocCollection<PointsDoc>("points");

  async initializePoints(user: ObjectId, amount: number = 100, streak: number = 0) {
    await this.canCreate(user);
    const _id = await this.points.createOne({ user, amount, streak });
    return { msg: "Successfully initialized the points", point: await this.points.readOne({ _id }) };
  }

  /**
   * Sends a valid amount of points to another user
   * @param sender the person sending the points
   * @param receiver the person receiving the points
   * @param amount the amount the sender wants to send
   */
  async sendPoints(sender: ObjectId, receiver: ObjectId, amount: number) {
    // we need to first sub the points the sender is sending
    await this.subPoints(sender, amount);
    // we then add the points to the receiver
    await this.addPoints(receiver, amount);

    return { msg: `Successfully send ${amount} points` };
  }

  /**
   * Updates the amount of points a user has by subtracting points
   * @param user The user we want to subtract points from
   * @param amount the amount we are subtracting cannot be more than the amount available
   */
  async subPoints(user: ObjectId, amount: number) {
    await this.userExist(user);
    const point = await this.points.readOne({ user });
    if (point) {
      if (amount > point.amount) {
        throw new BadValuesError(`User: ${point.amount}; Amount to be Subtracted: ${amount}; Can't subtract`);
      }
      point.amount -= amount;
      await this.points.updateOne({ user }, point);
      return { msg: "Successfully subtract points" };
    }
  }

  /**
   * Updates the amount of points a user has by adding points
   * @param user The user we want to add points to
   * @param amount the amount we are adding to the user
   */
  async addPoints(user: ObjectId, amount: number) {
    await this.userExist(user);
    const point = await this.points.readOne({ user });
    if (point) {
      point.amount += amount;
      await this.points.updateOne({ user }, point);
      return { msg: "Successfully added points" };
    }
  }

  /**
   * Adds 1 to the users streak counter
   * @param user The user we want to modify the streak
   */
  async addStreak(user: ObjectId) {
    await this.userExist(user);
    const point = await this.points.readOne({ user });
    if (point) {
      point.streak += 1;
      await this.points.updateOne({ user }, point);
      return { msg: "Successfully added 1 to the streak " };
    }
  }

  /**
   * Resets the users streak
   * @param user The user we want to reset the streak
   */
  async resetStreak(user: ObjectId) {
    await this.userExist(user);
    const point = await this.points.readOne({ user });
    if (point) {
      point.streak = 0;
      await this.points.updateOne({ user }, point);
      return { msg: "Successfully reset the streak" };
    }
  }

  async getPoint(user: ObjectId) {
    await this.userExist(user);
    return await this.points.readOne({ user });
  }

  /**
   * Checks if we this username has not been created.
   * @param _id the user id
   */
  private async canCreate(_id: ObjectId) {
    if (await this.points.readOne({ user: _id })) {
      throw new BadValuesError(`User with id ${_id} has already been created`);
    }
  }

  /**
   * This is to check if a particular user exists within the collection
   * @param _id the id of the users
   */
  private async userExist(_id: ObjectId) {
    const maybeUser = await this.points.readOne({ user: _id });
    if (!maybeUser) {
      throw new NotFoundError(`User with id ${_id} does not exist`);
    }
  }
}
