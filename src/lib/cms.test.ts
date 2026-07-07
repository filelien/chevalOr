import { describe, expect, it } from "vitest";
import { mergeHotelInfo } from "./cms";
import { HOTEL } from "./content";

describe("mergeHotelInfo", () => {
  it("fusionne les valeurs personnalisées avec les valeurs par défaut", () => {
    const result = mergeHotelInfo({
      tagline: "Luxe d'exception",
      address: "Anié, Togo",
      whatsapp: "22890000000",
      social: { facebook: "https://facebook.com/test" },
    });

    expect(result.name).toBe(HOTEL.name);
    expect(result.tagline).toBe("Luxe d'exception");
    expect(result.address).toBe("Anié, Togo");
    expect(result.whatsapp).toBe("22890000000");
    expect(result.social.facebook).toBe("https://facebook.com/test");
    expect(result.social.instagram).toBe(HOTEL.social.instagram);
  });
});
