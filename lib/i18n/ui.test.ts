import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeLocale,
  translateFootballText,
  translateRefreshMessage
} from "./ui.ts";

test("normalizeLocale defaults to zh unless the locale is en", () => {
  assert.equal(normalizeLocale(undefined), "zh");
  assert.equal(normalizeLocale(null), "zh");
  assert.equal(normalizeLocale("zh"), "zh");
  assert.equal(normalizeLocale("en"), "en");
  assert.equal(normalizeLocale("fr"), "zh");
});

test("translateRefreshMessage converts known sync messages into english", () => {
  assert.equal(
    translateRefreshMessage("en", "已刷新 Arsenal 的 2024 赛季数据"),
    "Synced Arsenal for the 2024 season."
  );
  assert.equal(
    translateRefreshMessage("en", "今日免费 API 配额已用尽，当前先展示 Arsenal 的缓存/历史档案。"),
    "Today's free API quota is exhausted. Showing cached or historical data for Arsenal for now."
  );
});

test("translateFootballText keeps chinese in zh mode and translates known placeholders in en mode", () => {
  assert.equal(translateFootballText("zh", "待同步"), "待同步");
  assert.equal(translateFootballText("en", "待同步"), "Pending sync");
  assert.equal(
    translateFootballText("en", "当前俱乐部暂无缓存赛程，接入 API 后会在这里显示下一场比赛或实时比分。"),
    "No club schedule is cached yet. Once the API is connected, the next match or live score will appear here."
  );
});
