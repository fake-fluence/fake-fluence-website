import influencer1 from "@/assets/influencer-1.jpg";
import influencer2 from "@/assets/influencer-2.jpg";
import influencer3 from "@/assets/influencer-3.jpg";
import influencer4 from "@/assets/influencer-4.jpg";
import influencer5 from "@/assets/influencer-5.jpg";
import influencer6 from "@/assets/influencer-6.jpg";
import influencer7 from "@/assets/influencer-7.jpg";
import influencer8 from "@/assets/influencer-8.jpg";

export type Category = "all" | "women" | "men" | "pets" | "other";

export type ContentType = "post" | "post-description" | "video";

export interface ContentPricing {
  post: number;
  "post-description": number;
  video: number;
}

export interface Influencer {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  category: Category;
  followers: string;
  followersNum: number;
  engagement: string;
  niche: string;
  pricing: ContentPricing;
  avgViews: string;
  conversionRate: string;
  verified: boolean;
}

export const contentTypeLabels: Record<ContentType, string> = {
  post: "Photo Post",
  "post-description": "Post + Caption",
  video: "Full Video",
};

export const influencers: Influencer[] = [
  {
    id: "1",
    name: "Sophia Luxe",
    handle: "@sophia.luxe",
    avatar: influencer1,
    category: "women",
    followers: "1.2M",
    followersNum: 1200000,
    engagement: "4.8%",
    niche: "Fashion & Lifestyle",
    pricing: { post: 199, "post-description": 299, video: 599 },
    avgViews: "450K",
    conversionRate: "3.2%",
    verified: true,
  },
  {
    id: "2",
    name: "Aria Golden",
    handle: "@aria.golden",
    avatar: influencer2,
    category: "women",
    followers: "890K",
    followersNum: 890000,
    engagement: "5.2%",
    niche: "Beauty & Travel",
    pricing: { post: 149, "post-description": 249, video: 499 },
    avgViews: "320K",
    conversionRate: "4.1%",
    verified: true,
  },
  {
    id: "3",
    name: "Marcus Titan",
    handle: "@marcus.titan",
    avatar: influencer3,
    category: "men",
    followers: "2.1M",
    followersNum: 2100000,
    engagement: "3.9%",
    niche: "Fitness & Motivation",
    pricing: { post: 299, "post-description": 449, video: 899 },
    avgViews: "780K",
    conversionRate: "2.8%",
    verified: true,
  },
  {
    id: "4",
    name: "Diego Flex",
    handle: "@diego.flex",
    avatar: influencer4,
    category: "men",
    followers: "750K",
    followersNum: 750000,
    engagement: "6.1%",
    niche: "Fitness & Wellness",
    pricing: { post: 129, "post-description": 199, video: 399 },
    avgViews: "280K",
    conversionRate: "5.3%",
    verified: false,
  },
  {
    id: "5",
    name: "Buddy Paws",
    handle: "@buddy.paws",
    avatar: influencer5,
    category: "pets",
    followers: "3.4M",
    followersNum: 3400000,
    engagement: "8.2%",
    niche: "Pet Life & Products",
    pricing: { post: 399, "post-description": 599, video: 1199 },
    avgViews: "1.2M",
    conversionRate: "6.1%",
    verified: true,
  },
  {
    id: "6",
    name: "Whiskers Co",
    handle: "@whiskers.co",
    avatar: influencer6,
    category: "pets",
    followers: "1.8M",
    followersNum: 1800000,
    engagement: "7.5%",
    niche: "Cat Content & Reviews",
    pricing: { post: 249, "post-description": 399, video: 799 },
    avgViews: "650K",
    conversionRate: "5.5%",
    verified: true,
  },
  {
    id: "7",
    name: "Elena Vibe",
    handle: "@elena.vibe",
    avatar: influencer7,
    category: "women",
    followers: "560K",
    followersNum: 560000,
    engagement: "5.8%",
    niche: "Travel & Lifestyle",
    pricing: { post: 99, "post-description": 169, video: 349 },
    avgViews: "190K",
    conversionRate: "4.7%",
    verified: false,
  },
  {
    id: "8",
    name: "Nova Style",
    handle: "@nova.style",
    avatar: influencer8,
    category: "other",
    followers: "920K",
    followersNum: 920000,
    engagement: "4.5%",
    niche: "Fashion & Editorial",
    pricing: { post: 179, "post-description": 279, video: 549 },
    avgViews: "340K",
    conversionRate: "3.8%",
    verified: true,
  },
];

export const categories: { id: Category; label: string; emoji: string }[] = [
  { id: "all", label: "All Creators", emoji: "✨" },
  { id: "women", label: "Women", emoji: "👩" },
  { id: "men", label: "Men", emoji: "💪" },
  { id: "pets", label: "Pets", emoji: "🐾" },
  { id: "other", label: "Others", emoji: "🌟" },
];

export const niches = [
  "All Niches",
  "Fashion & Lifestyle",
  "Beauty & Travel",
  "Fitness & Motivation",
  "Fitness & Wellness",
  "Pet Life & Products",
  "Cat Content & Reviews",
  "Travel & Lifestyle",
  "Fashion & Editorial",
];
