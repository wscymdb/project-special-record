import { useEffect, useRef, useState } from "react";
import FormStorage from "../utils/formStorage";
import { useNavigate } from "react-router";

const Page4 = () => {
  const [formData, setFormData] = useState<Record<string, any>>({
    username: "",
    gender: "secret",
  });
  const navigate = useNavigate();

  const formStorage: any = useRef(
    new FormStorage("page4Form", { value: formData })
  ).current;

  useEffect(() => {
    formStorage.init();
    setFormData({ ...formStorage.formData.value });

    const syncFormData = (e: any) => {
      console.log(e, formStorage.storageKey);

      if (e.key === formStorage.storageKey && e.newValue) {
        setFormData(JSON.parse(e.newValue));
      }
    };

    window.addEventListener("storage", syncFormData);

    return () => {
      window.removeEventListener("storage", syncFormData);
    };
  }, [formStorage]);

  useEffect(() => {
    formStorage.formData.value = formData;
    formStorage.debouncedSaveData();
  }, [formData, formStorage]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const nextPage = () => {
    formStorage.saveData();
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
};

export default Page4;
