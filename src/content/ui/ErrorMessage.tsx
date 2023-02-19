import React from "react"

export const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className="message message--error _mg-b-15">
    <span className="message__icon">
      <svg role="image" className="icon -medium">
        <use xlinkHref="/images/svg/sprite.symbol.svg#icon_alert"></use>
      </svg>
    </span>
    <div className="message__content">{message}</div>
  </div>
)
