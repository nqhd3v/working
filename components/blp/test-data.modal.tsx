import { List, Modal, ModalProps } from "antd";
import { useBlueprint } from "./context";
import { TBlpTask } from "@nqhd3v/crazy/types/blueprint";
import Link from "next/link";
import { useBlpStore } from "@/stores/blueprint";
import { BLP_REQUIREMENT_STATE_START_WITH } from "@/utils/constant";

const TestDataModal: React.FC<Omit<ModalProps, "children" | "title">> = (
  props
) => {
  const {
    states: { tasks, loadingTask },
    getTaskLink,
  } = useBlueprint();
  const comCodes = useBlpStore.useComCds();

  return (
    <Modal
      title={
        <div>
          <div>My Blueprint Requirements</div>
          <span className="text-gray-400 text-xs font-normal">
            Requirements in states:{" "}
            <span className="text-gray-500 font-bold">
              {(comCodes || [])
                .filter((c) =>
                  c.key.startsWith(BLP_REQUIREMENT_STATE_START_WITH)
                )
                .map((s) => s.name)
                .join(", ")}
            </span>
          </span>
        </div>
      }
      width="calc(100% - 40px)"
      style={{ top: "20px" }}
      classNames={{
        body: "max-h-[calc(100vh-144px)] overflow-y-auto overflow-x-hidden",
      }}
      footer={null}
      {...props}
    >
      {loadingTask ? (
        <div className="h-[200px] flex items-center justify-center">
          Retrieving requirements from Blueprint...
        </div>
      ) : (
        <List
          bordered
          dataSource={tasks}
          renderItem={(item: TBlpTask) => (
            <List.Item>
              <div>
                <Link
                  className="!text-gray-400 text-xs mb-0 underline"
                  href={getTaskLink(item.reqId)}
                  target="_blank"
                >
                  {item.reqId}
                </Link>
                <div className="!mb-0">{item.reqTitNm}</div>
              </div>
            </List.Item>
          )}
        />
      )}
    </Modal>
  );
};

export default TestDataModal;
