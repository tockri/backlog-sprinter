import styled from "@emotion/styled"
import React from "react"

export type ModalProps = {
  children: React.ReactNode
  title: string
  size: "small" | "medium" | "large"
  height?: string | number
  onClose: () => void
}

export const Modal: React.FC<ModalProps> = (props) => {
  const { title, size, children, onClose, height } = props
  const modalStyle: React.CSSProperties = height ? { height: height } : {}
  return (
    <Wrapper>
      <div className="modal-membrane" onClick={onClose}></div>
      <div className={`modal modal--default -${size} is_visible`} style={modalStyle}>
        <div className="modal__header">
          <h1 className="modal__title">{title}</h1>
          <button
            type="button"
            className="icon icon--close -medium -inverse modal__close bsp-closeModal"
            onClick={onClose}
          ></button>
        </div>
        <Content>{children}</Content>
      </div>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
`

const Content = styled.div({
  height: "calc(100% - 36px)"
})
