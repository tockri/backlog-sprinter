import React from "react"

export type ModalProps = {
  children: React.ReactNode
  title: string
  size: "small" | "medium" | "large"
  additionalClass?: string
  onCloseEvent: () => void
}

export const Modal: React.FC<ModalProps> = (props) => {
  const { title, size, additionalClass, children, onCloseEvent } = props
  return (
    <div className="bsp-modal-wrapper">
      <div className="modal-membrane" onClick={onCloseEvent}></div>
      <div className={`modal modal--default -${size} ${additionalClass || ""} is_visible`}>
        <div className="modal__header">
          <h1 className="modal__title">{title}</h1>
          <button
            type="button"
            className="icon icon--close -medium -inverse modal__close bsp-closeModal"
            onClick={onCloseEvent}
          ></button>
        </div>
        <div className="bsp-modal-content">{children}</div>
      </div>
    </div>
  )
}
