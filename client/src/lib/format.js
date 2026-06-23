export const formatDate = (value) => new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
export const formatNumber = (value, digits = 1) => value == null ? "--" : new Intl.NumberFormat("en-IN", { maximumFractionDigits: digits }).format(value);
