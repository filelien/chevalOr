import { defineEventHandler, setHeader } from "h3";
import { buildSitemapXml } from "../src/lib/seo";

export default defineEventHandler((event) => {
  setHeader(event, "Content-Type", "application/xml; charset=utf-8");
  return buildSitemapXml();
});
