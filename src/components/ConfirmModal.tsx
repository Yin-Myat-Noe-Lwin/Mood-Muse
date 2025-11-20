import React from 'react';
import { Brain } from 'lucide-react';

type ConfirmModalProps = {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({ message, onConfirm, onCancel }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '30px',
          width: '400px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
          textAlign: 'center',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}
      >
        {/* Logo & title (non-clickable) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
          <Brain size={32} color="#7C3AED" /> {/* Purple-ish brain */}
          <span style={{ fontSize: '1.8rem', fontWeight: '700', color: '#4F46E5' }}>Moodmuse</span>
        </div>

        <p style={{ marginBottom: '25px', fontSize: '1.1rem' }}>{message}</p>

        <button
          onClick={onConfirm}
          style={{
            marginRight: '15px',
            padding: '12px 24px',
            backgroundColor: '#4F46E5',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          OK
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: '12px 24px',
            backgroundColor: '#E5E7EB',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ConfirmModal;
