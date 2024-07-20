export * from "./jira";

export type TRequestDataCallback<T> = (data: T) => Promise<void> | void;
export type TRequestOnLoading = (isLoading: boolean) => void;
export type TRequestDefaultParams<T> = {
  onLoading?: TRequestOnLoading;
  onData: TRequestDataCallback<T>;
};
