export const validateWithXHR = (text: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (!text || text.trim() === "") {
      resolve(false);
      return;
    }

    const xhr = new XMLHttpRequest();

    xhr.open("HEAD", window.location.href);

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(true);
      } else {
        reject("Validation Network Error");
      }
    };

    xhr.onerror = () => reject("XHR Error");
    xhr.send();
  });
};
