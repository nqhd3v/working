import { Button, Form, Input } from "antd";
import FormItem from "antd/es/form/FormItem";
import InputPassword from "antd/es/input/Password";
import { TUserJira } from "@nqhd3v/crazy/types/jira";
import { useJira } from "./context";
import { useJiraStore } from "@/stores/jira";

interface IJiraAuth {
  loading?: boolean;
  initializing?: boolean;
  onNext?: (auth: { email: string; pat: string }, user: TUserJira) => void;
  onLoading?: (isLoading: boolean) => void;
}
const JiraAuth: React.FC<IJiraAuth> = ({ onNext }) => {
  const user = useJiraStore.useUser();
  const {
    states: { initializing, loadingUser },
    setStates,
    getUser,
  } = useJira();

  if (initializing || loadingUser) {
    return (
      <div className="text-gray-400 text-xs">Authenticating user info...</div>
    );
  }

  if (user) {
    return (
      <div className="text-gray-400 text-xs">
        Authenticated with{" "}
        <span className="text-gray-500 font-bold">
          &quot;{user.displayName}&quot;
        </span>
      </div>
    );
  }
  return (
    <div>
      <Form
        layout="vertical"
        onFinish={async ({ email, pat }) => {
          await getUser(email, pat);
          setStates({ currentStep: 1 });
        }}
      >
        <div className="grid grid-cols-2 gap-6">
          <FormItem
            name="email"
            label="Email"
            rules={[{ required: true, message: "Enter your email" }]}
          >
            <Input placeholder="example@gmail.com" disabled={loadingUser} />
          </FormItem>
          <FormItem
            name="pat"
            label="PAT"
            rules={[{ required: true, message: "Enter your PAT" }]}
          >
            <InputPassword
              placeholder="personal access token"
              disabled={loadingUser}
            />
          </FormItem>
        </div>
        <div className="flex items-center justify-between">
          <Button
            disabled={loadingUser}
            loading={loadingUser}
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
