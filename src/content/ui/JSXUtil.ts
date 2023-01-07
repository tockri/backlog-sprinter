import ReactDomServer from "react-dom/server"

export function jsxToElement<T extends HTMLElement = HTMLElement>(jsx: JSX.Element) {
  const wrapper = document.createElement("DIV")
  wrapper.innerHTML = ReactDomServer.renderToStaticMarkup(jsx)
  return wrapper.firstChild as T
}
