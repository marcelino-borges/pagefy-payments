export const getHTMLFooterByLanguage = (language: string) => {
  switch (language) {
    case "pt":
      return `Equipe Pagefy<br>
      <a href="${process.env.APP_URL}">${process.env.APP_URL}</a><br>
      <img src="${process.env.APP_LOGO_URL}" alt="Logo Pagefy" height="90px" />`;
    case "en":
      return `Pagefy Team<br>
        <a href="${process.env.APP_URL}">${process.env.APP_URL}</a><br>
        <a href="${process.env.APP_URL}"><img src="${process.env.APP_LOGO_URL}" alt="Logo Pagefy" height="90px" /></a><br>
        `;
  }
};

export const getHTMLBody = (content: string) => {
  return `
  <div style="background-color: #F7F9FC; width: 100%; display: flex; justify-content: center;">
    <div style="background-color: white; max-width: 700px; width: 100%; min-height: 400px;">
      ${content}
    </div>
  </div>`;
};

export const getHTMLButton = (href: string, text: string) => {
  return `
  <a style="background-color: #4335A7; padding: 8px 32px; color: white; text-decoration: none; border-radius: 19px; margin-bottom: 8px; margin-top: 8px;"
        onMouseOver="this.style.backgroundColor='#6456D1'" onMouseOut="this.style.backgroundColor='#4335A7'"
        href="${href}">${text}</a>`;
};
