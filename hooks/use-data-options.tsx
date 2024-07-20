import { SelectProps } from "antd";
import { useMemo } from "react";

export const useDataOptions = <T,>(
  data: T[] | null | undefined,
  valueKey: keyof T,
  labelKey: keyof T
) => {
  return useMemo(() => {
    if (!data) return { dic: {}, options: [] };
    const options: SelectProps["options"] = [];
    const dic = data.reduce((res: Record<string, T>, cur) => {
      res[cur[valueKey] as string] = cur;
      options.push({
        label: cur[labelKey] as string,
        value: cur[valueKey] as string,
      });
      return res;
    }, {});
    return { dic, options };
  }, [data]);
};
