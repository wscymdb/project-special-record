import React, { useEffect, useRef } from "react";
import type { FormProps } from "antd";
import { Button, Checkbox, Form, Input } from "antd";
import SyncForm from "../utils";

type FieldType = {
  username?: string;
  password?: string;
  remember?: string;
};

const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (errorInfo) => {
  console.log("Failed:", errorInfo);
};

const Page2: React.FC = () => {
  const [form] = Form.useForm();
  const formStorage = useRef<SyncForm<"react">>(null);

  useEffect(() => {
    formStorage.current!.init();
  }, []);

  if (!formStorage.current) {
    formStorage.current = new SyncForm(form.getFieldsValue(), {
      type: "react",
      formId: "page2Form",
      setFormData: form.setFieldsValue,
      delay: 1000,
    });
  }

  const handleValuesChange = (values: FieldType) => {
    console.log(values);
    formStorage.current!.value = values;
    formStorage.current!.debouncedSaveData();
  };

  const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
    console.log("Success:", values);
    SyncForm.clearAll();
  };

  return (
    <Form
      style={{ padding: 20 }}
      form={form}
      name="basic"
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      onValuesChange={handleValuesChange}
    >
      <Form.Item<FieldType>
        label="Username"
        name="username"
        rules={[{ required: true, message: "Please input your username!" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item<FieldType>
        label="Password"
        name="password"
        rules={[{ required: true, message: "Please input your password!" }]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item<FieldType>
        name="remember"
        valuePropName="checked"
        label={null}
      >
        <Checkbox>Remember me</Checkbox>
      </Form.Item>

      <Form.Item label={null}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default Page2;
