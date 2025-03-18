interface IForm {
  value: Record<string, any>;
}

class StorageForm {
  private storageKey: string;
  private channel: BroadcastChannel = new BroadcastChannel("form_sync");
  debouncedSaveData = this.debounce(this.saveData, 3000).bind(this);

  constructor(private formId: string, private formData: IForm) {
    StorageFormManager.register(this);
    this.storageKey = `formData_${this.formId}`;

    this.channel.onmessage = (event: MessageEvent<string>) => {
      const { formId, data } = JSON.parse(event.data);

      if (formId === this.formId) {
        this.syncData(data);
      } else if (formId === "all") {
        this.clearData();
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

  saveData() {
    const data = JSON.stringify(this.formData.value);
    localStorage.setItem(this.storageKey, data);

    this.channel.postMessage(JSON.stringify({ formId: this.formId, data }));
  }

  clearData() {
    localStorage.removeItem(this.storageKey);
    this.channel.postMessage(
      JSON.stringify({ formId: this.formId, data: null })
    );
  }

  syncData(data: Record<string, any>) {
    if (!data) return;

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(this.formData.value, key))
        this.formData.value[key] = data[key];
    }
  }

  loadData() {
    const saveData = JSON.parse(
      localStorage.getItem(this.storageKey) || "null"
    );
    if (!saveData) return;

    for (const key in saveData) {
      if (Object.prototype.hasOwnProperty.call(this.formData.value, key))
        this.formData.value[key] = saveData[key];
    }
  }

  static clearAll() {
    const keysToRemove = Object.keys(localStorage).filter((key) =>
      key.startsWith("formData_")
    );

    keysToRemove.forEach((key) => {
      localStorage.removeCache(key);
    });

    const channel = new BroadcastChannel("form_sync");
    channel.postMessage(JSON.stringify({ formId: "all", data: null }));
  }
}

class StorageFormManager {
  private static instances: StorageForm[] = [];
  private static isInitialized = false;

  static register(instances: StorageForm) {
    StorageFormManager.instances.push(instances);

    if (StorageFormManager.isInitialized) return;

    window.addEventListener("beforeunload", StorageFormManager.saveAll);

    document.addEventListener(
      "visibilitychange",
      StorageFormManager.handleVisibilityChange
    );
  }

  private static saveAll() {
    StorageFormManager.instances.forEach((instances) => instances.saveData());
  }

  private static handleVisibilityChange() {
    if (document.visibilityState === "hidden") {
      StorageFormManager.saveAll();
    }
  }
}

export default StorageForm;
