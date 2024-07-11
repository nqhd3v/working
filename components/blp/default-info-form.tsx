import { Button, Form, FormProps, Select } from "antd";
import { useBlueprint } from "./context";
import {
  mapBlpCategoryToOptions,
  mapBlpProjectToOptions,
} from "@/utils/mapping-data";
import TestDataModal from "./test-data.modal";
import { useState } from "react";
import { BLP_CONF_PRJ_ID, BLP_CONF_ROOT_PRJ_ID } from "@/utils/constant";

const BlpDefaultForm = () => {
  const [openTestModal, setOpenTestModal] = useState(false);

  const [form] = Form.useForm();
  const {
    states: {
      loadingProject,
      loadingCategory,
      selectedProject,
      selectedCategory,
      projects,
      categories,
    },
    getTasks,
    getCategories,
    setStates,
  } = useBlueprint();

  const handlePickProject = async (projectId: string) => {
    getCategories(projectId);
    form.setFieldValue("category", undefined);
  };

  const handleTest = async () => {
    const { category } = await form.validateFields();

    setOpenTestModal(true);
    await getTasks(category, undefined);
  };

  const handleSave: FormProps["onFinish"] = ({ project, category }) => {
    localStorage.setItem(BLP_CONF_ROOT_PRJ_ID, project);
    localStorage.setItem(BLP_CONF_PRJ_ID, category);
    setStates({
      selectedProject: project,
      selectedCategory: category,
    });
  };

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          project: selectedProject,
          category: selectedCategory,
        }}
        onFinish={handleSave}
      >
        <div className="grid grid-cols-2 gap-2">
          <Form.Item
            name="project"
            label="Root project"
            rules={[{ required: true, message: "pick root project" }]}
          >
            <Select
              options={mapBlpProjectToOptions(projects)}
              loading={loadingProject}
              onChange={handlePickProject}
            />
          </Form.Item>
          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => {
              const project = getFieldValue("project");
              return (
                <Form.Item
                  name="category"
                  label="Project"
                  rules={[{ required: true, message: "pick project" }]}
                >
                  <Select
                    options={mapBlpCategoryToOptions(categories)}
                    disabled={!project}
                    loading={loadingCategory}
                  />
                </Form.Item>
              );
            }}
          </Form.Item>
        </div>
        <div className="flex items-center gap-5">
          <Button type="dashed" htmlType="button" onClick={() => handleTest()}>
            Test
          </Button>
          <Button type="primary" htmlType="submit">
            Finish
          </Button>
        </div>
      </Form>
      <TestDataModal
        open={openTestModal}
        onCancel={() => {
          setOpenTestModal(false);
          setStates({ tasks: [] });
        }}
      />
    </>
  );
};

export default BlpDefaultForm;