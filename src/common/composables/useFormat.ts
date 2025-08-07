export default function useFormat() {
  const formatCurrency = (
    value: number | undefined | null,
    decimales: number = 2
  ): string => {
    if (value === undefined || value === null) return "Q. 0.00";

    return new Intl.NumberFormat("es-GT", {
      style: "currency",
      currency: "GTQ",
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales,
    }).format(value);
  };

  const formatNumber = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return "0";

    return new Intl.NumberFormat("es-GT", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDecimal = (
    value: number | undefined | null,
    decimals: number = 2
  ): string => {
    if (value === undefined || value === null) return "0.00";

    return new Intl.NumberFormat("es-GT", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  return {
    formatCurrency,
    formatNumber,
    formatDecimal,
  };
}
