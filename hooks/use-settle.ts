export const callMultiActions = async <T>(
  payload: { params: any[] }[],
  action: (...params: any[]) => Promise<{ data?: T; error?: string }>
) => {
  const promises = payload.map(async ({ params }) => action(...params));

  const data = await Promise.allSettled(promises);
  const resolvedData = data
    .filter(
      (dataItem): dataItem is PromiseFulfilledResult<Awaited<{ data: T }>> =>
        dataItem.status === "fulfilled"
    )
    .map((dataItem) => dataItem.value.data);
  const rejectedData = data
    .filter(
      (dataItem): dataItem is PromiseRejectedResult =>
        dataItem.status === "rejected"
    )
    .map((result) => result.reason.error);

  return { resolvedData, rejectedData, data };
};
