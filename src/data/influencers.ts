import influencer1 from "@/assets/influencer-1.jpg";
import influencer1LinkedIn from "@/assets/influencer-1-linkedin.jpg";
import influencer1TikTok from "@/assets/influencer-1-tiktok.jpg";
import influencer2 from "@/assets/influencer-2.jpg";
import influencer2LinkedIn from "@/assets/influencer-2-linkedin.jpg";
import influencer2TikTok from "@/assets/influencer-2-tiktok.jpg";
import influencer3 from "@/assets/influencer-3.jpg";
import influencer3LinkedIn from "@/assets/influencer-3-linkedin.jpg";
import influencer3TikTok from "@/assets/influencer-3-tiktok.jpg";
import influencer4 from "@/assets/influencer-4.jpg";
import influencer4LinkedIn from "@/assets/influencer-4-linkedin.jpg";
import influencer4TikTok from "@/assets/influencer-4-tiktok.jpg";
import influencer5 from "@/assets/influencer-5.jpg";
import influencer5LinkedIn from "@/assets/influencer-5-linkedin.jpg";
import influencer5TikTok from "@/assets/influencer-5-tiktok.jpg";
import influencer6 from "@/assets/influencer-6.jpg";
import influencer6LinkedIn from "@/assets/influencer-6-linkedin.jpg";
import influencer6TikTok from "@/assets/influencer-6-tiktok.jpg";
import influencer7 from "@/assets/influencer-7.jpg";
import influencer7LinkedIn from "@/assets/influencer-7-linkedin.jpg";
import influencer7TikTok from "@/assets/influencer-7-tiktok.jpg";
import influencer8 from "@/assets/influencer-8.jpg";
import influencer8LinkedIn from "@/assets/influencer-8-linkedin.jpg";
import influencer8TikTok from "@/assets/influencer-8-tiktok.jpg";

export type Category = "all" | "women" | "men" | "pets" | "other";

export type Platform = "instagram" | "linkedin" | "tiktok";

export interface ContentPricing {
  image: number;        // Base price for AI-generated image
  videoUpgrade: number; // Additional price to upgrade image → video
}

export interface PlatformData {
  avatar: string;
  followers: string;
  followersNum: number;
  engagement: string;
  avgViews: string;
  conversionRate: string;
  pricing: ContentPricing;
}

export interface Influencer {
  id: string;
  name: string;
  handle: string; // Instagram handle (primary)
  tiktokHandle: string;
  linkedinName: string;
  category: Category;
  niche: string;
  verified: boolean;
  location: string;
  age: number;
  bio: string;
  languages: string[];
  joinedYear: number;
  platforms: Record<Platform, PlatformData>;
}

/** Returns the appropriate display handle/name for a given platform */
export function getDisplayHandle(influencer: Influencer, platform: Platform): string {
  switch (platform) {
    case "tiktok":
      return influencer.tiktokHandle;
    case "linkedin":
      return influencer.linkedinName;
    case "instagram":
    default:
      return influencer.handle;
  }
}

export const pricingLabels = {
  image: "AI Image",
  videoUpgrade: "+ Video Upgrade",
};

export const platformLabels: Record<Platform, string> = {
  instagram: "Instagram",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
};

