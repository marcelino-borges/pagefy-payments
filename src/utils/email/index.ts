export const getHTMLFooterByLanguage = (language: string) => {
  switch (language) {
    case "pt":
      return `Equipe Socialbio<br>
      <a href="https://socialbio.me">https://www.socialbio.me</a><br>
      <img src="https://firebasestorage.googleapis.com/v0/b/socialbio-41362.appspot.com/o/system%2Fimages%2Fbranding%2Flogo%2Fsocialbio-logo-whitebg-horizontal.jpg?alt=media&token=032a2436-2c7c-435e-acc0-7f3a420fd1d0" alt="Logo Socialbio" height="90px" />`;
    case "en":
      return `Socialbio Team<br>
        <a href="https://socialbio.me">https://www.socialbio.me</a><br>
        <img src="https://firebasestorage.googleapis.com/v0/b/socialbio-41362.appspot.com/o/system%2Fimages%2Fbranding%2Flogo%2Fsocialbio-logo-whitebg-horizontal.jpg?alt=media&token=032a2436-2c7c-435e-acc0-7f3a420fd1d0" alt="Logo Socialbio" height="90px" />`;
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
  <a style="background-color: #65C29B; padding: 8px 32px; color: white; text-decoration: none; border-radius: 19px; margin-bottom: 8px; margin-top: 8px;"
        onMouseOver="this.style.backgroundColor='#50a380'" onMouseOut="this.style.backgroundColor='#65C29B'"
        href="${href}">${text}</a>`;
};
