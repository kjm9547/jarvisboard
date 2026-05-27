export const CATEGORY_RULES = {
  식비: {
    bg: "bg-orange-500",
    text: "text-orange-400",
    hex: "#f97316",
    keywords: ["스타벅스", "맥도날드", "버거킹", "배달의민족", "배민", "쿠팡이츠", "요기요",
      "GS25", "CU", "세븐일레븐", "편의점", "식당", "카페", "커피", "베이커리", "치킨", "피자",
      "김밥", "분식", "도시락", "맘스터치", "롯데리아", "써브웨이"],
  },
  교통: {
    bg: "bg-blue-500",
    text: "text-blue-400",
    hex: "#3b82f6",
    keywords: ["티머니", "카카오T", "우버", "코레일", "주유", "버스", "지하철", "택시",
      "KTX", "기차", "고속버스", "항공", "에어", "공항", "주차"],
  },
  숙박: {
    bg: "bg-purple-500",
    text: "text-purple-400",
    hex: "#a855f7",
    keywords: ["호텔", "모텔", "펜션", "에어비앤비", "숙소", "리조트", "게스트하우스", "야놀자", "여기어때"],
  },
  쇼핑: {
    bg: "bg-pink-500",
    text: "text-pink-400",
    hex: "#ec4899",
    keywords: ["쿠팡", "11번가", "무신사", "올리브영", "다이소", "이마트", "롯데마트", "홈플러스", "코스트코", "SSG"],
  },
  문화: {
    bg: "bg-yellow-500",
    text: "text-yellow-400",
    hex: "#eab308",
    keywords: ["넷플릭스", "유튜브", "CGV", "메가박스", "롯데시네마", "스포티파이", "왓챠"],
  },
  기타: {
    bg: "bg-gray-500",
    text: "text-gray-400",
    hex: "#6b7280",
    keywords: [],
  },
} as const;

export type Category = keyof typeof CATEGORY_RULES;
export const CATEGORY_KEYS = Object.keys(CATEGORY_RULES) as Category[];

export function getCategory(merchant: string): Category {
  const lower = merchant.toLowerCase();
  for (const [cat, { keywords }] of Object.entries(CATEGORY_RULES)) {
    if (cat === "기타") continue;
    if ((keywords as readonly string[]).some((kw) => lower.includes(kw.toLowerCase()))) {
      return cat as Category;
    }
  }
  return "기타";
}

export function getEffectiveCategory(t: { category?: string | null; merchant: string }): Category {
  if (t.category && t.category in CATEGORY_RULES) return t.category as Category;
  return getCategory(t.merchant);
}
