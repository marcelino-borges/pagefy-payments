export const log = (...msgs: any) => {
  console.log(
    "\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"
  );
  msgs.forEach((msg: any) => {
    console.log(">> ", msg);
  });
  console.log(
    ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\n"
  );
};

export const replaceAllSpacesByUnderlines = (
  text: string,
  lowerCase: boolean = true
) => {
  let result = text.replace(new RegExp(" ", "g"), "_");
  if (lowerCase) result.toLowerCase();
  return result;
};
