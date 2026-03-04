import React from 'react';

export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    return (
        <button className={`btn btn-${variant} ${className}`} {...props}>
            {children}
        </button>
    );
};

export const Input = ({ label, type = 'text', id, ...props }) => {
    return (
        <div className="input-group">
            {label && <label htmlFor={id}>{label}</label>}
            <input
                type={type}
                id={id}
                className={type === 'color' ? 'input-color' : 'input-field'}
                {...props}
            />
        </div>
    );
};

export const Textarea = ({ label, id, ...props }) => {
    return (
        <div className="input-group">
            {label && <label htmlFor={id}>{label}</label>}
            <textarea
                id={id}
                className="input-field"
                rows="4"
                {...props}
            ></textarea>
        </div>
    );
};

export const Card = ({ children, className = '', ...props }) => {
    return (
        <div className={`glass-card ${className}`} {...props}>
            {children}
        </div>
    );
};

export const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>
                {children}
            </div>
        </div>
    );
};
