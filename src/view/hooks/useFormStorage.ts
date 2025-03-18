import { useEffect, useRef } from "react";
import FormStorage from "../utils/formStorage";

type TForm = (...args: any) => any;

const useFormStorage: TForm = (formId, formData, setFormData) => {
  const formStorage: any = useRef(
    new FormStorage(formId, { value: formData })
  ).current;

  console.log("first");

  useEffect(() => {
    formStorage.init();
    setFormData({ ...formStorage.formData.value });

    const syncFormData = (event: any) => {
      if (event.key === formStorage.storageKey && event.newValue) {
        setFormData(JSON.parse(event.newValue));
      }
    };

    window.addEventListener("storage", syncFormData);

    return () => {
      window.removeEventListener("storage", syncFormData);
    };
  }, [formStorage, setFormData]);

  useEffect(() => {
    formStorage.formData.value = formData;
    formStorage.debouncedSaveData();
  }, [formData, formStorage]);

  return formStorage;
};

export default useFormStorage;
