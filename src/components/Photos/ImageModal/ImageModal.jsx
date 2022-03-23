import React, {memo} from "react";
import { Modal } from "react-bootstrap";


const ImageModal = ({img, show, hide}) => {

  return(
    <Modal show={show} onHide={hide}>
      <Modal.Header closeButton>
        <Modal.Title>{img.title || "My Image"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <img src={`https://live.staticflickr.com/${img.server}/${img.id}_${img.secret}.jpg`} className="img-fluid" alt="modal-content"/> 
      </Modal.Body>
    </Modal>
  );
}

export default memo(ImageModal);