"""
빅테크 및 국내 IT 기업 뉴스 수집 스크립트
Usage: python collect_bigtech_news.py
Cron:  0 6,12,18 * * * /path/to/venv/bin/python /path/to/collect_bigtech_news.py

Requirements:
    pip install feedparser supabase python-dotenv requests
"""

import os
import re
import logging
from datetime import datetime, timezone

import feedparser
import requests
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

SUPABASE_URL = os.environ["VITE_SUPABASE_URL"]
SUPABASE_KEY = os.environ["VITE_SUPABASE_ANON_KEY"]

SOURCES = [
    # 빅테크
    {"id": "google",    "name": "Google",    "rss": "https://blog.google/technology/ai/rss/"},
    {"id": "deepmind",  "name": "DeepMind",  "rss": "https://blog.google/technology/deepmind/rss/"},
    {"id": "meta",      "name": "Meta",      "rss": "https://engineering.fb.com/feed/"},
    {"id": "openai",    "name": "OpenAI",    "rss": "https://openai.com/blog/rss.xml"},
    {"id": "anthropic", "name": "Anthropic", "rss": "https://www.anthropic.com/blog/rss.xml"},
    # 국내 IT
    {"id": "naver",     "name": "Naver D2",  "rss": "https://d2.naver.com/rss.xml"},
    {"id": "kakao",     "name": "Kakao",     "rss": "https://tech.kakao.com/feed"},
    {"id": "kakaopay",  "name": "KakaoPay", "rss": "https://tech.kakaopay.com/feed"},
    {"id": "toss",      "name": "Toss",      "rss": "https://toss.tech/rss.xml"},
    {"id": "line",      "name": "Line",      "rss": "https://engineering.linecorp.com/en/feed/"},
    {"id": "daangn",    "name": "당근",      "rss": "https://medium.com/feed/daangn"},
]

FETCH_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
    "Accept-Encoding": "gzip, deflate",
}

# XML에서 허용되지 않는 named entity를 수치 참조로 변환
_ENTITY_RE = re.compile(rb"&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-fA-F]+;)([A-Za-z]\w*);")

def _sanitize_xml(content: bytes) -> bytes:
    return _ENTITY_RE.sub(rb"&amp;\1;", content)


def fetch_feed(url: str) -> feedparser.FeedParserDict:
    """requests로 fetch 후 XML을 전처리해 feedparser에 전달."""
    try:
        resp = requests.get(url, headers=FETCH_HEADERS, timeout=15)
        resp.raise_for_status()
        sanitized = _sanitize_xml(resp.content)
        return feedparser.parse(sanitized)
    except requests.RequestException as e:
        log.warning(f"HTTP 요청 실패 ({url}): {e}")
        return feedparser.parse(url)  # fallback: 직접 파싱 시도

ITEMS_PER_SOURCE = 10


def strip_html(html: str) -> str:
    """HTML 태그 제거 후 텍스트만 반환."""
    text = re.sub(r"<[^>]+>", " ", html or "")
    return re.sub(r"\s+", " ", text).strip()


def extract_thumbnail(entry) -> str | None:
    """RSS entry에서 썸네일 URL 추출."""
    # media:thumbnail
    if hasattr(entry, "media_thumbnail") and entry.media_thumbnail:
        return entry.media_thumbnail[0].get("url")
    # media:content (이미지 타입)
    if hasattr(entry, "media_content") and entry.media_content:
        for mc in entry.media_content:
            if mc.get("medium") == "image" or mc.get("type", "").startswith("image/"):
                return mc.get("url")
    # enclosure
    if hasattr(entry, "enclosures") and entry.enclosures:
        for enc in entry.enclosures:
            if enc.get("type", "").startswith("image/"):
                return enc.get("href") or enc.get("url")
    # og:image fallback via summary img tag
    match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', entry.get("summary", ""))
    if match:
        return match.group(1)
    return None


def parse_date(entry) -> str:
    """feedparser 날짜를 ISO 8601 문자열로 변환."""
    if hasattr(entry, "published_parsed") and entry.published_parsed:
        dt = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
        return dt.isoformat()
    if hasattr(entry, "updated_parsed") and entry.updated_parsed:
        dt = datetime(*entry.updated_parsed[:6], tzinfo=timezone.utc)
        return dt.isoformat()
    return datetime.now(timezone.utc).isoformat()


def get_content(entry) -> str | None:
    """가능하면 전체 content, 없으면 summary 반환."""
    if hasattr(entry, "content") and entry.content:
        return entry.content[0].get("value")
    return entry.get("summary") or None


def collect_source(source: dict, client) -> int:
    """단일 소스에서 기사 수집 후 Supabase에 upsert. 삽입 건수 반환."""
    log.info(f"[{source['id']}] 수집 시작: {source['rss']}")
    feed = fetch_feed(source["rss"])

    if feed.bozo and not feed.entries:
        log.warning(f"[{source['id']}] RSS 파싱 오류: {feed.bozo_exception}")
        return 0

    count = 0
    for entry in feed.entries[:ITEMS_PER_SOURCE]:
        url = entry.get("link") or entry.get("id")
        if not url:
            continue

        title = entry.get("title", "").strip()
        if not title:
            continue

        raw_description = strip_html(entry.get("summary", ""))
        description = raw_description[:300] if raw_description else None

        row = {
            "company":      source["id"],
            "company_name": source["name"],
            "title":        title,
            "url":          url,
            "description":  description,
            "content":      get_content(entry),
            "thumbnail":    extract_thumbnail(entry),
            "author":       entry.get("author") or None,
            "published_at": parse_date(entry),
        }

        try:
            client.table("bigtech_news").upsert(row, on_conflict="url").execute()
            count += 1
        except Exception as e:
            log.error(f"[{source['id']}] DB 저장 실패 ({url}): {e}")

    log.info(f"[{source['id']}] 완료: {count}건 처리")
    return count


def main():
    client = create_client(SUPABASE_URL, SUPABASE_KEY)
    log.info("=== 빅테크 뉴스 수집 시작 ===")

    total = 0
    for source in SOURCES:
        try:
            total += collect_source(source, client)
        except Exception as e:
            log.error(f"[{source['id']}] 소스 오류 (스킵): {e}")

    log.info(f"=== 수집 완료: 총 {total}건 ===")


if __name__ == "__main__":
    main()
