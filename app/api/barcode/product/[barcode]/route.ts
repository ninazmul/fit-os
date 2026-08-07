import { NextResponse } from "next/server";
import { OpenFoodFacts } from "@openfoodfacts/openfoodfacts-nodejs";

interface OpenFoodFactsProduct {
  product_name?: string;
  product_name_en?: string;
  generic_name?: string;
  brands?: string;
  serving_size?: string;
  quantity?: string;
  nutriments?: Record<string, number | string | undefined>;
  image_front_small_url?: string;
  image_front_url?: string;
  image_url?: string;
}

const client = new OpenFoodFacts(globalThis.fetch, {
  language: "en",
  country: "world",
});

const numberFromNutriments = (
  nutriments: OpenFoodFactsProduct["nutriments"],
  keys: string[],
) => {
  for (const key of keys) {
    const value = nutriments?.[key];
    const numericValue = typeof value === "string" ? Number(value) : value;
    if (typeof numericValue === "number" && Number.isFinite(numericValue)) {
      return numericValue;
    }
  }

  return 0;
};

const roundMacro = (value: number) => Math.round(value * 10) / 10;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ barcode: string }> },
) {
  const { barcode } = await params;
  const cleanCode = barcode.trim();

  if (!/^\d{6,18}$/.test(cleanCode)) {
    return NextResponse.json(
      { error: "Please enter a valid barcode number." },
      { status: 400 },
    );
  }

  try {
    const { data, error } = await client.getProductV3(cleanCode, {
      fields: [
        "product_name",
        "product_name_en",
        "generic_name",
        "brands",
        "serving_size",
        "quantity",
        "nutriments",
        "image_front_small_url",
        "image_front_url",
        "image_url",
      ],
    });

    if (error || !data || data.status === "failure" || !("product" in data)) {
      return NextResponse.json(
        {
          error: `No product found for barcode "${cleanCode}". Try searching manually.`,
        },
        { status: 404 },
      );
    }

    const product = data.product as OpenFoodFactsProduct;
    const nutriments = product.nutriments || {};
    const energyKcal =
      numberFromNutriments(nutriments, [
        "energy-kcal_100g",
        "energy-kcal_serving",
      ]) ||
      numberFromNutriments(nutriments, ["energy_100g"]) / 4.184;

    return NextResponse.json({
      product: {
        barcode: cleanCode,
        name:
          product.product_name ||
          product.product_name_en ||
          product.generic_name ||
          "Scanned Product",
        brand: product.brands || "",
        servingSize: product.serving_size || product.quantity || "100g",
        calories: Math.round(energyKcal) || 0,
        protein: roundMacro(
          numberFromNutriments(nutriments, [
            "proteins_100g",
            "proteins_serving",
          ]),
        ),
        carbs: roundMacro(
          numberFromNutriments(nutriments, [
            "carbohydrates_100g",
            "carbohydrates_serving",
          ]),
        ),
        fat: roundMacro(
          numberFromNutriments(nutriments, ["fat_100g", "fat_serving"]),
        ),
        fiber: roundMacro(
          numberFromNutriments(nutriments, ["fiber_100g", "fiber_serving"]),
        ),
        image:
          product.image_front_small_url ||
          product.image_front_url ||
          product.image_url ||
          "",
      },
    });
  } catch (error) {
    console.error("Open Food Facts lookup failed:", error);
    return NextResponse.json(
      { error: "Error connecting to Open Food Facts barcode database." },
      { status: 502 },
    );
  }
}
