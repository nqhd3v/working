"use client";
import ProgressIcon from "@/components/progress-icon";
import { $client } from "@/utils/request";
import { SettingOutlined, UserOutlined } from "@ant-design/icons";
import { Card, Steps } from "antd";
import { useEffect } from "react";
import BlpProvider, { useBlueprint } from "./context";
import BlpAuth from "./auth";
import BlpDefaultData from "./default-info";

const InternalBlpSetupCard = () => {
  const {
    states: { currentStep, initializing },
    setStates,
  } = useBlueprint();

  const handleCheck = async () => {
    setStates({ initializing: true });
    try {
      const res = await $client("blp/auth");
      if (res.data.user) {
        setStates((prev) => ({
          ...prev,
          user: res.data.user,
          currentStep: prev.currentStep + 1,
        }));
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
    <Card title="Blueprint Setup">
      <Steps
        current={currentStep}
        direction="vertical"
        items={[
          {
            title: "Configure Blueprint Authenticate info",
            description: <BlpAuth />,
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
            description: <BlpDefaultData />,
            icon: (
              <ProgressIcon
                icon={<SettingOutlined />}
                loading={false}
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

export default function BlpSetupCard() {
  return (
    <BlpProvider>
      <InternalBlpSetupCard />
    </BlpProvider>
  );
}
