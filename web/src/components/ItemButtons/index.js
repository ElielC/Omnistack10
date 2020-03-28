import React from "react";

import "./styles.css";

function ItemButtons({ dev }) {
  return (
    <div className="button-group">
      <button type="update">Atualizar</button>
      <button
        value={dev.github_username}
        type="delete"
      >
        Deletar
      </button>
    </div>
  );
}

export default ItemButtons;
