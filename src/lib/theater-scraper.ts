import * as cheerio from "cheerio";

const BASE_URL = "https://eiga.com";

export interface ScrapedScreen {
  name: string;
  seatCount: number;
}

export interface ScrapedTheater {
  name: string;
  address: string;
  url: string | null;
  prefectureId: number;
  screens: ScrapedScreen[];
  sourceUrl: string;
}

interface TheaterLink {
  name: string;
  path: string;
}

/**
 * 都道府県IDから映画館一覧を取得する（eiga.comスクレイピング）
 */
export async function scrapeTheatersByPrefecture(
  prefectureId: number
): Promise<ScrapedTheater[]> {
  const listUrl = `${BASE_URL}/theater/${prefectureId}/`;
  const theaterLinks = await scrapeTheaterList(listUrl);

  const theaters: ScrapedTheater[] = [];
  for (const link of theaterLinks) {
    try {
      const detail = await scrapeTheaterDetail(link.path, prefectureId);
      if (detail) {
        theaters.push(detail);
      }
    } catch {
      // 個別の映画館取得に失敗しても続行
      continue;
    }
    // レート制限対策: リクエスト間に少し待機
    await sleep(500);
  }

  return theaters;
}

/**
 * 都道府県ページから映画館リンク一覧を取得
 */
async function scrapeTheaterList(url: string): Promise<TheaterLink[]> {
  const html = await fetchPage(url);
  const $ = cheerio.load(html);
  const links: TheaterLink[] = [];

  // /theater/{prefectureId}/{areaCode}/{theaterId}/ パターンのリンクを収集
  $('a[href*="/theater/"]').each((_, el) => {
    const href = $(el).attr("href");
    const name = $(el).text().trim();
    if (href && name && isTheaterDetailPath(href)) {
      // 重複排除
      if (!links.some((l) => l.path === href)) {
        links.push({ name, path: href });
      }
    }
  });

  return links;
}

/**
 * 映画館詳細ページをスクレイピング
 */
async function scrapeTheaterDetail(
  path: string,
  prefectureId: number
): Promise<ScrapedTheater | null> {
  const url = `${BASE_URL}${path}`;
  const html = await fetchPage(url);
  const $ = cheerio.load(html);

  // 映画館名: h2 or h1 のメインタイトル
  const name = extractTheaterName($);
  if (!name) return null;

  // 住所の抽出
  const address = extractAddress($);

  // 公式サイトURL
  const officialUrl = extractOfficialUrl($);

  // スクリーン情報の抽出
  const screens = extractScreens($);

  return {
    name,
    address,
    url: officialUrl,
    prefectureId,
    screens,
    sourceUrl: url,
  };
}

/**
 * 映画館名を抽出
 */
function extractTheaterName($: cheerio.CheerioAPI): string | null {
  // h1タグのテキストを取得
  const h1Text = $("h1").first().text().trim();
  if (h1Text) return h1Text;

  // h2からフォールバック
  const h2Text = $("h2").first().text().trim();
  return h2Text || null;
}

/**
 * 住所を抽出
 */
function extractAddress($: cheerio.CheerioAPI): string {
  const bodyText = $.text();

  // 「所在地」ラベルの後の住所テキストを検索
  const addressMatch = bodyText.match(
    /所在地\s*([\s\S]*?)(?:電話番号|TEL|行き方|アクセス|駐車場|設備)/
  );
  if (addressMatch) {
    return addressMatch[1].trim().replace(/\s+/g, " ");
  }

  // 都道府県名で始まるテキストを探す
  const prefectureMatch = bodyText.match(
    /((?:北海道|東京都|大阪府|京都府|.{2,3}県)[^\n]{5,50})/
  );
  if (prefectureMatch) {
    return prefectureMatch[1].trim();
  }

  return "";
}

/**
 * 公式サイトURLを抽出
 */
function extractOfficialUrl($: cheerio.CheerioAPI): string | null {
  // 「公式サイト」「公式ページ」「映画館公式」テキスト付近のリンク
  let officialUrl: string | null = null;

  $("a").each((_, el) => {
    const text = $(el).text().trim();
    const href = $(el).attr("href");
    if (
      href &&
      (text.includes("公式") || text.includes("オフィシャル")) &&
      href.startsWith("http")
    ) {
      officialUrl = href;
      return false; // break
    }
  });

  return officialUrl;
}

/**
 * スクリーン情報を抽出
 */
function extractScreens($: cheerio.CheerioAPI): ScrapedScreen[] {
  const screens: ScrapedScreen[] = [];
  const bodyText = $.text();

  // 「スクリーンN：X座席」パターン
  const screenPattern = /(スクリーン\d+|シアター\d+|SCREEN\s*\d+)\D*?(\d+)\s*座席/gi;
  let match;
  while ((match = screenPattern.exec(bodyText)) !== null) {
    const name = match[1].trim();
    const seatCount = parseInt(match[2], 10);
    if (seatCount > 0 && !screens.some((s) => s.name === name)) {
      screens.push({ name, seatCount });
    }
  }

  // 上記で見つからない場合、別のパターンを試す
  // 「スクリーンN（X席）」パターン
  if (screens.length === 0) {
    const altPattern = /(スクリーン\d+|シアター\d+|SCREEN\s*\d+)\s*[（(]\s*(\d+)\s*席\s*[）)]/gi;
    while ((match = altPattern.exec(bodyText)) !== null) {
      const name = match[1].trim();
      const seatCount = parseInt(match[2], 10);
      if (seatCount > 0 && !screens.some((s) => s.name === name)) {
        screens.push({ name, seatCount });
      }
    }
  }

  // スクリーン番号順にソート
  screens.sort((a, b) => {
    const numA = parseInt(a.name.match(/\d+/)?.[0] || "0", 10);
    const numB = parseInt(b.name.match(/\d+/)?.[0] || "0", 10);
    return numA - numB;
  });

  return screens;
}

/**
 * 映画館詳細ページのパスかどうかを判定
 * /theater/{prefectureId}/{areaCode}/{theaterId}/ の形式
 */
function isTheaterDetailPath(href: string): boolean {
  return /^\/theater\/\d+\/\d+\/\d+\/?$/.test(href);
}

/**
 * ページHTMLを取得
 */
async function fetchPage(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; TheaterSeatMark/1.0; +https://github.com/theatre-seat-mark)",
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "ja,en;q=0.9",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.text();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
