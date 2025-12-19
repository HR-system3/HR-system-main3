interface MoneyProps {
  amount: number;
  currency?: string;
  showSign?: boolean;
}

export default function Money({
  amount,
  currency = "EGP",
  showSign = false,
}: MoneyProps) {
  const formatter = new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });

  const formatted = formatter.format(Math.abs(amount));
  const sign = amount < 0 ? "-" : showSign && amount > 0 ? "+" : "";

  return (
    <span className="font-semibold text-slate-50">
      {sign}
      {formatted}
    </span>
  );
}
