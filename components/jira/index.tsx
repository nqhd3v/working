"use client";
import ProgressIcon from "@/components/progress-icon";
import { $client } from "@/utils/request";
import { SettingOutlined, UserOutlined } from "@ant-design/icons";
import { Card, Steps } from "antd";
import { useEffect } from "react";
import JiraAuth from "./auth";
import { JiraProvider, useJira } from "./context";
import JiraDefaultInfo from "./default-info";

const InternalJiraSetupCard = () => {
  const {
    currentStep,
    loadingStep,
    initializing,
    setInitializing,
    setUser,
    setCurrentStep,
  } = useJira();

  const handleCheck = async () => {
    setInitializing(true);
    try {
      const res = await $client("jira/auth");
      if (res.data.user) {
        setUser(res.data.user);
        setCurrentStep((s) => (s += 1));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setInitializing(false);
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
                loading={loadingStep || initializing}
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
                loading={loadingStep}
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
