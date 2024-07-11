import { Button, Form, FormProps, Input } from "antd";
import FormItem from "antd/es/form/FormItem";
import InputPassword from "antd/es/input/Password";
import { useState } from "react";
import { TUserJira } from "@nqhd3v/crazy/types/jira";
import { $client } from "@/utils/request";
import { useJira } from "./context";

interface IJiraAuth {
  loading?: boolean;
  initializing?: boolean;
  onNext?: (auth: { email: string; pat: string }, user: TUserJira) => void;
  onLoading?: (isLoading: boolean) => void;
}
const JiraAuth: React.FC<IJiraAuth> = ({ onNext }) => {
  const {
    initializing,
    user,
    loadingStep,
    setLoadingStep,
    setCurrentStep,
    setUser,
  } = useJira();
  const getUser: FormProps["onFinish"] = async ({ email, pat }) => {
    setLoadingStep(true);
    const res = await $client.post("jira/auth", {
      email,
      pat,
    });

    if (res.data.user) {
      setUser(res.data.user);
      setCurrentStep(1);
    }

    setLoadingStep(false);
  };

  if (initializing) {
    return <div className="text-gray-400">Authenticating user info...</div>;
  }

  if (user) {
    return (
      <div className="text-gray-400">
        Authenticated with{" "}
        <span className="text-gray-500 font-bold">
          &quot;{user.displayName}&quot;
        </span>
      </div>
    );
  }
  return (
    <div>
      <Form layout="vertical" onFinish={getUser}>
        <div className="grid grid-cols-2 gap-6">
          <FormItem
            name="email"
            label="Email"
            rules={[{ required: true, message: "Enter your email" }]}
          >
            <Input placeholder="example@gmail.com" disabled={loadingStep} />
          </FormItem>
          <FormItem
            name="pat"
            label="PAT"
            rules={[{ required: true, message: "Enter your PAT" }]}
          >
            <InputPassword
              placeholder="personal access token"
              disabled={loadingStep}
            />
          </FormItem>
        </div>
        <div className="flex items-center justify-between">
          <Button
            disabled={loadingStep}
            loading={loadingStep}
            type="primary"
            htmlType="submit"
          >
            Next step
          </Button>
        </div>
      </Form>
      <div className="pt-5 text-gray-400 text-sm">
        Your authenticate info will be encrypted and save as a cookie to use for
        the next time.
      </div>
    </div>
  );
};

export default JiraAuth;
