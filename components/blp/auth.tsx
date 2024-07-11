import { Button, Form, FormProps, Input } from "antd";
import FormItem from "antd/es/form/FormItem";
import InputPassword from "antd/es/input/Password";
import { useState } from "react";
import { TUserJira } from "@nqhd3v/crazy/types/jira";
import { $client } from "@/utils/request";
import { useBlueprint } from "./context";

interface IBlpAuth {
  loading?: boolean;
  initializing?: boolean;
  onNext?: (auth: { email: string; pat: string }, user: TUserJira) => void;
  onLoading?: (isLoading: boolean) => void;
}
const BlpAuth: React.FC<IBlpAuth> = () => {
  const {
    states: { initializing, user, loadingStep },
    setStates,
  } = useBlueprint();
  const getUser: FormProps["onFinish"] = async ({ username, password }) => {
    setStates({ loadingStep: true });
    const res = await $client.post("blp/auth", {
      username,
      password,
    });

    if (res.data.user) {
      setStates({
        user: res.data.user,
        currentStep: 1,
      });
    }

    setStates({ loadingStep: false });
  };

  if (initializing) {
    return <div className="text-gray-400">Authenticating user info...</div>;
  }

  if (user) {
    return (
      <div className="text-gray-400">
        Authenticated with{" "}
        <span className="text-gray-500 font-bold">
          &quot;{user.fullNm}&quot;
        </span>
      </div>
    );
  }
  return (
    <div>
      <Form layout="vertical" onFinish={getUser}>
        <div className="grid grid-cols-2 gap-6">
          <FormItem
            name="username"
            label="Username"
            rules={[{ required: true, message: "input username" }]}
          >
            <Input placeholder="example" disabled={loadingStep} />
          </FormItem>
          <FormItem
            name="password"
            label="Password"
            rules={[{ required: true, message: "input password" }]}
          >
            <InputPassword placeholder="password" disabled={loadingStep} />
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

export default BlpAuth;
