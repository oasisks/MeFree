import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError } from "./errors";

export interface PointsDoc extends BaseDoc {
  user: ObjectId;
  point: number;
  streak: number;
}

export default class PointsConcept {
  public readonly points = new DocCollection<PointsDoc>("points");

  async initializePoints(user: ObjectId, point: number = 100, streak: number = 0) {
    await this.canCreate(user);
    const _id = await this.points.createOne({ user, point, streak });
    return { msg: "Successfully initialized the points", point: await this.points.readOne({ _id }) };
  }

  /**
   * Sends a valid amount of points to another user
   * @param sender the person sending the points
   * @param receiver the person receiving the points
   * @param amount the amount the sender wants to send
   */
  async sendPoints(sender: ObjectId, receiver: ObjectId, amount: number) {}

  /**
   * Updates the amount of points a user has by subtracting points
   * @param user The user we want to subtract points from
   * @param amount the amount we are subtracting cannot be more than the amount available
   */
  async subPoints(user: ObjectId, amount: number) {}

  /**
   * Updates the amount of points a user has by adding points
   * @param user The user we want to add points to
   * @param amount the amount we are adding to the user
   */
  async addPoints(user: ObjectId, amount: number) {}

  /**
   * Adds 1 to the users streak counter
   * @param user The user we want to modify the streak
   */
  async addStreak(user: ObjectId) {}

  /**
   * Resets the users streak
   * @param user The user we want to reset the streak
   */
  async resetStreak(user: ObjectId) {}

  private async canCreate(_id: ObjectId) {
    if (await this.points.readOne({ _id })) {
      throw new BadValuesError(`User with id ${_id} has already been created`);
    }
  }
}
