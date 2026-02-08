// Define the translation structure with string types
export interface TranslationKeys {
  nav: {
    browseCreators: string;
    howItWorks: string;
    getStarted: string;
  };
  hero: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    description: string;
    getStarted: string;
    browseCreators: string;
    stats: {
      creators: string;
      reach: string;
      satisfaction: string;
    };
  };
  browse: {
    title: string;
    titleHighlight: string;
    description: string;
    viewAll: string;
    categories: {
      all: string;
      women: string;
      men: string;
      pets: string;
      other: string;
    };
  };
  howItWorks: {
    title: string;
    titleHighlight: string;
    description: string;
    steps: {
      upload: { title: string; description: string };
      match: { title: string; description: string };
      choose: { title: string; description: string };
      launch: { title: string; description: string };
    };
  };
  footer: {
    copyright: string;
  };
  niches: Record<string, string>;
  variationTones: {
    Professional: string;
    Casual: string;
    Bold: string;
  };
  contentTypes: {
    post: string;
    "post-description": string;
    video: string;
  };
  profile: {
    location: string;
    age: string;
    bio: string;
    languages: string;
    memberSince: string;
    stats: string;
    pricing: string;
    bookNow: string;
    close: string;
    yearsOld: string;
  };
  influencer: {
    followers: string;
    engagement: string;
    avgViews: string;
    conversionRate: string;
    verified: string;
    bookCreator: string;
    viewProfile: string;
    pricing: {
      photoPost: string;
      postCaption: string;
      fullVideo: string;
    };
  };
  booking: {
    back: string;
    book: string;
    steps: {
      plan: string;
      review: string;
      confirmed: string;
    };
    contentPlan: {
      title: string;
      description: string;
      addPost: string;
      post: string;
      postType: string;
      platform: string;
      constraints: string;
      constraintsHint: string;
      constraintsPlaceholder: string;
      designElements: string;
      designElementsHint: string;
      designElementsPlaceholder: string;
      generate: string;
      generating: string;
      postTypes: {
        announceProduct: string;
        promoteHackathon: string;
        announcePartnership: string;
        promoteDemoDay: string;
        custom: string;
      };
      platforms: {
        linkedin: string;
        instagram: string;
        tiktok: string;
      };
    };
    variations: {
      title: string;
      variation: string;
      selectBest: string;
      caption: string;
      imageDescription: string;
      textOverlay: string;
      select: string;
      selected: string;
      edit: string;
      save: string;
      cancel: string;
      regenerate: string;
      regenerateAll: string;
      provideFeedback: string;
      feedbackPlaceholder: string;
      regenerating: string;
    };
    summary: {
      title: string;
      creator: string;
      postsSelected: string;
      estimatedCost: string;
      confirmBooking: string;
      selectAll: string;
    };
    confirmed: {
      title: string;
      description: string;
      browseMore: string;
      backHome: string;
    };
    editPlan: string;
  };
  browsePage: {
    title: string;
    titleHighlight: string;
    description: string;
    filters: {
      search: string;
      niche: string;
      allNiches: string;
      sortBy: string;
      followers: string;
      engagement: string;
      price: string;
    };
    noResults: string;
  };
  getStarted: {
    title: string;
    titleHighlight: string;
    description: string;
    upload: {
      title: string;
      name: string;
      namePlaceholder: string;
      description: string;
      descriptionPlaceholder: string;
      images: string;
      uploadHint: string;
      submit: string;
      submitting: string;
    };
    matches: {
      title: string;
      description: string;
      matchScore: string;
    };
  };
  common: {
    loading: string;
    error: string;
    retry: string;
    from: string;
  };
}

