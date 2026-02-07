import influencer1 from "@/assets/influencer-1.jpg";
import influencer2 from "@/assets/influencer-2.jpg";
import influencer3 from "@/assets/influencer-3.jpg";
import influencer4 from "@/assets/influencer-4.jpg";
import influencer5 from "@/assets/influencer-5.jpg";
import influencer6 from "@/assets/influencer-6.jpg";
import influencer7 from "@/assets/influencer-7.jpg";
import influencer8 from "@/assets/influencer-8.jpg";

export type Category = "all" | "women" | "men" | "pets" | "other";

export interface Influencer {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  category: Category;
  followers: string;
  engagement: string;
  niche: string;
  pricePerPost: number;
  verified: boolean;
}

export const influencers: Influencer[] = [
  {
    id: "1",
    name: "Sophia Luxe",
    handle: "@sophia.luxe",
    avatar: influencer1,
    category: "women",
    followers: "1.2M",
    engagement: "4.8%",
    niche: "Fashion & Lifestyle",
    pricePerPost: 299,
    verified: true,
  },
  {
    id: "2",
    name: "Aria Golden",
    handle: "@aria.golden",
    avatar: influencer2,
    category: "women",
    followers: "890K",
    engagement: "5.2%",
    niche: "Beauty & Travel",
    pricePerPost: 249,
    verified: true,
  },
  {
    id: "3",
    name: "Marcus Titan",
    handle: "@marcus.titan",
    avatar: influencer3,
    category: "men",
    followers: "2.1M",
    engagement: "3.9%",
    niche: "Fitness & Motivation",
    pricePerPost: 399,
    verified: true,
  },
  {
    id: "4",
    name: "Diego Flex",
    handle: "@diego.flex",
    avatar: influencer4,
    category: "men",
    followers: "750K",
    engagement: "6.1%",
    niche: "Fitness & Wellness",
    pricePerPost: 199,
    verified: false,
  },
  {
    id: "5",
    name: "Buddy Paws",
    handle: "@buddy.paws",
    avatar: influencer5,
    category: "pets",
    followers: "3.4M",
    engagement: "8.2%",
    niche: "Pet Life & Products",
    pricePerPost: 499,
    verified: true,
  },
  {
    id: "6",
    name: "Whiskers Co",
    handle: "@whiskers.co",
    avatar: influencer6,
    category: "pets",
    followers: "1.8M",
    engagement: "7.5%",
    niche: "Cat Content & Reviews",
    pricePerPost: 349,
    verified: true,
  },
  {
    id: "7",
    name: "Elena Vibe",
    handle: "@elena.vibe",
    avatar: influencer7,
    category: "women",
    followers: "560K",
    engagement: "5.8%",
    niche: "Travel & Lifestyle",
    pricePerPost: 179,
    verified: false,
  },
  {
    id: "8",
    name: "Nova Style",
    handle: "@nova.style",
    avatar: influencer8,
    category: "other",
    followers: "920K",
    engagement: "4.5%",
    niche: "Fashion & Editorial",
    pricePerPost: 279,
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
