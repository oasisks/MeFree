import CategoryConcept from "./concepts/category";
import FriendConcept from "./concepts/friend";
import PointsConcept from "./concepts/points";
import PostConcept from "./concepts/post";
import UserConcept from "./concepts/user";
import WebSessionConcept from "./concepts/websession";

// App Definition using concepts
export const WebSession = new WebSessionConcept();
export const User = new UserConcept();
export const Post = new PostConcept();
export const Friend = new FriendConcept();
export const Category = new CategoryConcept();
export const Point = new PointsConcept();