export const influencers: Influencer[] = [
  {
    id: "1",
    name: "Sophia Luxe",
    handle: "@sophia.luxe",
    tiktokHandle: "@sophia.luxe",
    linkedinName: "Sophia Luxe",
    category: "women",
    niche: "Fashion & Lifestyle",
    verified: true,
    location: "Milan, Italy",
    age: 27,
    bio: "Fashion-forward content creator blending haute couture with everyday style. Known for stunning editorial shoots and authentic brand partnerships that drive real engagement.",
    languages: ["English", "Italian", "French"],
    joinedYear: 2021,
    platforms: {
      instagram: {
        avatar: influencer1,
        followers: "1.2M",
        followersNum: 1200000,
        engagement: "4.8%",
        avgViews: "450K",
        conversionRate: "3.2%",
        pricing: { image: 199, videoUpgrade: 300 },
      },
      linkedin: {
        avatar: influencer1LinkedIn,
        followers: "85K",
        followersNum: 85000,
        engagement: "6.2%",
        avgViews: "32K",
        conversionRate: "5.1%",
        pricing: { image: 149, videoUpgrade: 250 },
      },
      tiktok: {
        avatar: influencer1TikTok,
        followers: "2.8M",
        followersNum: 2800000,
        engagement: "7.5%",
        avgViews: "1.2M",
        conversionRate: "2.8%",
        pricing: { image: 249, videoUpgrade: 400 },
      },
    },
  },
  {
    id: "2",
    name: "Aria Golden",
    handle: "@aria.golden",
    tiktokHandle: "@aria.golden",
    linkedinName: "Aria Golden",
    category: "women",
    niche: "Beauty & Travel",
    verified: true,
    location: "Los Angeles, USA",
    age: 24,
    bio: "Globetrotting beauty enthusiast sharing skincare secrets and hidden travel gems. Her authentic reviews and breathtaking travel content inspire wanderlust worldwide.",
    languages: ["English", "Spanish"],
    joinedYear: 2022,
    platforms: {
      instagram: {
        avatar: influencer2,
        followers: "890K",
        followersNum: 890000,
        engagement: "5.2%",
        avgViews: "320K",
        conversionRate: "4.1%",
        pricing: { image: 149, videoUpgrade: 250 },
      },
      linkedin: {
        avatar: influencer2LinkedIn,
        followers: "42K",
        followersNum: 42000,
        engagement: "5.8%",
        avgViews: "18K",
        conversionRate: "6.2%",
        pricing: { image: 99, videoUpgrade: 150 },
      },
      tiktok: {
        avatar: influencer2TikTok,
        followers: "1.9M",
        followersNum: 1900000,
        engagement: "8.1%",
        avgViews: "850K",
        conversionRate: "3.5%",
        pricing: { image: 199, videoUpgrade: 350 },
      },
    },
  },
  {
    id: "3",
    name: "Marcus Titan",
    handle: "@marcus.titan",
    tiktokHandle: "@marcus.titan",
    linkedinName: "Marcus Titan",
    category: "men",
    niche: "Fitness & Motivation",
    verified: true,
    location: "Dubai, UAE",
    age: 31,
    bio: "Elite fitness coach and motivational speaker. Transforms lives through science-backed training programs and raw, unfiltered motivational content that pushes boundaries.",
    languages: ["English", "Arabic"],
    joinedYear: 2020,
    platforms: {
      instagram: {
        avatar: influencer3,
        followers: "2.1M",
        followersNum: 2100000,
        engagement: "3.9%",
        avgViews: "780K",
        conversionRate: "2.8%",
        pricing: { image: 299, videoUpgrade: 450 },
      },
      linkedin: {
        avatar: influencer3LinkedIn,
        followers: "320K",
        followersNum: 320000,
        engagement: "4.5%",
        avgViews: "95K",
        conversionRate: "4.2%",
        pricing: { image: 199, videoUpgrade: 350 },
      },
      tiktok: {
        avatar: influencer3TikTok,
        followers: "4.5M",
        followersNum: 4500000,
        engagement: "6.8%",
        avgViews: "2.1M",
        conversionRate: "2.1%",
        pricing: { image: 399, videoUpgrade: 600 },
      },
    },
  },
  {
    id: "4",
    name: "Diego Flex",
    handle: "@diego.flex_",
    tiktokHandle: "@diego.flex_",
    linkedinName: "Diego Flex",
    category: "men",
    niche: "Fitness & Wellness",
    verified: false,
    location: "Barcelona, Spain",
    age: 28,
    bio: "Holistic wellness advocate combining functional fitness with mindfulness. Creates content that bridges the gap between physical strength and mental well-being.",
    languages: ["English", "Spanish", "Portuguese"],
    joinedYear: 2023,
    platforms: {
      instagram: {
        avatar: influencer4,
        followers: "750K",
        followersNum: 750000,
        engagement: "6.1%",
        avgViews: "280K",
        conversionRate: "5.3%",
        pricing: { image: 129, videoUpgrade: 200 },
      },
      linkedin: {
        avatar: influencer4LinkedIn,
        followers: "125K",
        followersNum: 125000,
        engagement: "5.2%",
        avgViews: "45K",
        conversionRate: "6.8%",
        pricing: { image: 89, videoUpgrade: 160 },
      },
      tiktok: {
        avatar: influencer4TikTok,
        followers: "1.6M",
        followersNum: 1600000,
        engagement: "9.2%",
        avgViews: "720K",
        conversionRate: "4.1%",
        pricing: { image: 179, videoUpgrade: 270 },
      },
    },
  },
  {
    id: "5",
    name: "Buddy Paws",
    handle: "@buddy.paws",
    tiktokHandle: "@buddypaws",
    linkedinName: "Buddy Paws",
    category: "pets",
    niche: "Pet Life & Products",
    verified: true,
    location: "Austin, USA",
    age: 4,
    bio: "The internet's favorite golden retriever! Buddy reviews toys, treats, and gear while showcasing heartwarming adventures with his human family.",
    languages: ["English"],
    joinedYear: 2022,
    platforms: {
      instagram: {
        avatar: influencer5,
        followers: "3.4M",
        followersNum: 3400000,
        engagement: "8.2%",
        avgViews: "1.2M",
        conversionRate: "6.1%",
        pricing: { image: 399, videoUpgrade: 600 },
      },
      linkedin: {
        avatar: influencer5LinkedIn,
        followers: "78K",
        followersNum: 78000,
        engagement: "4.8%",
        avgViews: "28K",
        conversionRate: "7.2%",
        pricing: { image: 149, videoUpgrade: 250 },
      },
      tiktok: {
        avatar: influencer5TikTok,
        followers: "8.2M",
        followersNum: 8200000,
        engagement: "12.5%",
        avgViews: "4.5M",
        conversionRate: "5.2%",
        pricing: { image: 599, videoUpgrade: 900 },
      },
    },
  },
  {
    id: "6",
    name: "Whiskers Co",
    handle: "@whiskers.co",
    tiktokHandle: "@whiskers.co",
    linkedinName: "Whiskers Co",
    category: "pets",
    niche: "Cat Content & Reviews",
    verified: true,
    location: "Tokyo, Japan",
    age: 3,
    bio: "Two Scottish Folds taking over the internet one purr at a time. Specializing in honest product reviews and impossibly cute content that melts hearts.",
    languages: ["English", "Japanese"],
    joinedYear: 2023,
    platforms: {
      instagram: {
        avatar: influencer6,
        followers: "1.8M",
        followersNum: 1800000,
        engagement: "7.5%",
        avgViews: "650K",
        conversionRate: "5.5%",
        pricing: { image: 249, videoUpgrade: 400 },
      },
      linkedin: {
        avatar: influencer6LinkedIn,
        followers: "45K",
        followersNum: 45000,
        engagement: "5.1%",
        avgViews: "18K",
        conversionRate: "6.8%",
        pricing: { image: 99, videoUpgrade: 180 },
      },
      tiktok: {
        avatar: influencer6TikTok,
        followers: "5.6M",
        followersNum: 5600000,
        engagement: "11.2%",
        avgViews: "2.8M",
        conversionRate: "4.8%",
        pricing: { image: 449, videoUpgrade: 700 },
      },
    },
  },
  {
    id: "7",
    name: "Elena Vibe",
    handle: "@elena.vibe",
    tiktokHandle: "@elena.vibe",
    linkedinName: "Elena Vibe",
    category: "women",
    niche: "Travel & Lifestyle",
    verified: false,
    location: "Lisbon, Portugal",
    age: 26,
    bio: "Digital nomad capturing the beauty of slow travel and local culture. Her laid-back aesthetic and genuine storytelling create deeply relatable lifestyle content.",
    languages: ["English", "Portuguese", "German"],
    joinedYear: 2023,
    platforms: {
      instagram: {
        avatar: influencer7,
        followers: "560K",
        followersNum: 560000,
        engagement: "5.8%",
        avgViews: "190K",
        conversionRate: "4.7%",
        pricing: { image: 99, videoUpgrade: 180 },
      },
      linkedin: {
        avatar: influencer7LinkedIn,
        followers: "28K",
        followersNum: 28000,
        engagement: "6.5%",
        avgViews: "12K",
        conversionRate: "7.1%",
        pricing: { image: 69, videoUpgrade: 130 },
      },
      tiktok: {
        avatar: influencer7TikTok,
        followers: "1.3M",
        followersNum: 1300000,
        engagement: "8.9%",
        avgViews: "580K",
        conversionRate: "3.9%",
        pricing: { image: 149, videoUpgrade: 250 },
      },
    },
  },
  {
    id: "8",
    name: "Nova Style",
    handle: "@nova.style",
    tiktokHandle: "@nova.style",
    linkedinName: "Nova Style",
    category: "other",
    niche: "Fashion & Editorial",
    verified: true,
    location: "Paris, France",
    age: 29,
    bio: "Avant-garde fashion editor pushing the boundaries of digital styling. Creates cinematic editorial content that blurs the line between art and commercial fashion.",
    languages: ["English", "French"],
    joinedYear: 2021,
    platforms: {
      instagram: {
        avatar: influencer8,
        followers: "920K",
        followersNum: 920000,
        engagement: "4.5%",
        avgViews: "340K",
        conversionRate: "3.8%",
        pricing: { image: 179, videoUpgrade: 270 },
      },
      linkedin: {
        avatar: influencer8LinkedIn,
        followers: "156K",
        followersNum: 156000,
        engagement: "5.8%",
        avgViews: "62K",
        conversionRate: "5.5%",
        pricing: { image: 129, videoUpgrade: 210 },
      },
      tiktok: {
        avatar: influencer8TikTok,
        followers: "2.2M",
        followersNum: 2200000,
        engagement: "7.8%",
        avgViews: "980K",
        conversionRate: "3.2%",
        pricing: { image: 229, videoUpgrade: 350 },
      },
    },
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
