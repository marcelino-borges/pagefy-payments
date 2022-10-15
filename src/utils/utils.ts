export const replaceAllSpacesByUnderlines = (
  text: string,
  lowerCase: boolean = true
) => {
  let result = text.replace(new RegExp(" ", "g"), "_");
  if (lowerCase) result.toLowerCase();
  return result;
};
