// Import all community images
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

const postImages: Record<string, string> = {
  "/community/post01.jpg": post01,
  "/community/post02.jpg": post02,
  "/community/post03.jpg": post03,
  "/community/post04.jpg": post04,
  "/community/post05.jpg": post05,
  "/community/post06.jpg": post06,
  "/community/post07.jpg": post07,
  "/community/post08.jpg": post08,
  "/community/post09.jpg": post09,
  "/community/post10.jpg": post10,
  "/community/post11.jpg": post11,
  "/community/post12.jpg": post12,
  "/community/post13.jpg": post13,
  "/community/post14.jpg": post14,
  "/community/post15.jpg": post15,
  "/community/post16.jpg": post16,
  "/community/post17.jpg": post17,
  "/community/post18.jpg": post18,
  "/community/post19.jpg": post19,
  "/community/post20.jpg": post20,
};

const authorImages: Record<string, string> = {
  "/community/author01.jpg": author01,
  "/community/author02.jpg": author02,
  "/community/author03.jpg": author03,
  "/community/author04.jpg": author04,
  "/community/author05.jpg": author05,
  "/community/author06.jpg": author06,
  "/community/author07.jpg": author07,
  "/community/author08.jpg": author08,
  "/community/author09.jpg": author09,
  "/community/author10.jpg": author10,
  "/community/author11.jpg": author11,
  "/community/author12.jpg": author12,
  "/community/author13.jpg": author13,
  "/community/author14.jpg": author14,
  "/community/author15.jpg": author15,
  "/community/author16.jpg": author16,
  "/community/author17.jpg": author17,
  "/community/author18.jpg": author18,
  "/community/author19.jpg": author19,
  "/community/author20.jpg": author20,
};

/**
 * Get the actual image URL from a database path
 * Handles both local asset paths and external URLs
 */
export const getCommunityPostImage = (path: string): string => {
  if (!path) return "/placeholder.svg";
  
  // If it's already a full URL, return as-is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  
  // Check if we have a local mapping
  return postImages[path] || path;
};

export const getCommunityAuthorImage = (path: string): string => {
  if (!path) return "/placeholder.svg";
  
  // If it's already a full URL, return as-is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  
  // Check if we have a local mapping
  return authorImages[path] || path;
};
