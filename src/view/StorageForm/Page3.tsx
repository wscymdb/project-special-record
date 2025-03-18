import { useNavigate } from "react-router";
import useFormStorage from "../hooks/useFormStorage";
import { useState } from "react";
import FormStorage from "../utils/formStorage";

const Page3 = () => {
  const [formData, setFormData] = useState({
    birthdate: "",
    email: "",
  });
  const navigate = useNavigate();

  const formStorage = useFormStorage("page3Form", formData, setFormData);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const prevPage = () => {
    formStorage.saveData();
    navigate("/page2");
  };

  const resetFormData = () => {
    setFormData({
      birthdate: "",
      email: "",
    });
    // 如果有其他表单页面的数据，需要同时重置
    // 可以考虑从 localStorage 中加载每个表单页面的数据并重置
  };

  const submitForm = (e: any) => {
    e.preventDefault();
    FormStorage.clearAll();
    resetFormData();
    // 添加表单提交逻辑
    alert("Form submitted!");
  };

  return (
    <div className="container">
      <h1>问题页3</h1>
      <form id="page3Form" onSubmit={submitForm}>
        <div>
          <label htmlFor="birthdate">您的出生日期：</label>
          <input
            type="date"
            name="birthdate"
            value={formData.birthdate}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="email">您的邮箱：</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="请填写您的邮箱"
          />
        </div>
        <div className="button-group">
          <button type="button" onClick={prevPage}>
            上一页
          </button>
          <button type="submit">提交</button>
        </div>
      </form>
    </div>
  );
};

export default Page3;
