import TaskForm from '../TaskForm.tsx'
import './Modal.css'

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Modal({ isOpen, onClose }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
        }}>
            <div className="modal-sheet">
                <div className="modal-header">
                    <h3>
                        Nueva <span className="highlight-orange">Tarea</span>
                    </h3>
                    <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Cerrar modal">✕</button>
                </div>
                <TaskForm onSuccess={onClose} />
            </div>
        </div>
    )
}
