import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { CensoredWordList, Friend, Point, Post, User, WebSession } from "./app";
import { PostDoc, PostOptions } from "./concepts/post";
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
  async createUser(session: WebSessionDoc, username: string, password: string) {
    WebSession.isLoggedOut(session);
    const user = (await User.create(username, password)).user;
    if (user) {
      await Point.initializePoints(user._id);
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

  // Just a tester
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
}

export default getExpressRouter(new Routes());
