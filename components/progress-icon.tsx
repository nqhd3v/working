import { CheckCircleOutlined, LoadingOutlined } from "@ant-design/icons";

interface IProgressIcon {
  loading?: boolean;
  icon: React.ReactElement;
  index: number;
  current: number;
}

const ProgressIcon: React.FC<IProgressIcon> = ({
  loading,
  icon,
  index,
  current,
}) => {
  if (current === index && loading) return <LoadingOutlined spin />;
  if (current > index) return <CheckCircleOutlined />;

  return icon;
};

export default ProgressIcon;
