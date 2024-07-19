import { useMemo } from "react";

const isValidJSONArray = <T,>(input: string): { data: T[]; error?: string } => {
  try {
    const data = JSON.parse(input);
    if (!Array.isArray(data)) return { data: [], error: "Invalid JSON" };

    return data.length > 0 ? { data } : { data, error: "Empty" };
  } catch (_) {
    return { data: [], error: "Invalid JSON data" };
  }
};

export const useValidJSONArray = <T,>(input: string) => {
  return useMemo(() => isValidJSONArray<T>(input), [input]);
};
