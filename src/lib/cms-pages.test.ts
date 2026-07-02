import { describe, expect, it } from "vitest";
import { findCmsPageByPath, type CmsPage } from "@/lib/cms-pages";

describe("findCmsPageByPath", () => {
  it("matches CMS pages by normalized path", () => {
    const pages: CmsPage[] = [
      {
        id: "about",
        slug: "a-propos",
        title: "À propos",
        path: "/a-propos",
        description: "",
        published: true,
        sections: [],
      },
    ];

    expect(findCmsPageByPath("/a-propos", pages)?.id).toBe("about");
    expect(findCmsPageByPath("a-propos", pages)?.id).toBe("about");
    expect(findCmsPageByPath("/inexistant", pages)).toBeNull();
  });
});
