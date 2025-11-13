import post01 from "@/assets/community/post01.jpg";
import post02 from "@/assets/community/post02.jpg";
import post03 from "@/assets/community/post03.jpg";
import post04 from "@/assets/community/post04.jpg";
import post05 from "@/assets/community/post05.jpg";
import post06 from "@/assets/community/post06.jpg";
import post07 from "@/assets/community/post07.jpg";
import post08 from "@/assets/community/post08.jpg";
import post09 from "@/assets/community/post09.jpg";
import post10 from "@/assets/community/post10.jpg";
import post11 from "@/assets/community/post11.jpg";
import post12 from "@/assets/community/post12.jpg";
import post13 from "@/assets/community/post13.jpg";
import post14 from "@/assets/community/post14.jpg";
import post15 from "@/assets/community/post15.jpg";
import post16 from "@/assets/community/post16.jpg";
import post17 from "@/assets/community/post17.jpg";
import post18 from "@/assets/community/post18.jpg";
import post19 from "@/assets/community/post19.jpg";
import post20 from "@/assets/community/post20.jpg";

import author01 from "@/assets/community/author01.jpg";
import author02 from "@/assets/community/author02.jpg";
import author03 from "@/assets/community/author03.jpg";
import author04 from "@/assets/community/author04.jpg";
import author05 from "@/assets/community/author05.jpg";
import author06 from "@/assets/community/author06.jpg";
import author07 from "@/assets/community/author07.jpg";
import author08 from "@/assets/community/author08.jpg";
import author09 from "@/assets/community/author09.jpg";
import author10 from "@/assets/community/author10.jpg";
import author11 from "@/assets/community/author11.jpg";
import author12 from "@/assets/community/author12.jpg";
import author13 from "@/assets/community/author13.jpg";
import author14 from "@/assets/community/author14.jpg";
import author15 from "@/assets/community/author15.jpg";
import author16 from "@/assets/community/author16.jpg";
import author17 from "@/assets/community/author17.jpg";
import author18 from "@/assets/community/author18.jpg";
import author19 from "@/assets/community/author19.jpg";
import author20 from "@/assets/community/author20.jpg";

export interface CommunityPostData {
  id: number;
  titleKey: string;
  previewKey: string;
  tagKey: string;
  thumbnail: string;
  authorNameKey: string;
  authorAvatar: string;
  createdAt: string;
}

