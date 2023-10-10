import CategoryConcept from "./concepts/category";
import CensoredWordListConcept from "./concepts/censoredwordlist";
import FriendConcept from "./concepts/friend";
import PointsConcept from "./concepts/points";
import PostConcept from "./concepts/post";
import ProfileConcept from "./concepts/profile";
import UserConcept from "./concepts/user";
import WebSessionConcept from "./concepts/websession";

// App Definition using concepts
export const WebSession = new WebSessionConcept();
export const User = new UserConcept();
export const Post = new PostConcept();
export const Friend = new FriendConcept();
export const Category = new CategoryConcept();
export const Point = new PointsConcept();
export const CensoredWordList = new CensoredWordListConcept();
export const Profile = new ProfileConcept();
