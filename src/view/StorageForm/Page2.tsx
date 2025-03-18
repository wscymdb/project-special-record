import { useState } from "react";
import useFormStorage from "../hooks/useFormStorage";
import { useNavigate } from "react-router";

const Page2 = () => {
  const [formData, setFormData] = useState<Record<string, any>>({
    hobbies: [],
    favoriteColor: "",
    profession: "",
    likesTravel: "",
    introduction: "",
  });
  const navigate = useNavigate();

  const formStorage = useFormStorage("page2Form", formData, setFormData);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => {
      if (type === "checkbox") {
        const hobbies = [...prevData.hobbies];
        if (checked) {
          hobbies.push(value);
        } else {
          const index = hobbies.indexOf(value);
          if (index > -1) {
            hobbies.splice(index, 1);
          }
        }
        return {
          ...prevData,
          hobbies,
        };
      } else if (type === "radio") {
        return {
          ...prevData,
          [name]: value,
        };
      } else {
        return {
          ...prevData,
          [name]: value,
        };
      }
    });
  };

  const prevPage = () => {
    formStorage.saveData();
    navigate("/page1");
  };

  const nextPage = () => {
    formStorage.saveData();
    navigate("/page3");
  };

  return (
    <div className="container">
      <h1>问题页2</h1>
      <form id="page2Form">
        <div>
          <label>您的爱好：</label>
          <div>
            <label>
              <input
                type="checkbox"
                name="hobbies"
                value="reading"
                checked={formData.hobbies.includes("reading")}
                onChange={handleChange}
              />
              阅读
            </label>
            <label>
              <input
                type="checkbox"
                name="hobbies"
                value="sports"
                checked={formData.hobbies.includes("sports")}
                onChange={handleChange}
              />
              运动
            </label>
            <label>
              <input
                type="checkbox"
                name="hobbies"
                value="music"
                checked={formData.hobbies.includes("music")}
                onChange={handleChange}
              />
              音乐
            </label>
          </div>
        </div>
        <div>
          <label htmlFor="favoriteColor">您最喜欢的颜色：</label>
          <input
            name="favoriteColor"
            type="text"
            value={formData.favoriteColor}
            onChange={handleChange}
            placeholder="请填写您最喜欢的颜色"
          />
        </div>
        <div>
          <label htmlFor="profession">您的职业：</label>
          <input
            name="profession"
            type="text"
            value={formData.profession}
            onChange={handleChange}
            placeholder="请填写您的职业"
          />
        </div>
        <div>
          <label>您是否喜欢旅行：</label>
          <div>
            <label>
              <input
                type="radio"
                name="likesTravel"
                value="yes"
                checked={formData.likesTravel === "yes"}
                onChange={handleChange}
              />
              是
            </label>
            <label>
              <input
                type="radio"
                name="likesTravel"
                value="no"
                checked={formData.likesTravel === "no"}
                onChange={handleChange}
              />
              否
            </label>
          </div>
        </div>
        <div>
          <label htmlFor="introduction">请简要介绍一下自己：</label>
        </div>
        <textarea
          name="introduction"
          value={formData.introduction}
          onChange={handleChange}
          placeholder="请简要介绍一下自己"
          rows={4}
        ></textarea>
        <div className="button-group">
          <button type="button" onClick={prevPage}>
            上一页
          </button>
          <button type="button" onClick={nextPage}>
            下一页
          </button>
        </div>
      </form>
    </div>
  );
};

export default Page2;
