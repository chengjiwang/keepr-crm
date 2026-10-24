// TS 6 預設不自動載入 @types/*，jest 全域型別需明確引用
/// <reference types="jest" />
import {
  buildCustomerSearchFilter,
  escapeLikePattern,
  normalizeSearch,
  quotePostgrestValue,
} from "@/lib/search";

describe("normalizeSearch", () => {
  it("trim 前後空白", () => {
    expect(normalizeSearch("  陳怡君 ")).toBe("陳怡君");
  });

  it("只有空白視為空字串", () => {
    expect(normalizeSearch("   ")).toBe("");
  });

  it("含注音或聲調視為選字中", () => {
    expect(normalizeSearch("ㄔㄣˊ")).toBeNull();
    expect(normalizeSearch("陳ㄧ")).toBeNull();
    expect(normalizeSearch("ˋ")).toBeNull();
  });

  it("一般中英文與符號不受影響", () => {
    expect(normalizeSearch("宏達 Trading, Inc.")).toBe("宏達 Trading, Inc.");
  });
});

describe("escapeLikePattern", () => {
  it("一般字串不變", () => {
    expect(escapeLikePattern("宏達貿易")).toBe("宏達貿易");
  });

  it("跳脫 % 與 _", () => {
    expect(escapeLikePattern("50%_off")).toBe("50\\%\\_off");
  });

  it("先跳 \\ 本身，不會重複跳脫", () => {
    expect(escapeLikePattern("a\\%")).toBe("a\\\\\\%");
  });

  it("* 換成單字元萬用字元", () => {
    expect(escapeLikePattern("a*b")).toBe("a_b");
  });

  it("PostgREST 語法字元在這層不處理", () => {
    expect(escapeLikePattern(',()".:')).toBe(',()".:');
  });
});

describe("quotePostgrestValue", () => {
  it("用雙引號包住", () => {
    expect(quotePostgrestValue("a,b(c)")).toBe('"a,b(c)"');
  });

  it("跳脫引號內的 \\ 與 \"", () => {
    expect(quotePostgrestValue('a"b\\c')).toBe('"a\\"b\\\\c"');
  });
});

describe("buildCustomerSearchFilter", () => {
  it("name 與 company 部分比對", () => {
    expect(buildCustomerSearchFilter("宏達")).toBe(
      'name.ilike."%宏達%",company.ilike."%宏達%"',
    );
  });

  it("混合特殊字元依序經過兩層跳脫", () => {
    const value = '"%a\\"b\\\\\\\\c,(\\\\%\\\\__%"';
    expect(buildCustomerSearchFilter('a"b\\c,(%_*')).toBe(
      `name.ilike.${value},company.ilike.${value}`,
    );
  });

  it("單一萬用字元不會變成比對全部", () => {
    expect(buildCustomerSearchFilter("%")).toBe(
      'name.ilike."%\\\\%%",company.ilike."%\\\\%%"',
    );
  });
});
