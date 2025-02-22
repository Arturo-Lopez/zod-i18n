import { test, expect, beforeAll } from "vitest";
import { z } from "zod";
import { init, getErrorMessage, getErrorMessageFromZodError } from "./helpers";

const LOCALE = "ar";

beforeAll(async () => {
  await init(LOCALE);
});

test("string parser error messages", () => {
  const schema = z.string();

  expect(getErrorMessage(schema.safeParse(undefined))).toEqual("مطلوب");
  expect(getErrorMessage(schema.safeParse(1))).toEqual(
    "المتوقع سلسلة، المستلم رقم"
  );
  expect(getErrorMessage(schema.safeParse(true))).toEqual(
    "المتوقع سلسلة، المستلم قيمة منطقية"
  );
  expect(getErrorMessage(schema.safeParse(Date))).toEqual(
    "المتوقع سلسلة، المستلم دالة"
  );
  expect(getErrorMessage(schema.safeParse(new Date()))).toEqual(
    "المتوقع سلسلة، المستلم تاريخ"
  );
  expect(getErrorMessage(schema.email().safeParse(""))).toEqual(
    "غير صالح البريد الإلكتروني"
  );
  expect(getErrorMessage(schema.url().safeParse(""))).toEqual(
    "غير صالح الرابط"
  );
  expect(getErrorMessage(schema.regex(/aaa/).safeParse(""))).toEqual(
    "غير صالح"
  );
  expect(getErrorMessage(schema.startsWith("foo").safeParse(""))).toEqual(
    "إدخال غير صالح: يجب أن يبدأ بـ foo"
  );
  expect(getErrorMessage(schema.endsWith("bar").safeParse(""))).toEqual(
    "إدخال غير صالح: يجب أن ينتهي بـ bar"
  );
  expect(getErrorMessage(schema.min(5).safeParse("a"))).toEqual(
    "يجب أن تحتوي السلسلة على 5 حرف (أحرف) على الأقل"
  );
  expect(getErrorMessage(schema.max(5).safeParse("abcdef"))).toEqual(
    "يجب أن تحتوي السلسلة على 5 حرف (أحرف) كحد أقصى"
  );
  expect(getErrorMessage(schema.length(5).safeParse("abcdef"))).toEqual(
    "يجب أن تحتوي السلسلة على 5 حرف (أحرف)"
  );
  expect(
    getErrorMessage(schema.datetime().safeParse("2020-01-01T00:00:00+02:00"))
  ).toEqual("غير صالح التاريخ والوقت");
});

test("number parser error messages", () => {
  const schema = z.number();

  expect(getErrorMessage(schema.safeParse(undefined))).toEqual("مطلوب");
  expect(getErrorMessage(schema.safeParse(""))).toEqual(
    "المتوقع رقم، المستلم سلسلة"
  );
  expect(getErrorMessage(schema.safeParse(null))).toEqual(
    "المتوقع رقم، المستلم لا شيء"
  );
  expect(getErrorMessage(schema.safeParse(NaN))).toEqual(
    "المتوقع رقم، المستلم مدخل غير رقمي"
  );
  expect(getErrorMessage(schema.int().safeParse(0.1))).toEqual(
    "المتوقع عدد صحيح، المستلم عدد عشري"
  );
  expect(getErrorMessage(schema.multipleOf(5).safeParse(2))).toEqual(
    "يجب أن يكون الرقم من مضاعفات 5"
  );
  expect(getErrorMessage(schema.step(0.1).safeParse(0.0001))).toEqual(
    "يجب أن يكون الرقم من مضاعفات 0.1"
  );
  expect(getErrorMessage(schema.lt(5).safeParse(10))).toEqual(
    "يجب أن يكون الرقم أقل من 5"
  );
  expect(getErrorMessage(schema.lte(5).safeParse(10))).toEqual(
    "يجب أن يكون الرقم أقل من أو يساوي 5"
  );
  expect(getErrorMessage(schema.gt(5).safeParse(1))).toEqual(
    "يجب أن يكون الرقم أكبر من 5"
  );
  expect(getErrorMessage(schema.gte(5).safeParse(1))).toEqual(
    "يجب أن يكون الرقم أكبر من أو يساوي 5"
  );
  expect(getErrorMessage(schema.nonnegative().safeParse(-1))).toEqual(
    "يجب أن يكون الرقم أكبر من أو يساوي 0"
  );
  expect(getErrorMessage(schema.nonpositive().safeParse(1))).toEqual(
    "يجب أن يكون الرقم أقل من أو يساوي 0"
  );
  expect(getErrorMessage(schema.negative().safeParse(1))).toEqual(
    "يجب أن يكون الرقم أقل من 0"
  );
  expect(getErrorMessage(schema.positive().safeParse(0))).toEqual(
    "يجب أن يكون الرقم أكبر من 0"
  );
  expect(getErrorMessage(schema.finite().safeParse(Infinity))).toEqual(
    "يجب ان يكون العدد محدود"
  );
});

