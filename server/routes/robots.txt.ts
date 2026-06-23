import { defineEventHandler, setHeader } from "h3";
import { buildRobotsTxt } from "../src/lib/seo";

export default defineEventHandler((event) => {
  setHeader(event, "Content-Type", "text/plain; charset=utf-8");
  return buildRobotsTxt();
});
