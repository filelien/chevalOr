import { describe, expect, it } from "vitest";
import { filterGalleryItems, sortGalleryItems, type GalleryItem } from "./gallery-admin";

const baseItems: GalleryItem[] = [
  {
    id: "2",
    title: "Suite Royale",
    category: "Chambres",
    url: "https://cdn.example.com/rooms/suite.webp",
    media_type: "image",
    sort_order: 2,
    is_published: false,
    created_at: "2025-01-10T00:00:00.000Z",
  },
  {
    id: "1",
    title: "Restaurant principal",
    category: "Restaurant",
    url: "https://cdn.example.com/restaurant/chef.jpg",
    media_type: "image",
    sort_order: 1,
    is_published: true,
    created_at: "2025-02-20T00:00:00.000Z",
  },
  {
    id: "3",
    title: "Spa extérieur",
    category: "Extérieur",
    url: "https://cdn.example.com/outdoor/spa.png",
    media_type: "image",
    sort_order: 3,
    is_published: true,
    created_at: "2025-03-01T00:00:00.000Z",
  },
];

describe("gallery helpers", () => {
  it("filters by search and status", () => {
    const result = filterGalleryItems(baseItems, {
      search: "suite",
      published: "draft",
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });

  it("sorts media by recency by default", () => {
    const result = sortGalleryItems(baseItems);
    expect(result.map((item) => item.id)).toEqual(["3", "1", "2"]);
  });

  it("filters by favorite and tags", () => {
    const result = filterGalleryItems(
      [
        ...baseItems,
        {
          id: "4",
          title: "Bar lounge",
          category: "Restaurant",
          url: "https://cdn.example.com/bar/lounge.jpg",
          media_type: "image",
          sort_order: 4,
          is_published: true,
          created_at: "2025-04-01T00:00:00.000Z",
          is_favorite: true,
          tags: ["cocktail", "bar"],
        },
      ],
      {
        favorite: true,
        tags: "cocktail",
      },
    );

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("4");
  });

  it("sorts media by usage and size", () => {
    const items = [
      { ...baseItems[0], usage_count: 1, file_size: 75_000 },
      { ...baseItems[1], usage_count: 10, file_size: 120_000 },
      { ...baseItems[2], usage_count: 5, file_size: 35_000 },
    ];

    const usageSorted = sortGalleryItems(items, "usage");
    expect(usageSorted.map((item) => item.id)).toEqual(["1", "3", "2"]);

    const sizeSorted = sortGalleryItems(items, "size");
    expect(sizeSorted.map((item) => item.id)).toEqual(["1", "2", "3"]);
  });
});
