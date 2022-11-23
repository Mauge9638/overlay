export const getCookie = (cookieName: string): string => {
  const name = cookieName + "=";
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    let currentCookie = cookies[i];
    while (currentCookie.charAt(0) == " ") {
      currentCookie = currentCookie.substring(1);
    }
    if (currentCookie.indexOf(name) == 0) {
      return currentCookie.substring(name.length, currentCookie.length);
    }
  }
  return "";
};

export const setCookie = async (
  cookieName: string,
  cookieValue: string,
  existDays: number
) => {
  const expiryDate = new Date();
  expiryDate.setTime(expiryDate.getTime() + existDays * 24 * 60 * 60 * 1000);
  let expires = "expires=" + expiryDate.toUTCString();
  document.cookie = cookieName + "=" + cookieValue + ";" + expires + ";path=/";
};
