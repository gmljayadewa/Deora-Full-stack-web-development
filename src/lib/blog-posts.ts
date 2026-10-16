export type BlogSection = {
  heading?: string;
  paragraphs?: string[];
  list?: string[];
};

export type BlogPost = {
  slug: string; // used in the URL: /blog/<slug>
  title: string;
  excerpt: string;
  date: string; // YYYY-MM-DD
  readTime: string;
  image?: string;
  sections: BlogSection[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "how-to-brew-herbal-tea",
    title: "How to Brew a Good Cup of Herbal Tea",
    excerpt:
      "A few simple steps to get the best flavour from your herbal tea.Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets. It has survived not only many decades, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised thanks to these sheets and more recently with desktop publishing software like Aldus PageMaker and Microsoft Word including versions of Lorem Ipsum.",
    date: "2026-10-14",
    readTime: "2 min read",
    image: "/images/products/tea/amla.jpg",
    sections: [
      {
        paragraphs: [
          "Herbal tea is easy to make, but a few small steps can make the taste much better.",
        ],
      },
      {
        heading: "Simple steps",
        list: [
          "Boil fresh water and let it rest for about 30 seconds.",
          "Add the tea to your cup or teapot.",
          "Pour the hot water over the tea and cover the cup.",
          "Let it steep for 5 to 7 minutes.",
          "Strain, and add honey or jaggery if you like.",
        ],
      },
      {
        heading: "Good to know",
        paragraphs: [
          "Each tea can be prepared a little differently, so always check the usage instructions on the product page and on the pack.",
        ],
      },
    ],
  },
  {
    slug: "how-to-store-herbal-products",
    title: "How to Store Herbal Products So They Stay Fresh",
    excerpt:
      "Keep your capsules, teas and powders fresh with these easy storage tips.",
    date: "2026-10-14",
    readTime: "2 min read",
    image: "/images/products/capsules/gotukola.jpg",
    sections: [
      {
        paragraphs: [
          "Good storage keeps the flavour and quality of your products for longer.",
        ],
      },
      {
        heading: "Storage tips",
        list: [
          "Keep products in a cool, dry place.",
          "Keep them away from direct sunlight and the cooker.",
          "Close the pack or bottle tightly after each use.",
          "Use a clean, dry spoon for powders.",
          "Check the expiry date on the pack.",
        ],
      },
    ],
  },
  {
    slug: "cooking-with-sri-lankan-curry-powders",
    title: "Cooking with Sri Lankan Curry Powders",
    excerpt: "A simple guide to choosing the right curry powder for your meal.",
    date: "2026-10-14",
    readTime: "3 min read",
    image: "/images/products/spices/roasted-curry-powder.jpg",
    sections: [
      {
        paragraphs: [
          "Sri Lankan cooking uses different curry powders for different dishes. Here is a simple way to think about them.",
        ],
      },
      {
        heading: "Which one to use",
        list: [
          "Curry powder: an everyday blend for vegetable and dhal curries.",
          "Roasted curry powder: the spices are roasted first, which gives a deeper, darker flavour.",
          "Fish curry powder: a blend made for fish curries.",
          "Meat curry powder: a blend made for chicken and meat curries.",
        ],
      },
      {
        heading: "A small tip",
        paragraphs: [
          "Add the powder early so it cooks into the gravy, and adjust the amount to your taste.",
        ],
      },
    ],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
