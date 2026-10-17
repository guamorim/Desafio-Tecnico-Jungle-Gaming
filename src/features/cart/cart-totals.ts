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
  const isNegative = value.startsWith("-");
  const absoluteValue = isNegative
    ? value.slice(1)
    : value;
  const [integerPart, fractionPart = ""] =
    absoluteValue.split(".");
  const scale = 10n ** BigInt(decimalPlaces);
  const paddedFraction = fractionPart.padEnd(
    decimalPlaces,
    "0",
  );
  const smallestUnits =
    BigInt(integerPart) * scale +
    BigInt(paddedFraction || "0");

  return isNegative
    ? -smallestUnits
    : smallestUnits;
}

function fromSmallestUnits(
  value: bigint,
  decimalPlaces: number,
) {
  const isNegative = value < 0n;
  const absoluteValue = isNegative ? -value : value;

  if (decimalPlaces === 0) {
    return value.toString();
  }

  const scale = 10n ** BigInt(decimalPlaces);
  const integerPart = absoluteValue / scale;
  const fractionPart = (absoluteValue % scale)
    .toString()
    .padStart(decimalPlaces, "0")
    .replace(/0+$/, "");
  const sign = isNegative ? "-" : "";

  return fractionPart
    ? `${sign}${integerPart}.${fractionPart}`
    : `${sign}${integerPart}`;
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

export function calculateEthPercentage(
  value: string,
  percentage: number,
) {
  if (
    !Number.isInteger(percentage) ||
    percentage < 0 ||
    percentage > 100
  ) {
    throw new RangeError(
      "A porcentagem deve ser um número inteiro entre 0 e 100.",
    );
  }

  const valueDecimalPlaces = countDecimalPlaces(value);
  const valueInSmallestUnits = toSmallestUnits(
    value,
    valueDecimalPlaces,
  );

  return fromSmallestUnits(
    valueInSmallestUnits * BigInt(percentage),
    valueDecimalPlaces + 2,
  );
}