export const communityPostsData: CommunityPostData[] = [
  {
    id: 1,
    titleKey: "community.posts.post1.title",
    previewKey: "community.posts.post1.preview",
    tagKey: "community.tags.herbs",
    thumbnail: post01,
    authorNameKey: "community.posts.post1.author",
    authorAvatar: author01,
    createdAt: "2024-11-01"
  },
  {
    id: 2,
    titleKey: "community.posts.post2.title",
    previewKey: "community.posts.post2.preview",
    tagKey: "community.tags.elderly",
    thumbnail: post02,
    authorNameKey: "community.posts.post2.author",
    authorAvatar: author02,
    createdAt: "2024-11-02"
  },
  {
    id: 3,
    titleKey: "community.posts.post3.title",
    previewKey: "community.posts.post3.preview",
    tagKey: "community.tags.elderly",
    thumbnail: post03,
    authorNameKey: "community.posts.post3.author",
    authorAvatar: author03,
    createdAt: "2024-11-03"
  },
  {
    id: 4,
    titleKey: "community.posts.post4.title",
    previewKey: "community.posts.post4.preview",
    tagKey: "community.tags.caregiving",
    thumbnail: post04,
    authorNameKey: "community.posts.post4.author",
    authorAvatar: author04,
    createdAt: "2024-11-04"
  },
  {
    id: 5,
    titleKey: "community.posts.post5.title",
    previewKey: "community.posts.post5.preview",
    tagKey: "community.tags.health",
    thumbnail: post05,
    authorNameKey: "community.posts.post5.author",
    authorAvatar: author05,
    createdAt: "2024-11-05"
  },
  {
    id: 6,
    titleKey: "community.posts.post6.title",
    previewKey: "community.posts.post6.preview",
    tagKey: "community.tags.caregiving",
    thumbnail: post06,
    authorNameKey: "community.posts.post6.author",
    authorAvatar: author06,
    createdAt: "2024-11-06"
  },
  {
    id: 7,
    titleKey: "community.posts.post7.title",
    previewKey: "community.posts.post7.preview",
    tagKey: "community.tags.herbs",
    thumbnail: post07,
    authorNameKey: "community.posts.post7.author",
    authorAvatar: author07,
    createdAt: "2024-11-07"
  },
  {
    id: 8,
    titleKey: "community.posts.post8.title",
    previewKey: "community.posts.post8.preview",
    tagKey: "community.tags.health",
    thumbnail: post08,
    authorNameKey: "community.posts.post8.author",
    authorAvatar: author08,
    createdAt: "2024-11-08"
  },
  {
    id: 9,
    titleKey: "community.posts.post9.title",
    previewKey: "community.posts.post9.preview",
    tagKey: "community.tags.caregiving",
    thumbnail: post09,
    authorNameKey: "community.posts.post9.author",
    authorAvatar: author09,
    createdAt: "2024-11-09"
  },
  {
    id: 10,
    titleKey: "community.posts.post10.title",
    previewKey: "community.posts.post10.preview",
    tagKey: "community.tags.herbs",
    thumbnail: post10,
    authorNameKey: "community.posts.post10.author",
    authorAvatar: author10,
    createdAt: "2024-11-10"
  },
  {
    id: 11,
    titleKey: "community.posts.post11.title",
    previewKey: "community.posts.post11.preview",
    tagKey: "community.tags.elderly",
    thumbnail: post11,
    authorNameKey: "community.posts.post11.author",
    authorAvatar: author11,
    createdAt: "2024-11-11"
  },
  {
    id: 12,
    titleKey: "community.posts.post12.title",
    previewKey: "community.posts.post12.preview",
    tagKey: "community.tags.health",
    thumbnail: post12,
    authorNameKey: "community.posts.post12.author",
    authorAvatar: author12,
    createdAt: "2024-11-12"
  },
  {
    id: 13,
    titleKey: "community.posts.post13.title",
    previewKey: "community.posts.post13.preview",
    tagKey: "community.tags.herbs",
    thumbnail: post13,
    authorNameKey: "community.posts.post13.author",
    authorAvatar: author13,
    createdAt: "2024-11-13"
  },
  {
    id: 14,
    titleKey: "community.posts.post14.title",
    previewKey: "community.posts.post14.preview",
    tagKey: "community.tags.caregiving",
    thumbnail: post14,
    authorNameKey: "community.posts.post14.author",
    authorAvatar: author14,
    createdAt: "2024-11-14"
  },
  {
    id: 15,
    titleKey: "community.posts.post15.title",
    previewKey: "community.posts.post15.preview",
    tagKey: "community.tags.health",
    thumbnail: post15,
    authorNameKey: "community.posts.post15.author",
    authorAvatar: author15,
    createdAt: "2024-11-15"
  },
  {
    id: 16,
    titleKey: "community.posts.post16.title",
    previewKey: "community.posts.post16.preview",
    tagKey: "community.tags.elderly",
    thumbnail: post16,
    authorNameKey: "community.posts.post16.author",
    authorAvatar: author16,
    createdAt: "2024-11-16"
  },
  {
    id: 17,
    titleKey: "community.posts.post17.title",
    previewKey: "community.posts.post17.preview",
    tagKey: "community.tags.herbs",
    thumbnail: post17,
    authorNameKey: "community.posts.post17.author",
    authorAvatar: author17,
    createdAt: "2024-11-17"
  },
  {
    id: 18,
    titleKey: "community.posts.post18.title",
    previewKey: "community.posts.post18.preview",
    tagKey: "community.tags.health",
    thumbnail: post18,
    authorNameKey: "community.posts.post18.author",
    authorAvatar: author18,
    createdAt: "2024-11-18"
  },
  {
    id: 19,
    titleKey: "community.posts.post19.title",
    previewKey: "community.posts.post19.preview",
    tagKey: "community.tags.elderly",
    thumbnail: post19,
    authorNameKey: "community.posts.post19.author",
    authorAvatar: author19,
    createdAt: "2024-11-19"
  },
  {
    id: 20,
    titleKey: "community.posts.post20.title",
    previewKey: "community.posts.post20.preview",
    tagKey: "community.tags.caregiving",
    thumbnail: post20,
    authorNameKey: "community.posts.post20.author",
    authorAvatar: author20,
    createdAt: "2024-11-20"
  }
];
