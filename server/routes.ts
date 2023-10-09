import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { CensoredWordList, Friend, Post, User, WebSession } from "./app";
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
    return await User.create(username, password);
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

  @Router.patch("/censorwordlist/:_id")
  async updateWordList(_id: ObjectId, word: string) {
    return await CensoredWordList.addWord(_id, word);
  }

  // // New Concepts
  // @Router.post("/point")
  // async initializePoints(session: WebSessionDoc) {
  //   const user = WebSession.getUser(session);
  //   return await Point.initializePoints(user);
  // }
  // @Router.post("/point/send/:to/:amount")
  // async sendPoints(session: WebSessionDoc, to: ObjectId, amount: number) {
  //   const user = WebSession.getUser(session);
  //   return await Point.sendPoints(user, to, amount);
  // }
  // @Router.patch("/point/reset-streak")
  // async resetStreak(session: WebSessionDoc) {
  //   const user = WebSession.getUser(session);
  //   return await Point.resetStreak(user);
  // }

  // @Router.patch("/point/update-streak")
  // async updateStreak(session: WebSessionDoc) {
  //   const user = WebSession.getUser(session);
  //   return await Point.addStreak(user);
  // }

  // @Router.patch("/points/use-points/:amount")
  // async usePoints(session: WebSessionDoc, amount: number) {
  //   const user = WebSession.getUser(session);
  //   return await Point.subPoints(user, amount);
  // }

  // @Router.post("/category/:label/:items")
  // async createCategory(label: string, items: Set<ObjectId>) {
  //   return await Category.createCategory(label, items);
  // }

  // @Router.delete("/category/:label")
  // async deleteCategory(label: ObjectId) {
  //   return await Category.deleteCategory(label);
  // }

  // @Router.delete("/category/:label/:elt")
  // async deleteElement(label: ObjectId, element: ObjectId) {
  //   return await Category.deleteElement(label, element);
  // }

  // @Router.patch("/category/:label/:elt")
  // async addElement(label: ObjectId, element: ObjectId) {
  //   return await Category.addElement(label, element);
  // }

  // // Outline of the rest
  // @Router.post("/group/")
  // async createGroup(websession: WebSessionDoc, users: Set<ObjectId>, name: string, isPrivate: boolean) {}

  // @Router.post("/group/request/:to")
  // async inviteToGroup(websession: WebSessionDoc, group: ObjectId, user: ObjectId) {}

  // @Router.delete("group/delete/:user")
  // async deleteFromGroup(websession: WebSessionDoc, group: ObjectId, user: ObjectId) {}

  // @Router.delete("group/delete/:group")
  // async deleteGroup(websession: WebSessionDoc, group: ObjectId) {}

  // @Router.patch("group/ownership/:user")
  // async giveOwnership(websession: WebSessionDoc, owner: ObjectId, user: ObjectId) {}

  // @Router.patch("group/id/:isPublic")
  // async changePublicity(websession: WebSessionDoc, group: ObjectId, isPublic: boolean) {}

  // @Router.get("group/ids/:id")
  // async getGroup(websession: WebSessionDoc, group: ObjectId) {}

  // @Router.post("component")
  // async createComponent(websession: WebSessionDoc, data: ObjectId) {}

  // @Router.patch("component/dimensions/id/:width/:height")
  // async changeComponentDimension(websession: WebSessionDoc, width: number, height: number) {}

  // @Router.patch("component/positions/id/:x/:y")
  // async changePosition(websession: WebSessionDoc, x: number, y: number) {}

  // @Router.patch("component/fonts/id/:font/:size/:color")
  // async changeText(websession: WebSessionDoc, font: number, size: number, color: number) {}

  // @Router.post("vote/ban")
  // async createBanVote(websession: WebSessionDoc, target: ObjectId) {}

  // @Router.post("vote/word")
  // async createWordVote(websession: WebSessionDoc, word: String) {}

  // @Router.get("search/:query")
  // async search(websession: WebSessionDoc, query: ObjectId) {}

  // @Router.post("discussionTopic")
  // async createDiscussionTopic(title: String, owner: ObjectId) {}

  // @Router.post("discussionTopic/posts/:msg")
  // async addDiscussionPost(topic: ObjectId, post: string) {}

  // @Router.post("discussion/archives")
  // async archiveDiscussionTopic(topic: ObjectId) {}

  // /**
  //  * Generates a spotlight from a category grabbing a random user.
  //  */
  // @Router.post("spotlight")
  // async createSpotlight(category: ObjectId) {}

  // @Router.post("spotlight/posts/:msg")
  // async addPost(spotlight: ObjectId) {}

  // @Router.get("profile")
  // async getProfile(websession: WebSessionDoc) {}

  // @Router.post("censoredWordList")
  // async createWordList(title: String, scope: ObjectId) {}

  // @Router.patch("censoredWordList/add/:word")
  // async addWord(wordList: ObjectId, word: string) {}

  // @Router.patch("censoredWordList/delete/:word")
  // async deleteWord(wordList: ObjectId, word: string) {}
}

export default getExpressRouter(new Routes());
