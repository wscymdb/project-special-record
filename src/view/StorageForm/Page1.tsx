import { memo, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import SyncForm from "../utils/index.ts";

const Page1 = memo(() => {
  const [formData, setFormData] = useState({
    username: "",
    gender: "male",
  });
  const navigate = useNavigate();

  const formStorage = useRef<SyncForm<"react">>(null);

  // 不直接useRef( new SyncForm())是因为每次组件渲染SyncForm都会重新创建，
  // 可能你会疑惑 useRef不是在整个生命周期只创建一次吗？
  // 因为useRef传入的参数是一个函数
  if (!formStorage.current) {
    formStorage.current = new SyncForm(formData, {
      type: "react",
      formId: "page1Form",
      setFormData,
      delay: 1000,
    });
  }

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      const newValue = {
        ...prevData,
        [name]: value,
      };

      // 广播新值
      formStorage.current!.value = newValue;
      formStorage.current!.debouncedSaveData();
      return newValue;
    });
  };

  useEffect(() => {
    // 初始化表单数据 这样页面可以从缓存中读取数据
    formStorage.current!.init();
  }, []);

  const nextPage = () => {
    formStorage.current!.saveData();
    navigate("/page2");
  };

  return (
    <div className="container">
      <h1>问题页1</h1>
      <form id="page1Form">
        <div>
          <label htmlFor="username">您的姓名：</label>
          <input
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            placeholder="请填写您的姓名"
          />
        </div>
        <div>
          <label htmlFor="gender">您的性别：</label>
          <select name="gender" value={formData.gender} onChange={handleChange}>
            <option value="male">男</option>
            <option value="female">女</option>
            <option value="secret">保密</option>
          </select>
        </div>
        <button className="single" type="button" onClick={nextPage}>
          下一页
        </button>
      </form>
    </div>
  );
});

export default Page1;
