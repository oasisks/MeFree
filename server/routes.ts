import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Category, CensoredWordList, DiscussionTopic, Friend, Group, Point, Post, Profile, User, Vote, WebSession } from "./app";
import { PostDoc, PostOptions } from "./concepts/post";
import { ProfileDoc } from "./concepts/profile";
import { UserDoc } from "./concepts/user";
import { WebSessionDoc } from "./concepts/websession";
import Responses from "./responses";

class Routes {
  @Router.get("/session")
  async getSessionUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.getUserById(user);
  }

  @Router.get("/users")
  async getUsers() {
    return await User.getUsers();
  }

  @Router.get("/users/:username")
  async getUser(username: string) {
    return await User.getUserByUsername(username);
  }

  @Router.post("/users")
  async createUser(session: WebSessionDoc, username: string, password: string, name: string, sex: string, dob: string) {
    WebSession.isLoggedOut(session);
    const user = (await User.create(username, password)).user;
    if (user) {
      const pointDoc = (await Point.initializePoints(user._id)).point;
      await Profile.initializeProfile(user._id, name, sex, dob, pointDoc!._id);
    }
    return { msg: "Successfully created an user", user: user };
  }

  @Router.patch("/users")
  async updateUser(session: WebSessionDoc, update: Partial<UserDoc>) {
    const user = WebSession.getUser(session);
    return await User.update(user, update);
  }

  @Router.delete("/users")
  async deleteUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    WebSession.end(session);
    await Profile.deleteProfile(user);
    await Point.deletePoints(user);

    // when the user gets deleted, the user needs to not exist in any group
    const word_lists = (await Group.kickFromAllGroups(user)).wordList;
    await Promise.all(word_lists.map((word) => CensoredWordList.delete(word)));
    return await User.delete(user);
  }

  @Router.post("/login")
  async logIn(session: WebSessionDoc, username: string, password: string) {
    const u = await User.authenticate(username, password);
    WebSession.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/logout")
  async logOut(session: WebSessionDoc) {
    WebSession.end(session);
    return { msg: "Logged out!" };
  }

  @Router.get("/posts")
  async getPosts(author?: string) {
    let posts;
    if (author) {
      const id = (await User.getUserByUsername(author))._id;
      posts = await Post.getByAuthor(id);
    } else {
      posts = await Post.getPosts({});
    }
    return Responses.posts(posts);
  }

  @Router.post("/posts")
  async createPost(session: WebSessionDoc, content: string, options?: PostOptions) {
    const user = WebSession.getUser(session);
    const created = await Post.create(user, content, options);
    return { msg: created.msg, post: await Responses.post(created.post) };
  }

  @Router.patch("/posts/:_id")
  async updatePost(session: WebSessionDoc, _id: ObjectId, update: Partial<PostDoc>) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _id);
    return await Post.update(_id, update);
  }

  @Router.delete("/posts/:_id")
  async deletePost(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _id);
    return Post.delete(_id);
  }

  @Router.get("/friends")
  async getFriends(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.idsToUsernames(await Friend.getFriends(user));
  }

  @Router.delete("/friends/:friend")
  async removeFriend(session: WebSessionDoc, friend: string) {
    const user = WebSession.getUser(session);
    const friendId = (await User.getUserByUsername(friend))._id;
    return await Friend.removeFriend(user, friendId);
  }

  @Router.get("/friend/requests")
  async getRequests(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await Responses.friendRequests(await Friend.getRequests(user));
  }

  @Router.post("/friend/requests/:to")
  async sendFriendRequest(session: WebSessionDoc, to: string) {
    const user = WebSession.getUser(session);
    const toId = (await User.getUserByUsername(to))._id;
    return await Friend.sendRequest(user, toId);
  }

  @Router.delete("/friend/requests/:to")
  async removeFriendRequest(session: WebSessionDoc, to: string) {
    const user = WebSession.getUser(session);
    const toId = (await User.getUserByUsername(to))._id;
    return await Friend.removeRequest(user, toId);
  }

  @Router.put("/friend/accept/:from")
  async acceptFriendRequest(session: WebSessionDoc, from: string) {
    const user = WebSession.getUser(session);
    const fromId = (await User.getUserByUsername(from))._id;
    return await Friend.acceptRequest(fromId, user);
  }

  @Router.put("/friend/reject/:from")
  async rejectFriendRequest(session: WebSessionDoc, from: string) {
    const user = WebSession.getUser(session);
    const fromId = (await User.getUserByUsername(from))._id;
    return await Friend.rejectRequest(fromId, user);
  }

  // begin testers
  @Router.post("/censoredwordlist")
  async createWordList() {
    return await CensoredWordList.create();
  }

  @Router.patch("/censorwordlist/add/:_id")
  async updateWordList(_id: ObjectId, word: string) {
    return await CensoredWordList.addWord(_id, word);
  }

  @Router.patch("/censorwordlist/delete/:_id")
  async deleteWordFromList(_id: ObjectId, word: string) {
    return await CensoredWordList.deleteWord(_id, word);
  }

  @Router.delete("/censorwordlist/:_id")
  async deleteWordList(_id: ObjectId) {
    return await CensoredWordList.delete(_id);
  }

  @Router.get("/censorwordlist/:_id")
  async getCensoredWordList(_id: ObjectId) {
    return await CensoredWordList.getList(_id);
  }

  @Router.post("/points")
  async initializePoints(session: WebSessionDoc, amount: number = 100, streak: number = 0) {
    const user = WebSession.getUser(session);
    return await Point.initializePoints(user, amount, streak);
  }

  @Router.get("/point")
  async getPoint(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await Point.getPoint(user);
  }

  @Router.patch("/point/:amount")
  async updatePoints(session: WebSessionDoc, amount: string) {
    const user = WebSession.getUser(session);
    const amount_num = parseInt(amount);
    if (amount_num >= 0) {
      return await Point.addPoints(user, amount_num);
    }
    return await Point.subPoints(user, -amount_num);
  }

  @Router.patch("/point/requests/:to")
  async sendPoints(session: WebSessionDoc, to: string, amount: string) {
    const user = WebSession.getUser(session);
    const toId = (await User.getUserByUsername(to))._id;
    const amount_num = parseInt(amount);
    // console.log(user, toId, amount_num);
    return await Point.sendPoints(user, toId, amount_num);
  }

  /**
   * We want to update the streak if the user logs back in within
   * 24 hours
   */
  @Router.patch("/points/streak")
  async updateStreak(session: WebSessionDoc) {
    const date = new Date();
    const user = WebSession.getUser(session);
    const data = await Point.getPoint(user);
    const secondsInADay = 86400;
    if (data) {
      const diff = date.getTime() - data.dateUpdated.getTime();
      if (diff / 1000 > secondsInADay) {
        return await Point.resetStreak(user);
      }
    }
    return await Point.addStreak(user);
  }
  // end testers

  @Router.get("/profile")
  async getProfile(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await Profile.getProfile(user);
  }

  @Router.patch("/profile")
  async updateProfile(session: WebSessionDoc, update: Partial<ProfileDoc>) {
    const user = WebSession.getUser(session);
    return await Profile.update(user, update);
  }

  @Router.post("/groups")
  async createGroup(session: WebSessionDoc, status: boolean) {
    const user = WebSession.getUser(session);
    const posts = new Array<ObjectId>();
    const residents = new Array<ObjectId>();
    const censoredWordList = await CensoredWordList.create();

    residents.push(user);

    return await Group.createGroup(user, residents, status, censoredWordList.list!._id, posts);
  }

  @Router.get("/group")
  async getUserGroups(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await Group.getGroupsByResidentId(user);
  }

  @Router.get("/groups")
  async getAllGroups() {
    return await Group.getAllGroups();
  }

  @Router.patch("/groups/:_id/:invitee")
  async invite(session: WebSessionDoc, _id: ObjectId, invitee: string) {
    const inviter = WebSession.getUser(session);
    const inviteeId = (await User.getUserByUsername(invitee))._id;
    return await Group.invite(_id, inviter, inviteeId);
  }

  @Router.post("/groups/:_id/delete/:target")
  async deleteUserFromGroupVote(session: WebSessionDoc, _id: ObjectId, target: ObjectId, reason: string) {
    const initiator = WebSession.getUser(session);
    const group = await Group.getGroup(_id);

    // to vote someone out of the group, the initiator needs to pay a price
    // of 100 points
    await Point.subPoints(initiator, 100);
    console.log("I am here");
    // we then create the vote
    const startTime = new Date();
    const endTime = new Date();
    endTime.setDate(endTime.getDate() + 1);
    console.log(group);
    console.log(_id);
    const vote = await Vote.createVote(initiator, _id, `Ban user ${target}`, reason, group!.residents, startTime, endTime, "BAN", target);

    return await Group.addVote(_id, vote.vote!._id);
  }

  @Router.post("/groups/:_id")
  async deleteGroupVote(session: WebSessionDoc, _id: ObjectId, reason: string) {
    const initiator = WebSession.getUser(session);
    const group = await Group.getGroup(_id);

    // to vote someone out of the group, the initiator needs to pay a price
    // of 100 points
    await Point.subPoints(initiator, 100);

    // we then create the vote
    const startTime = new Date();
    const endTime = new Date();
    endTime.setDate(endTime.getDate() + 1);
    const vote = await Vote.createVote(initiator, _id, `Delete group ${_id}`, reason, group!.residents, startTime, endTime, "DELETE", _id);

    return await Group.addVote(_id, vote.vote!._id);
  }

  @Router.post("/groups/:_id/censoredwords")
  async addCensorWord(session: WebSessionDoc, _id: ObjectId, reason: string, word: string) {
    const initiator = WebSession.getUser(session);
    const group = await Group.getGroup(_id);

    // to vote someone out of the group, the initiator needs to pay a price
    // of 100 points
    await Point.subPoints(initiator, 100);

    // we then create the vote
    const startTime = new Date();
    const endTime = new Date();
    endTime.setDate(endTime.getDate() + 1);
    const vote = await Vote.createVote(initiator, _id, `Censor word: ${word}`, reason, group!.residents, startTime, endTime, "CENSOR", word);

    return await Group.addVote(_id, vote.vote!._id);
  }

  @Router.post("/groups/:_id/uncensoredwords")
  async deleteCensorWord(session: WebSessionDoc, _id: ObjectId, reason: string, word: string) {
    const initiator = WebSession.getUser(session);
    const group = await Group.getGroup(_id);
    console.log(_id);

    // to vote someone out of the group, the initiator needs to pay a price
    // of 100 points
    await Point.subPoints(initiator, 100);

    // we then create the vote
    const startTime = new Date();
    const endTime = new Date();
    endTime.setDate(endTime.getDate() + 1);
    const vote = await Vote.createVote(initiator, _id, `Uncensor word: ${word}`, reason, group!.residents, startTime, endTime, "UNCENSOR", word);

    return await Group.addVote(_id, vote.vote!._id);
  }

  // this one right here checks for all the votes within a group
  // we don't care if the user is logged in or not
  // once it finds things that are approved it will then perform
  // the action
  @Router.get("/groups/:_id/votes")
  async checkForVotes(_id: ObjectId) {
    const group = await Group.getGroup(_id);
    const votes = group!.votes;

    const results = await Promise.all(votes.map((vote) => Vote.checkVote(vote)));
    const statuses = new Array<string>();
    results.forEach(async (result) => {
      const status = result.status;
      const vote = result.vote;
      statuses.push(status);
      if (status === "Approved" && vote) {
        // this is where we want to perform the actions
        const target = vote.target;
        const banType = vote.banType.toLowerCase();
        const initiator = vote.initiator;
        const censoredWord = group!.censoredWordList;

        if (banType === "ban" && typeof target !== "string") {
          await Group.deleteUser(_id, initiator, target);
        } else if (banType === "censor" && typeof target === "string") {
          await CensoredWordList.addWord(censoredWord, target);
        } else if (banType === "uncensor" && typeof target === "string") {
          await CensoredWordList.deleteWord(censoredWord, target);
        } else {
          return await Group.deleteGroup(_id, initiator);
        }
      }
    });
    return { msg: "Finished looking at all the votes", status: statuses };
  }

  @Router.post("/groups/:_id/:newOwner")
  async giveOwnerShip(session: WebSessionDoc, _id: ObjectId, newOwner: string) {
    const initiator = WebSession.getUser(session);
    const newOwnerId = (await User.getUserByUsername(newOwner))._id;
    return await Group.giveOwnerShip(_id, initiator, newOwnerId);
  }

  @Router.patch("/groups/:_id/:post")
  async addPost(_id: ObjectId, post: ObjectId) {
    return await Group.addPosts(_id, post);
  }

  @Router.post("/groups/:_id")
  async changePrivacy(session: WebSessionDoc, _id: ObjectId, privacy: string) {
    const owner = WebSession.getUser(session);
    const _privacy = privacy === "true" ? true : false;
    return await Group.changePrivacy(_id, owner, _privacy);
  }

  @Router.post("/discussions")
  async createTopic(session: WebSessionDoc, title: string, category: string) {
    const user = WebSession.getUser(session);
    const posts = new Array<ObjectId>();
    return await DiscussionTopic.createTopic(title, posts, false, user, category);
  }

  @Router.patch("/discussions/:_id/posts/:post")
  async addPosts(session: WebSessionDoc, _id: ObjectId, post: ObjectId) {
    await WebSession.isLoggedIn(session);
    return await DiscussionTopic.add(_id, post);
  }

  @Router.patch("/discussions/:_id/archive/:status")
  async changeArchive(session: WebSessionDoc, _id: ObjectId, status: string) {
    await WebSession.isLoggedIn(session);
    const s = status === "true";
    return await DiscussionTopic.changeArchive(_id, s);
  }

  @Router.get("/spotlights")
  async getSpotLights(session: WebSessionDoc) {
    await WebSession.isLoggedIn(session);
    const categories = await Category.getAllCategories("discussion");
    return await DiscussionTopic.getSpotLights(categories);
  }

  @Router.get("/discussions")
  async getAllTopics(session: WebSessionDoc) {
    await WebSession.isLoggedIn(session);
    return await DiscussionTopic.getAllTopics();
  }

  @Router.patch("/votes/:_id")
  async voteYes(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    console.log(_id, user);
    return await Vote.voteYes(_id, user);
  }
}

export default getExpressRouter(new Routes());
