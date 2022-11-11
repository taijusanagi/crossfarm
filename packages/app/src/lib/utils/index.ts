export const truncate = (str: string | undefined, pre: number, post?: number) => {
  if (!str) {
    return "";
  }
  const _post = post || 0;
  const len = pre + _post;
  if (str.length <= len) {
    return str;
  }
  return `${str.substring(0, pre)}...${post ? str.substring(str.length - post) : ""}`;
};

export const getRandomNumber = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
};