export const en: TranslationKeys = {
  // Navbar
  nav: {
    browseCreators: "Browse Creators",
    howItWorks: "How It Works",
    getStarted: "Get Started",
  },

  // Hero Section
  hero: {
    badge: "AI-Powered Influencer Marketing",
    titleLine1: "The Future of",
    titleLine2: "Influence",
    description:
      "Upload your product, get matched with the perfect AI creators, and launch sponsored posts that convert — at any budget.",
    getStarted: "Get Started",
    browseCreators: "Browse Creators",
    stats: {
      creators: "AI Creators",
      reach: "Total Reach",
      satisfaction: "Satisfaction",
    },
  },

  // Browse Section
  browse: {
    title: "Meet Our",
    titleHighlight: "Creators",
    description:
      "AI-generated personas with real engagement metrics. Pick one that fits your brand.",
    viewAll: "View All Creators",
    categories: {
      all: "All Creators",
      women: "Women",
      men: "Men",
      pets: "Pets",
      other: "Others",
    },
  },

  // How It Works Section
  howItWorks: {
    title: "How It",
    titleHighlight: "Works",
    description: "From product upload to sponsored post — in four simple steps.",
    steps: {
      upload: {
        title: "Upload Your Product",
        description:
          "Share your product photos and a brief description of what you're selling.",
      },
      match: {
        title: "Get Matched",
        description:
          "Our AI suggests the best creators based on audience fit, engagement, and conversion rates.",
      },
      choose: {
        title: "Choose Your Content",
        description:
          "Select your creator and content type — photo post, post with caption, or full video.",
      },
      launch: {
        title: "Launch & Track",
        description:
          "Your sponsored content goes live. Track views, clicks, and conversions in real-time.",
      },
    },
  },

  // Footer
  footer: {
    copyright: "© 2026 InfluenceAI. All AI personas are fictional.",
  },

  profile: {
    location: "Location",
    age: "Age",
    bio: "About",
    languages: "Languages",
    memberSince: "Member since",
    stats: "Platform Stats",
    pricing: "Content Pricing",
    bookNow: "Book Now",
    close: "Close",
    yearsOld: "years old",
  },

  // Influencer Card
  influencer: {
    followers: "Followers",
    engagement: "Engagement",
    avgViews: "Avg. Views",
    conversionRate: "Conv. Rate",
    verified: "Verified",
    bookCreator: "Book Creator",
    viewProfile: "View Profile",
    pricing: {
      photoPost: "Photo Post",
      postCaption: "Post + Caption",
      fullVideo: "Full Video",
    },
  },

  // Booking Flow
  booking: {
    back: "Back",
    book: "Book",
    steps: {
      plan: "Content Plan",
      review: "Review Variations",
      confirmed: "Confirmed",
    },
    contentPlan: {
      title: "Content Plan",
      description:
        "Define the posts you want the creator to make. We'll generate variations for each.",
      addPost: "Add Post",
      post: "Post",
      postType: "Post Type / Intent",
      platform: "Platform",
      constraints: "Constraints",
      constraintsHint: "(date, tone, CTA - optional)",
      constraintsPlaceholder:
        "e.g., Launch date: March 15, Professional tone, CTA: Sign up now",
      designElements: "Design Elements / Content Details",
      designElementsHint: "(optional)",
      designElementsPlaceholder:
        "e.g., Speaker names, prize announcements, specific images to include, brand colors...",
      generate: "Generate Post Variations",
      generating: "Generating Variations...",
      postTypes: {
        announceProduct: "Announce a new product",
        promoteHackathon: "Promote an upcoming hackathon",
        announcePartnership: "Announce a partnership",
        promoteDemoDay: "Promote a venture track or demo day",
        custom: "Custom",
      },
      platforms: {
        linkedin: "LinkedIn",
        instagram: "Instagram",
        tiktok: "TikTok",
      },
    },
    variations: {
      title: "Generated Variations",
      variation: "Variation",
      selectBest: "Select the best variation for each post",
      caption: "Caption",
      imageDescription: "Image Description",
      textOverlay: "Text Overlay",
      select: "Select",
      selected: "Selected",
      edit: "Edit",
      save: "Save",
      cancel: "Cancel",
      regenerate: "Regenerate",
      regenerateAll: "Regenerate All",
      provideFeedback: "Provide Feedback",
      feedbackPlaceholder: "e.g., Make it more professional, add stronger CTA...",
      regenerating: "Regenerating...",
    },
    summary: {
      title: "Booking Summary",
      creator: "Creator",
      postsSelected: "posts selected",
      estimatedCost: "Estimated Cost",
      confirmBooking: "Confirm Booking",
      selectAll: "Please select a variation for each post",
    },
    confirmed: {
      title: "Booking Confirmed!",
      description:
        "Your content plan has been submitted to {creatorName}. You'll receive a confirmation email shortly with next steps.",
      browseMore: "Browse More Creators",
      backHome: "Back to Home",
    },
    editPlan: "Edit Content Plan",
  },

  // Browse Page
  browsePage: {
    title: "Discover",
    titleHighlight: "Creators",
    description:
      "Find the perfect AI-generated influencer for your brand. Filter by category, niche, or follower count.",
    filters: {
      search: "Search creators...",
      niche: "Filter by niche",
      allNiches: "All Niches",
      sortBy: "Sort by",
      followers: "Followers",
      engagement: "Engagement",
      price: "Price",
    },
    noResults: "No creators found matching your criteria.",
  },

  // Get Started Page
  niches: {
    "Fashion & Lifestyle": "Fashion & Lifestyle",
    "Beauty & Travel": "Beauty & Travel",
    "Fitness & Motivation": "Fitness & Motivation",
    "Fitness & Wellness": "Fitness & Wellness",
    "Pet Life & Products": "Pet Life & Products",
    "Cat Content & Reviews": "Cat Content & Reviews",
    "Travel & Lifestyle": "Travel & Lifestyle",
    "Fashion & Editorial": "Fashion & Editorial",
  },
  variationTones: {
    Professional: "Professional",
    Casual: "Casual",
    Bold: "Bold",
  },
  contentTypes: {
    post: "Photo Post",
    "post-description": "Post + Caption",
    video: "Full Video",
  },
  getStarted: {
    title: "Get",
    titleHighlight: "Started",
    description: "Upload your product and let our AI match you with the perfect creators.",
    upload: {
      title: "Product Details",
      name: "Product Name",
      namePlaceholder: "e.g., Premium Wireless Headphones",
      description: "Product Description",
      descriptionPlaceholder: "Describe your product, target audience, and marketing goals...",
      images: "Product Images",
      uploadHint: "Drag & drop or click to upload",
      submit: "Find Matching Creators",
      submitting: "Analyzing...",
    },
    matches: {
      title: "Your Top Matches",
      description: "Based on your product, we recommend these creators.",
      matchScore: "Match Score",
    },
  },

  // Common
  common: {
    loading: "Loading...",
    error: "Something went wrong",
    retry: "Try again",
    from: "From",
  },
};
