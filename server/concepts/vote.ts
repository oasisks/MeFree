import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotFoundError } from "./errors";

export interface VoteDoc extends BaseDoc {
  initiator: ObjectId;
  title: string;
  reason: string;
  scope: ObjectId;
  target: ObjectId | string;
  yesCount: Array<ObjectId>;
  banType: string;
  totalCount: Array<ObjectId>;
  startTime: Date;
  endTime: Date;
}

export default class VoteConcept {
  public readonly votes = new DocCollection<VoteDoc>("votes");

  /**
   *
   * @param scope the place the vote was created
   * @param title a title
   * @param reason the reason the ban was created
   * @param totalCount the total number of people relevant for this vote
   * @param startTime the start time. Default to now
   * @param endTime the end time
   * @param banType the type of ban
   */
  async createVote(
    initiator: ObjectId,
    scope: ObjectId,
    title: string,
    reason: string,
    totalCount: Array<ObjectId>,
    startTime: Date = new Date(),
    endTime: Date,
    banType: string,
    target: ObjectId | string,
  ) {
    await this.checkVoteType(banType);
    const yesCount = new Array<ObjectId>();
    const _id = await this.votes.createOne({ initiator, title, reason, scope, target, yesCount, banType, totalCount, startTime, endTime });

    return { msg: "Successfully created a vote", vote: await this.votes.readOne({ _id }) };
  }

  /**
   * Votes yes on a vote
   * @param _id Vote id
   * @param user the user who voted
   */
  async voteYes(_id: ObjectId, user: ObjectId) {
    console.log("I am here");
    await this.voteExists(_id);
    console.log("I am here");
    await this.userInVote(_id, user);
    console.log("I am here");
    const vote = await this.votes.readOne({ _id });
    console.log("I am here");
    console.log(vote);
    if (vote) {
      console.log("I ma here");
      vote.yesCount.push(user);
      await this.votes.updateOne({ _id }, vote);
      return { msg: "Successfully voted yes", yesCount: vote.yesCount };
    }
  }

  /**
   * Grabs all the votes within a scope
   * @param scope The scope where the vote exists
   * @returns returns all the votes within in that scope.
   */
  async getAllVotes(scope: ObjectId) {
    const votes = await this.votes.readMany({ scope });
    return { votes: votes };
  }

  /**
   * Checks that a given vote is finished.
   * Finished can either mean that the vote expired or 51% of the people have already
   * voted yes. If that happens, the vote will be deleted from the database.
   * @param _id The vote id
   * @returns a promise that gives the status and the vote
   */
  async checkVote(_id: ObjectId) {
    await this.voteExists(_id);
    const vote = await this.votes.readOne({ _id });
    if (vote) {
      const total = vote.totalCount.length;
      const yes = vote.yesCount.length;
      const now = new Date();
      const endTime = vote.endTime;

      if (now > endTime) {
        await this.votes.deleteOne({ _id });
        return { status: "Expired", vote: vote };
      }

      const percentage = yes / total;
      if (percentage >= 0.51) {
        await this.votes.deleteOne({ _id });
        return { status: "Approved", vote: vote };
      }
    }
    return { status: "Pending", vote: vote };
  }

  private async voteExists(_id: ObjectId) {
    const maybeVote = await this.votes.readOne({ _id });
    if (!maybeVote) {
      throw new BadValuesError("The vote does not exist");
    }
  }

  private async userInVote(_id: ObjectId, user: ObjectId) {
    await this.voteExists(_id);
    const vote = await this.votes.readOne({ _id });
    if (vote && !vote.totalCount.some((elt) => elt.equals(user))) {
      throw new NotFoundError(`Can't find user with id ${user}`);
    }
  }

  private async checkVoteType(vote: string) {
    const voteTypes = ["ban", "censor", "uncensor", "delete"];
    if (!voteTypes.includes(vote.toLowerCase())) {
      throw new BadValuesError(`The vote ${vote} does not exist`);
    }
  }
}
