import { TJiraIssue } from "@nqhd3v/crazy/types/jira";
import { List, Modal, ModalProps } from "antd";
import Paragraph from "antd/es/typography/Paragraph";

const ModalTestData: React.FC<
  Omit<ModalProps, "children" | "title"> & { items: TJiraIssue[] }
> = ({ items, ...props }) => {
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
      <List
        bordered
        dataSource={items}
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
    </Modal>
  );
};

export default ModalTestData;
