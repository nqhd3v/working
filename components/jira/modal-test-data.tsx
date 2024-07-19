import { TJiraIssue } from "@nqhd3v/crazy/types/jira";
import { List, Modal, ModalProps } from "antd";
import Paragraph from "antd/es/typography/Paragraph";
import { useJira } from "./context";

const ModalTestData: React.FC<Omit<ModalProps, "children" | "title">> = (
  props
) => {
  const {
    states: { issues, loadingIssue },
  } = useJira();

  return (
    <Modal
      title="What did you do in this sprint!?"
      width="calc(100% - 40px)"
      style={{ top: "20px" }}
      footer={null}
      classNames={{
        body: "max-h-[calc(100vh-124px)] overflow-x-hidden overflow-y-auto",
      }}
      {...props}
    >
      {loadingIssue ? (
        <div className="h-[200px] flex items-center justify-center text-gray-400">
          Retrieving your issues in this sprint from JIRA...
        </div>
      ) : (
        <List
          bordered
          dataSource={issues}
          renderItem={(item: TJiraIssue) => (
            <List.Item>
              <div>
                <Paragraph
                  className="!text-gray-400 !text-xs !mb-0"
                  copyable={{
                    text: `[${item.fields.parent.key}]${item.fields.parent.fields.summary}`,
                  }}
                >
                  [{item.fields.parent.key}]{item.fields.parent.fields.summary}
                </Paragraph>
                <Paragraph
                  className="!mb-0"
                  copyable={{
                    text: `[${item.key}]${item.fields.summary}`,
                  }}
                >
                  [{item.key}] - {item.fields.summary}
                </Paragraph>
              </div>
            </List.Item>
          )}
        />
      )}
    </Modal>
  );
};

export default ModalTestData;
