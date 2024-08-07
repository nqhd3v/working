"use client";
import ProgressIcon from "@/components/progress-icon";
import { $client } from "@/utils/request";
import { SettingOutlined, UserOutlined } from "@ant-design/icons";
import { Card, Steps } from "antd";
import { useEffect } from "react";
import JiraAuth from "./auth";
import { JiraProvider, useJira } from "./context";
import JiraDefaultInfo from "./default-info";
import { useJiraStore } from "@/stores/jira";

const InternalJiraSetupCard = () => {
  const setUser = useJiraStore.useUpdateUser();
  const reset = useJiraStore.useReset();
  const {
    states: { currentStep, initializing, loadingBoard, loadingIssueType },
    setStates,
  } = useJira();

  const handleCheck = async () => {
    setStates({ initializing: true });
    try {
      const res = await $client("jira/auth");
      if (res.data.user) {
        setUser(res.data.user);
        setStates((p) => ({
          ...p,
          currentStep: p.currentStep + 1,
        }));
      } else {
        // clear all data
        reset();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setStates({ initializing: false });
    }
  };

  useEffect(() => {
    handleCheck();
  }, []);

  return (
    <Card title="JIRA Setup">
      <Steps
        current={currentStep}
        direction="vertical"
        items={[
          {
            title: "Configure JIRA Authenticate info",
            description: <JiraAuth />,
            icon: (
              <ProgressIcon
                icon={<UserOutlined />}
                loading={initializing}
                index={0}
                current={currentStep}
              />
            ),
          },
          {
            title: "Set default data",
            description: <JiraDefaultInfo />,
            icon: (
              <ProgressIcon
                icon={<SettingOutlined />}
                loading={initializing || loadingBoard || loadingIssueType}
                index={1}
                current={currentStep}
              />
            ),
          },
        ]}
      />
    </Card>
  );
};

export default function JiraSetupCard() {
  return (
    <JiraProvider>
      <InternalJiraSetupCard />
    </JiraProvider>
  );
}
