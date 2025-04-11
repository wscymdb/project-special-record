interface SyncFormDataVue {
  value: Record<string, any>;
}
type SyncFormDataReact = Record<string, any>;
type TType = "react" | "vue";
type FormDataType<T extends TType> = T extends "react"
  ? SyncFormDataReact
  : SyncFormDataVue;
interface SyncFormOptions<T extends TType> {
  type: T;
  formId: string;
  delay?: number;
  setFormData?: any;
}

/**
 * 核心逻辑
 * 1. init方法初始化表单数据 也就是从localStorage中获取数据
 * 2. 调用debouncedSaveData 方法 会把数据保存到localStorage中 然后广播信息
 * 3 其他表单接收到广播信息 会调用syncData方法 同步数据
 */

// 边界判断
const verifyValue = (type: TType, value: any) => {
  if (type === "vue" && !value?.value) {
    throw new Error("value is required for Vue type eg: {value:{}}");
  }

  if (type === "react" && typeof value !== "object") {
    throw new Error("value is required for React type eg: {}");
  }
};

class SyncForm<T extends TType> {
  public debouncedSaveData: () => void;
  private storageKey: string;
  private channel: BroadcastChannel = new BroadcastChannel("form_sync");
  public formData: FormDataType<T>;

  constructor(formData: FormDataType<T>, public options: SyncFormOptions<T>) {
    const { type, setFormData, formId, delay = 3000 } = this.options;

    if (type === "react" && !setFormData) {
      throw new Error("setFormData is required for React type");
    }

    // 边界判断
    verifyValue(type, formData);

    this.formData =
      this.options.type === "react"
        ? JSON.parse(JSON.stringify(formData))
        : formData;

    this.debouncedSaveData = this.debounce(this.saveData, delay).bind(this);

    SyncFormManager.register(this);

    this.storageKey = `formData_${formId}`;

    this.channel.onmessage = (event: MessageEvent<string>) => {
      const { formId: _formId, data } = JSON.parse(event.data);

      if (_formId === formId) {
        this.syncData(data);
      } else if (_formId === "all") {
        this.clearData();
      } else if (_formId === "clear") {
        this.resetValue();
      }
    };
  }

  init() {
    this.loadData();
  }

  private debounce<T extends (...args: any[]) => void>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timerId: ReturnType<typeof setTimeout> | undefined;
    return (...args: Parameters<T>) => {
      if (timerId) {
        clearTimeout(timerId);
      }

      timerId = setTimeout(() => func.apply(this, args), wait);
    };
  }

  public get value() {
    return this.options.type === "react" ? this.formData : this.formData.value;
  }

  public set value(value: FormDataType<T>) {
    if (this.options.type === "react") {
      this.formData = { ...this.formData, ...this.transInputValue(value) };
    } else if (this.options.type === "vue") {
      this.formData.value = {
        ...this.formData.value,
        ...this.transInputValue(value),
      };
    }
  }

  private transInputValue(value: FormDataType<T>) {
    if (typeof value === "object") {
      return value;
    }

    return this.options.type === "vue" ? { value } : value;
  }

  saveData() {
    const data = this.value;

    localStorage.setItem(this.storageKey, JSON.stringify(data));

    this.channel.postMessage(
      JSON.stringify({ formId: this.options.formId, data })
    );
  }

  private resetValue() {
    if (this.options.type === "react") {
      // 不直接 this.formData={}做的原因是因为如果使用的是antd的form 那么setFieldsValue这个方法是合并值而不是替换值
      const newValue: Record<string, any> = {};
      for (const key in this.formData) {
        newValue[key] = undefined;
      }

      this.formData = {} as FormDataType<T>;
      this.options.setFormData(newValue);
    } else if (this.options.type === "vue") {
      this.formData.value = {} as FormDataType<T>;
    }

    SyncFormManager.clearOne(this.options.formId);
  }

  clearData() {
    localStorage.removeItem(this.storageKey);
    this.resetValue();
    this.channel.postMessage(
      JSON.stringify({
        formId: "clear",
        data: null,
      })
    );
  }

  syncData(data: FormDataType<T>) {
    console.log(data);
    if (!data) return;

    // 不使用这种方式 this.value = { ...this.value, ...this.transInputValue(data) };原因
    // 兼容vue  因为vue的数据是响应式的 如果这样做每次都是赋值一个新的对象那么就会触发vue的watch(xx,{deep:true})
    // 那么Object.assign是在原有的对象上进行修改 虽然也会触发watch(xx,{deep:true})，但是当在输入框输入值的时候已经触发了watch(xx,{deep:true}) 那么这里在赋值的时候就不会触发watch(xx,{deep:true})
    // 假如数据是{name:''}
    // 1. 输入框输入值 数据变成{name:'1'}
    // 2.  触发watch(xx,{deep:true}) 会调用syncData 这里Object.assign又会改变数据为{name:'1'} 第二次改动的name和第一次一样所以不会触发watch(xx,{deep:true})

    Object.assign(this.value, this.transInputValue(data));
    if (this.options.type === "react") {
      this.options.setFormData(this.value);
    }
  }

  loadData() {
    const saveData = JSON.parse(
      localStorage.getItem(this.storageKey) || "null"
    );
    if (!saveData) return;

    Object.assign(this.value, this.transInputValue(saveData));

    if (this.options.type === "react") {
      this.options.setFormData(this.value);
    }
  }

  static clearAll() {
    const keysToRemove = Object.keys(localStorage).filter((key) =>
      key.startsWith("formData_")
    );

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });

    const channel = new BroadcastChannel("form_sync");
    channel.postMessage(JSON.stringify({ formId: "all", data: null }));
  }
}

class SyncFormManager {
  private static instances: SyncForm<any>[] = [];
  private static isInitialized = false;

  static register<T extends TType>(instances: SyncForm<T>) {
    // 防止有的组件会调用多次 那么formId就会重复 所以需要判断一下
    const same = SyncFormManager.instances.find(
      (item) => item.options.formId === instances.options.formId
    );
    if (same) {
      return;
    }

    SyncFormManager.instances.push(instances);

    if (!SyncFormManager.isInitialized) {
      window.addEventListener("beforeunload", SyncFormManager.saveAll);

      document.addEventListener(
        "visibilitychange",
        SyncFormManager.handleVisibilityChange
      );
      SyncFormManager.isInitialized = true;
    }
  }

  static clearOne(formId: string) {
    SyncFormManager.instances = SyncFormManager.instances.filter(
      (item) => item.options.formId !== formId
    );
  }

  private static saveAll() {
    SyncFormManager.instances.forEach((instances) => {
      instances.saveData();
    });
  }

  private static handleVisibilityChange() {
    if (document.visibilityState === "hidden") {
      SyncFormManager.saveAll();
    }
  }
}

export default SyncForm;
