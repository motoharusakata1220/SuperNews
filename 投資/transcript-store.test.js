import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";
import {
  createStore,
  saveTranscript,
  getExistingVideoIds,
  filterNewVideos,
} from "./transcript-store.js";

describe("TranscriptStore", () => {
  let tmpDir;
  let store;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "supernews-test-"));
    store = createStore(tmpDir);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe("saveTranscript", () => {
    it("字幕テキストをファイルに保存する", () => {
      const video = {
        videoId: "abc123def45",
        title: "テスト動画",
        url: "https://www.youtube.com/watch?v=abc123def45",
        published: "2026-04-01T10:00:00+00:00",
      };
      const text = "これはテスト字幕です";

      saveTranscript(store, video, text);

      const filePath = path.join(tmpDir, "transcripts", "abc123def45.txt");
      expect(fs.existsSync(filePath)).toBe(true);

      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toContain("タイトル: テスト動画");
      expect(content).toContain("これはテスト字幕です");
    });

    it("summaries.jsonに動画情報を追記する", () => {
      const video = {
        videoId: "abc123def45",
        title: "テスト動画",
        url: "https://www.youtube.com/watch?v=abc123def45",
        published: "2026-04-01T10:00:00+00:00",
      };

      saveTranscript(store, video, "字幕テキスト");

      const summariesPath = path.join(tmpDir, "summaries.json");
      const summaries = JSON.parse(fs.readFileSync(summariesPath, "utf-8"));
      expect(summaries).toHaveLength(1);
      expect(summaries[0].videoId).toBe("abc123def45");
    });

    it("複数回保存するとsummaries.jsonに蓄積される", () => {
      saveTranscript(store, {
        videoId: "vid1_______",
        title: "動画1",
        url: "https://www.youtube.com/watch?v=vid1_______",
        published: "2026-04-01",
      }, "字幕1");

      saveTranscript(store, {
        videoId: "vid2_______",
        title: "動画2",
        url: "https://www.youtube.com/watch?v=vid2_______",
        published: "2026-04-02",
      }, "字幕2");

      const summariesPath = path.join(tmpDir, "summaries.json");
      const summaries = JSON.parse(fs.readFileSync(summariesPath, "utf-8"));
      expect(summaries).toHaveLength(2);
    });
  });

  describe("getExistingVideoIds", () => {
    it("summaries.jsonがないとき空のSetを返す", () => {
      const ids = getExistingVideoIds(store);
      expect(ids.size).toBe(0);
    });

    it("保存済みの動画IDをSetで返す", () => {
      saveTranscript(store, {
        videoId: "abc123def45",
        title: "テスト",
        url: "url",
        published: "2026-04-01",
      }, "テキスト");

      const ids = getExistingVideoIds(store);
      expect(ids.has("abc123def45")).toBe(true);
    });
  });

  describe("filterNewVideos", () => {
    it("既存の動画を除外して新規のみ返す", () => {
      saveTranscript(store, {
        videoId: "existing____",
        title: "既存",
        url: "url",
        published: "2026-04-01",
      }, "テキスト");

      const allVideos = [
        { videoId: "existing____", title: "既存" },
        { videoId: "newvideo____", title: "新規" },
      ];

      const newVideos = filterNewVideos(store, allVideos);
      expect(newVideos).toHaveLength(1);
      expect(newVideos[0].videoId).toBe("newvideo____");
    });

    it("全て新規のとき全て返す", () => {
      const videos = [
        { videoId: "vid1_______", title: "動画1" },
        { videoId: "vid2_______", title: "動画2" },
      ];
      expect(filterNewVideos(store, videos)).toHaveLength(2);
    });
  });
});