test("date parser error messages", async () => {
  const testDate = new Date("2022-08-01");
  const schema = z.date();

  expect(getErrorMessage(schema.safeParse("2022-12-01"))).toEqual(
    "المتوقع تاريخ، المستلم سلسلة"
  );
  expect(
    getErrorMessage(schema.min(testDate).safeParse(new Date("2022-07-29")))
  ).toEqual(
    `يجب أن يكون التاريخ أكبر من أو يساوي ${testDate.toLocaleDateString(
      LOCALE
    )}`
  );
  expect(
    getErrorMessage(schema.max(testDate).safeParse(new Date("2022-08-02")))
  ).toEqual(
    `يجب أن يكون التاريخ أصغر من أو يساوي ${testDate.toLocaleDateString(
      LOCALE
    )}`
  );
  try {
    await schema.parseAsync(new Date("invalid"));
  } catch (err) {
    expect((err as z.ZodError).issues[0].message).toEqual("تاريخ غير صالح");
  }
});

test("array parser error messages", () => {
  const schema = z.string().array();

  expect(getErrorMessage(schema.safeParse(""))).toEqual(
    "المتوقع مصفوفة، المستلم سلسلة"
  );
  expect(getErrorMessage(schema.min(5).safeParse([""]))).toEqual(
    "يجب أن تحتوي المصفوفة على 5 عنصر (عناصر) على الأقل"
  );
  expect(getErrorMessage(schema.max(2).safeParse(["", "", ""]))).toEqual(
    "يجب أن تحتوي المصفوفة على 2 عنصر (عناصر) كحد أقصى"
  );
  expect(getErrorMessage(schema.nonempty().safeParse([]))).toEqual(
    "يجب أن تحتوي المصفوفة على 1 عنصر (عناصر) على الأقل"
  );
  expect(getErrorMessage(schema.length(2).safeParse([]))).toEqual(
    "يجب أن تحتوي المصفوفة على 2 عنصر (عناصر)"
  );
});

test("function parser error messages", () => {
  const functionParse = z
    .function(z.tuple([z.string()]), z.number())
    .parse((a: any) => a);
  expect(getErrorMessageFromZodError(() => functionParse(""))).toEqual(
    "نوع إرجاع دالة غير صالح"
  );
  expect(getErrorMessageFromZodError(() => functionParse(1 as any))).toEqual(
    "معاملات الدالة غير صالحة"
  );
});

test("other parser error messages", () => {
  expect(
    getErrorMessage(
      z
        .intersection(
          z.number(),
          z.number().transform((x) => x + 1)
        )
        .safeParse(1234)
    )
  ).toEqual("تعذر دمج نتائج التقاطع");
  expect(getErrorMessage(z.literal(12).safeParse(""))).toEqual(
    "قيمة حرفية غير صالحة، المتوقع 12"
  );
  expect(getErrorMessage(z.enum(["A", "B", "C"]).safeParse("D"))).toEqual(
    "قيمة تعداد غير صالحة. المتوقع 'A' | 'B' | 'C'، المستلم 'D'"
  );
  expect(
    getErrorMessage(
      z
        .object({ dog: z.string() })
        .strict()
        .safeParse({ dog: "", cat: "", rat: "" })
    )
  ).toEqual("عنصر (عناصر) غير معروف في الكائن: 'cat', 'rat'");
  expect(
    getErrorMessage(
      z
        .discriminatedUnion("type", [
          z.object({ type: z.literal("a"), a: z.string() }),
          z.object({ type: z.literal("b"), b: z.string() }),
        ])
        .safeParse({ type: "c", c: "abc" })
    )
  ).toEqual("قيمة مميزة غير صالحة. المتوقع 'a' | 'b'");
  expect(
    getErrorMessage(z.union([z.string(), z.number()]).safeParse([true]))
  ).toEqual("مدخل غير صالح");
});
