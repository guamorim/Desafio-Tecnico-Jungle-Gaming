type PricedQuantity = {
  readonly priceEth: string;
  readonly quantity: number;
};

function countDecimalPlaces(value: string) {
  return value.split(".")[1]?.length ?? 0;
}

function toSmallestUnits(
  value: string,
  decimalPlaces: number,
) {
  const [integerPart, fractionPart = ""] =
    value.split(".");
  const scale = 10n ** BigInt(decimalPlaces);
  const paddedFraction = fractionPart.padEnd(
    decimalPlaces,
    "0",
  );

  return (
    BigInt(integerPart) * scale +
    BigInt(paddedFraction || "0")
  );
}

function fromSmallestUnits(
  value: bigint,
  decimalPlaces: number,
) {
  if (decimalPlaces === 0) {
    return value.toString();
  }

  const scale = 10n ** BigInt(decimalPlaces);
  const integerPart = value / scale;
  const fractionPart = (value % scale)
    .toString()
    .padStart(decimalPlaces, "0")
    .replace(/0+$/, "");

  return fractionPart
    ? `${integerPart}.${fractionPart}`
    : integerPart.toString();
}

export function calculateEthTotal(
  items: readonly PricedQuantity[],
) {
  const decimalPlaces = items.reduce(
    (largest, item) =>
      Math.max(
        largest,
        countDecimalPlaces(item.priceEth),
      ),
    0,
  );

  const total = items.reduce(
    (sum, item) =>
      sum +
      toSmallestUnits(
        item.priceEth,
        decimalPlaces,
      ) *
        BigInt(item.quantity),
    0n,
  );

  return fromSmallestUnits(total, decimalPlaces);
}
